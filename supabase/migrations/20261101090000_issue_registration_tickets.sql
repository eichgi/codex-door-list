-- Issue one unguessable ticket for every registration and expose only exact,
-- token-based public lookups. Ticket rows are never directly readable by anon.

create type public.ticket_status as enum ('valid', 'used', 'revoked');

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_sale_id uuid not null unique references public.ticket_sales (id) on delete cascade,
  code text not null unique check (code ~ '^[0-9a-f]{64}$'),
  status public.ticket_status not null default 'valid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tickets_set_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

alter table public.tickets enable row level security;
revoke all on table public.tickets from anon, authenticated;
grant select on table public.tickets to authenticated;
grant update (status) on table public.tickets to authenticated;

create policy "Organizers can read tickets for their events"
on public.tickets for select
to authenticated
using (
  exists (
    select 1
    from public.ticket_sales
    join public.events on events.id = ticket_sales.event_id
    where ticket_sales.id = tickets.ticket_sale_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Organizers can update tickets for their events"
on public.tickets for update
to authenticated
using (
  exists (
    select 1
    from public.ticket_sales
    join public.events on events.id = ticket_sales.event_id
    where ticket_sales.id = tickets.ticket_sale_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.ticket_sales
    join public.events on events.id = ticket_sales.event_id
    where ticket_sales.id = tickets.ticket_sale_id
      and events.owner_id = (select auth.uid())
  )
);

create function public.issue_ticket_for_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket_code text;
begin
  loop
    ticket_code := replace(gen_random_uuid()::text, '-', '')
      || replace(gen_random_uuid()::text, '-', '');
    begin
      insert into public.tickets (ticket_sale_id, code)
      values (new.id, ticket_code);
      return new;
    exception
      when unique_violation then
        -- Retry the astronomically unlikely random-code collision. A duplicate
        -- ticket_sale_id cannot occur for a freshly inserted registration.
        null;
    end;
  end loop;
end;
$$;

create trigger ticket_sales_issue_ticket
after insert on public.ticket_sales
for each row execute function public.issue_ticket_for_registration();

-- Preserve the invariant for registrations that predate this migration.
insert into public.tickets (ticket_sale_id, code)
select
  ticket_sale.id,
  replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
from public.ticket_sales as ticket_sale;

drop function public.register_for_event(uuid, uuid, text, text);

create function public.register_for_event(
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
  sold integer;
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
    from public.ticket_sales
    where event_id = p_event_id
      and lower(btrim(buyer_email)) = clean_email
  ) then
    raise exception using errcode = 'P0001', message = 'EMAIL_ALREADY_REGISTERED';
  end if;

  select coalesce(sum(quantity), 0)::integer into sold
  from public.ticket_sales
  where ticket_type_id = p_ticket_type_id;

  if sold >= selected_type.max_capacity then
    raise exception using errcode = 'P0001', message = 'TICKET_UNAVAILABLE';
  end if;

  begin
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

revoke all on function public.register_for_event(uuid, uuid, text, text) from public;
grant execute on function public.register_for_event(uuid, uuid, text, text) to anon, authenticated;

create function public.get_public_ticket(p_code text)
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
      'attendee_name', sale.buyer_name,
      'attendee_email', sale.buyer_email,
      'ticket_type', ticket_type.name,
      'event_title', event_row.title,
      'event_venue', event_row.venue,
      'event_starts_at', event_row.starts_at
    )
    from public.tickets as ticket
    join public.ticket_sales as sale on sale.id = ticket.ticket_sale_id
    join public.ticket_types as ticket_type on ticket_type.id = sale.ticket_type_id
    join public.events as event_row on event_row.id = sale.event_id
    where ticket.code = p_code
  );
end;
$$;

revoke all on function public.get_public_ticket(text) from public;
grant execute on function public.get_public_ticket(text) to anon, authenticated;
