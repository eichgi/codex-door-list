-- Events and their sellable entry categories.

create type public.event_status as enum ('draft', 'published', 'deleted');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (title = btrim(title) and title <> ''),
  description text,
  starts_at timestamptz not null,
  venue text not null check (venue = btrim(venue) and venue <> ''),
  status public.event_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (name = btrim(name) and name <> ''),
  max_capacity integer not null check (max_capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create unique index ticket_types_event_id_name_key
  on public.ticket_types (event_id, lower(name));

create index events_owner_id_idx on public.events (owner_id);
create index events_published_starts_at_idx
  on public.events (starts_at)
  where status = 'published';
create index ticket_types_event_id_idx on public.ticket_types (event_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger ticket_types_set_updated_at
before update on public.ticket_types
for each row execute function public.set_updated_at();


alter table public.events enable row level security;
alter table public.ticket_types enable row level security;

revoke all on table public.events from anon, authenticated;
revoke all on table public.ticket_types from anon, authenticated;

grant select on table public.events to anon;
grant select, insert, update on table public.events to authenticated;
grant select on table public.ticket_types to anon;
grant select, insert, update, delete on table public.ticket_types to authenticated;

create policy "Published events are publicly readable"
on public.events for select
to anon, authenticated
using (status = 'published');

create policy "Organizers can read their events"
on public.events for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "Organizers can create events"
on public.events for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "Organizers can update their events"
on public.events for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));


create policy "Ticket types of published events are publicly readable"
on public.ticket_types for select
to anon, authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.status = 'published'
  )
);

create policy "Organizers can read ticket types for their events"
on public.ticket_types for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Organizers can create ticket types for their events"
on public.ticket_types for insert
to authenticated
with check (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Organizers can update ticket types for their events"
on public.ticket_types for update
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Organizers can delete ticket types for their events"
on public.ticket_types for delete
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = ticket_types.event_id
      and events.owner_id = (select auth.uid())
  )
);

