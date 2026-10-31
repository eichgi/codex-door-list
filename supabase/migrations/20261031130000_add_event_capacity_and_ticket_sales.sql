alter table public.events
add column max_capacity integer;

alter table public.events
add constraint events_max_capacity_positive check (max_capacity > 0) not valid;

update public.events
set max_capacity = greatest(
  1,
  coalesce((select sum(max_capacity) from public.ticket_types where ticket_types.event_id = events.id), 0)
);

alter table public.events
alter column max_capacity set not null,
validate constraint events_max_capacity_positive;

create table public.ticket_sales (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types (id) on delete cascade,
  buyer_name text not null check (buyer_name = btrim(buyer_name) and buyer_name <> ''),
  buyer_email text,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ticket_sales_event_id_idx on public.ticket_sales (event_id);
create index ticket_sales_ticket_type_id_idx on public.ticket_sales (ticket_type_id);

create trigger ticket_sales_set_updated_at
before update on public.ticket_sales
for each row execute function public.set_updated_at();

create function public.enforce_ticket_type_capacity()
returns trigger language plpgsql set search_path = '' as $$
declare event_limit integer; allocated integer; sold integer;
begin
  select max_capacity into event_limit from public.events where id = new.event_id for update;
  select coalesce(sum(max_capacity), 0) into allocated from public.ticket_types where event_id = new.event_id and (tg_op = 'INSERT' or id <> new.id);
  if allocated + new.max_capacity > event_limit then raise exception 'El aforo de los tipos de entrada supera el límite del evento'; end if;
  if tg_op = 'UPDATE' then
    select coalesce(sum(quantity), 0) into sold from public.ticket_sales where ticket_type_id = new.id;
    if new.max_capacity < sold then raise exception 'El aforo no puede ser menor que las entradas ya vendidas'; end if;
  end if;
  return new;
end; $$;

create trigger ticket_types_capacity_guard before insert or update of event_id, max_capacity on public.ticket_types for each row execute function public.enforce_ticket_type_capacity();

create function public.enforce_event_capacity()
returns trigger language plpgsql set search_path = '' as $$
declare allocated integer;
begin
  select coalesce(sum(max_capacity), 0) into allocated from public.ticket_types where event_id = new.id;
  if allocated > new.max_capacity then raise exception 'El límite del evento no puede ser menor al aforo asignado'; end if;
  return new;
end; $$;

create trigger events_capacity_guard before update of max_capacity on public.events for each row execute function public.enforce_event_capacity();

create function public.enforce_sale_capacity()
returns trigger language plpgsql set search_path = '' as $$
declare type_event uuid; type_limit integer; already_sold integer;
begin
  select event_id, max_capacity into type_event, type_limit from public.ticket_types where id = new.ticket_type_id for update;
  if type_event is null or type_event <> new.event_id then raise exception 'El tipo de entrada no pertenece al evento'; end if;
  select coalesce(sum(quantity), 0) into already_sold from public.ticket_sales where ticket_type_id = new.ticket_type_id and (tg_op = 'INSERT' or id <> new.id);
  if already_sold + new.quantity > type_limit then raise exception 'La venta supera el aforo disponible para este tipo de entrada'; end if;
  return new;
end; $$;

create trigger ticket_sales_capacity_guard before insert or update of ticket_type_id, event_id, quantity on public.ticket_sales for each row execute function public.enforce_sale_capacity();

alter table public.ticket_sales enable row level security;
revoke all on table public.ticket_sales from anon, authenticated;
grant select, insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.ticket_sales to authenticated;

create policy "Organizers can delete their events" on public.events for delete to authenticated using (owner_id = (select auth.uid()));
create policy "Organizers can manage sales for their events" on public.ticket_sales for all to authenticated
using (exists (select 1 from public.events where events.id = ticket_sales.event_id and events.owner_id = (select auth.uid())))
with check (exists (select 1 from public.events where events.id = ticket_sales.event_id and events.owner_id = (select auth.uid())));
