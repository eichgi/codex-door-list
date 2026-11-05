-- A ticket sale row represents an attendee registration. Rename the entity and
-- every database object that carried the previous vocabulary.

alter table public.ticket_sales rename to registrations;

alter table public.registrations rename constraint ticket_sales_pkey to registrations_pkey;
alter table public.registrations rename constraint ticket_sales_event_id_fkey to registrations_event_id_fkey;
alter table public.registrations rename constraint ticket_sales_ticket_type_id_fkey to registrations_ticket_type_id_fkey;
alter table public.registrations rename constraint ticket_sales_buyer_name_check to registrations_buyer_name_check;
alter table public.registrations rename constraint ticket_sales_quantity_check to registrations_quantity_check;

alter table public.tickets rename constraint tickets_ticket_sale_id_key to tickets_registration_key;
alter table public.tickets rename constraint tickets_ticket_sale_id_fkey to tickets_registration_fkey;

alter index public.ticket_sales_event_id_idx rename to registrations_event_id_idx;
alter index public.ticket_sales_ticket_type_id_idx rename to registrations_ticket_type_id_idx;
alter index public.ticket_sales_event_email_registration_key rename to registrations_event_email_key;

alter trigger ticket_sales_set_updated_at on public.registrations rename to registrations_set_updated_at;
alter trigger ticket_sales_capacity_guard on public.registrations rename to registrations_capacity_guard;
alter trigger ticket_sales_issue_ticket on public.registrations rename to registrations_issue_ticket;

alter function public.enforce_sale_capacity() rename to enforce_registration_capacity;

alter policy "Organizers can manage sales for their events"
on public.registrations
rename to "Organizers can manage registrations for their events";

alter policy "Organizers can manage registrations for their events"
on public.registrations
using (
  exists (
    select 1
    from public.events
    where events.id = registrations.event_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.events
    where events.id = registrations.event_id
      and events.owner_id = (select auth.uid())
  )
);

alter policy "Organizers can read tickets for their events"
on public.tickets
using (
  exists (
    select 1
    from public.registrations
    join public.events on events.id = registrations.event_id
    where registrations.id = tickets.ticket_sale_id
      and events.owner_id = (select auth.uid())
  )
);

alter policy "Organizers can update tickets for their events"
on public.tickets
using (
  exists (
    select 1
    from public.registrations
    join public.events on events.id = registrations.event_id
    where registrations.id = tickets.ticket_sale_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.registrations
    join public.events on events.id = registrations.event_id
    where registrations.id = tickets.ticket_sale_id
      and events.owner_id = (select auth.uid())
  )
);

create or replace function public.enforce_ticket_type_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  event_limit integer;
  allocated integer;
  registered integer;
begin
  select max_capacity into event_limit
  from public.events
  where id = new.event_id
  for update;

  select coalesce(sum(max_capacity), 0) into allocated
  from public.ticket_types
  where event_id = new.event_id
    and (tg_op = 'INSERT' or id <> new.id);

  if allocated + new.max_capacity > event_limit then
    raise exception 'El aforo de los tipos de entrada supera el límite del evento';
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(sum(quantity), 0) into registered
    from public.registrations
    where ticket_type_id = new.id;

    if new.max_capacity < registered then
      raise exception 'El aforo no puede ser menor que las entradas ya emitidas';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_registration_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  type_event uuid;
  type_limit integer;
  already_registered integer;
begin
  select event_id, max_capacity into type_event, type_limit
  from public.ticket_types
  where id = new.ticket_type_id
  for update;

  if type_event is null or type_event <> new.event_id then
    raise exception 'El tipo de entrada no pertenece al evento';
  end if;

  select coalesce(sum(quantity), 0) into already_registered
  from public.registrations
  where ticket_type_id = new.ticket_type_id
    and (tg_op = 'INSERT' or id <> new.id);

  if already_registered + new.quantity > type_limit then
    raise exception 'La inscripción supera el aforo disponible para este tipo de entrada';
  end if;

  return new;
end;
$$;

