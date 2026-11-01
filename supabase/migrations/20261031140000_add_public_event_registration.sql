-- Public event registration. Availability is read without exposing attendee PII,
-- and registration is checked and inserted atomically in the database.

drop policy "Published events are publicly readable" on public.events;
create policy "Current published events are publicly readable"
on public.events for select
to anon, authenticated
using (
  status = 'published'
  and (starts_at at time zone 'America/Mexico_City')::date
    >= (now() at time zone 'America/Mexico_City')::date
);

drop policy "Ticket types of published events are publicly readable" on public.ticket_types;
create policy "Ticket types of current published events are publicly readable"
on public.ticket_types for select
to anon, authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.status = 'published'
      and (events.starts_at at time zone 'America/Mexico_City')::date
        >= (now() at time zone 'America/Mexico_City')::date
  )
);

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
            'remaining', greatest(ticket_type.max_capacity - coalesce(sales.sold, 0), 0)
          )
          order by ticket_type.name
        ),
        '[]'::jsonb
      )
      from public.ticket_types as ticket_type
      left join (
        select ticket_type_id, sum(quantity)::integer as sold
        from public.ticket_sales
        where event_id = p_event_id
        group by ticket_type_id
      ) as sales on sales.ticket_type_id = ticket_type.id
      where ticket_type.event_id = event_row.id
    )
  )
  from public.events as event_row
  where event_row.id = p_event_id
    and event_row.status = 'published'
    and (event_row.starts_at at time zone 'America/Mexico_City')::date
      >= (now() at time zone 'America/Mexico_City')::date;
$$;

revoke all on function public.get_public_event_registration(uuid) from public;
grant execute on function public.get_public_event_registration(uuid) to anon, authenticated;

create or replace function public.register_for_event(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_buyer_name text,
  p_buyer_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_type public.ticket_types%rowtype;
  selected_event public.events%rowtype;
  sold integer;
  registration_id uuid;
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

  -- Match the lock order used by ticket type updates: type first, then event.
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

  select coalesce(sum(quantity), 0)::integer into sold
  from public.ticket_sales
  where ticket_type_id = p_ticket_type_id;

  if sold >= selected_type.max_capacity then
    raise exception using errcode = 'P0001', message = 'TICKET_UNAVAILABLE';
  end if;

  insert into public.ticket_sales (
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

  return registration_id;
end;
$$;

revoke all on function public.register_for_event(uuid, uuid, text, text) from public;
grant execute on function public.register_for_event(uuid, uuid, text, text) to anon, authenticated;
