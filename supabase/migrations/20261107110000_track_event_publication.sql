-- Track the publication instant used as the starting point for dashboard metrics.

alter table public.events
add column published_at timestamptz;

update public.events
set published_at = least(
  updated_at,
  coalesce(
    (
      select min(registrations.created_at)
      from public.registrations
      where registrations.event_id = events.id
    ),
    updated_at
  )
)
where status = 'published';

create function public.set_event_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'published' then
      new.published_at = now();
    else
      new.published_at = null;
    end if;

    return new;
  end if;

  if new.status = 'published' and old.status <> 'published' then
    new.published_at = now();
  elsif new.published_at is distinct from old.published_at then
    new.published_at = old.published_at;
  end if;

  return new;
end;
$$;

create trigger events_set_published_at
before insert or update of status, published_at on public.events
for each row execute function public.set_event_published_at();