create or replace function public.get_public_event_registration(p_event_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', event_row.id,
    'title', event_row.title,
    'description', event_row.description,
    'starts_at', event_row.starts_at,
    'venue', event_row.venue,
    'ticket_types', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', ticket_type.id,
            'name', ticket_type.name,
            'remaining', greatest(ticket_type.max_capacity - coalesce(registration_totals.registered, 0), 0)
          )
          order by ticket_type.name
        ),
        '[]'::jsonb
      )
      from public.ticket_types as ticket_type
      left join (
        select ticket_type_id, sum(quantity)::integer as registered
        from public.registrations
        where event_id = p_event_id
        group by ticket_type_id
      ) as registration_totals on registration_totals.ticket_type_id = ticket_type.id
      where ticket_type.event_id = event_row.id
    )
  )
  from public.events as event_row
  where event_row.id = p_event_id
    and event_row.status = 'published'
    and (event_row.starts_at at time zone 'America/Mexico_City')::date
      >= (now() at time zone 'America/Mexico_City')::date;
$$;

create or replace function public.register_for_event(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_buyer_name text,
  p_buyer_email text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_type public.ticket_types%rowtype;
  selected_event public.events%rowtype;
  registered integer;
  registration_id uuid;
  ticket_code text;
  clean_name text := btrim(coalesce(p_buyer_name, ''));
  clean_email text := lower(btrim(coalesce(p_buyer_email, '')));
begin
  if char_length(clean_name) < 2 or char_length(clean_name) > 120 then
    raise exception using errcode = 'P0001', message = 'INVALID_NAME';
  end if;

  if char_length(clean_email) > 254
    or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    raise exception using errcode = 'P0001', message = 'INVALID_EMAIL';
  end if;

  select * into selected_type
  from public.ticket_types
  where id = p_ticket_type_id and event_id = p_event_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'TICKET_TYPE_INVALID';
  end if;

  select * into selected_event
  from public.events
  where id = p_event_id
  for update;

  if not found
    or selected_event.status <> 'published'
    or (selected_event.starts_at at time zone 'America/Mexico_City')::date
      < (now() at time zone 'America/Mexico_City')::date then
    raise exception using errcode = 'P0001', message = 'EVENT_UNAVAILABLE';
  end if;

  if exists (
    select 1
    from public.registrations
    where event_id = p_event_id
      and lower(btrim(buyer_email)) = clean_email
  ) then
    raise exception using errcode = 'P0001', message = 'EMAIL_ALREADY_REGISTERED';
  end if;

  select coalesce(sum(quantity), 0)::integer into registered
  from public.registrations
  where ticket_type_id = p_ticket_type_id;

  if registered >= selected_type.max_capacity then
    raise exception using errcode = 'P0001', message = 'TICKET_UNAVAILABLE';
  end if;

  begin
    insert into public.registrations (
      event_id,
      ticket_type_id,
      buyer_name,
      buyer_email,
      quantity
    ) values (
      p_event_id,
      p_ticket_type_id,
      clean_name,
      clean_email,
      1
    )
    returning id into registration_id;
  exception
    when unique_violation then
      raise exception using errcode = 'P0001', message = 'EMAIL_ALREADY_REGISTERED';
  end;

  select code into strict ticket_code
  from public.tickets
  where ticket_sale_id = registration_id;

  return ticket_code;
end;
$$;

create or replace function public.get_public_ticket(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_code is null or p_code !~ '^[0-9a-f]{64}$' then
    return null;
  end if;

  return (
    select jsonb_build_object(
      'code', ticket.code,
      'status', ticket.status,
      'attendee_name', registration.buyer_name,
      'attendee_email', registration.buyer_email,
      'ticket_type', ticket_type.name,
      'event_title', event_row.title,
      'event_venue', event_row.venue,
      'event_starts_at', event_row.starts_at
    )
    from public.tickets as ticket
    join public.registrations as registration on registration.id = ticket.ticket_sale_id
    join public.ticket_types as ticket_type on ticket_type.id = registration.ticket_type_id
    join public.events as event_row on event_row.id = registration.event_id
    where ticket.code = p_code
  );
end;
$$;
