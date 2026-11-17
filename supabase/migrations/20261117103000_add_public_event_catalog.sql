-- Public catalogue data exposes only event availability needed to choose an event.
-- Attendee identities remain unavailable to anonymous visitors.

create or replace function public.get_public_event_catalog(p_query text default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', event_row.id,
        'title', event_row.title,
        'description', event_row.description,
        'starts_at', event_row.starts_at,
        'venue', event_row.venue,
        'status', event_row.status,
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
            group by ticket_type_id
          ) as registration_totals on registration_totals.ticket_type_id = ticket_type.id
          where ticket_type.event_id = event_row.id
        )
      )
      order by event_row.starts_at
    ),
    '[]'::jsonb
  )
  from public.events as event_row
  where event_row.status = 'published'
    and (event_row.starts_at at time zone 'America/Mexico_City')::date
      >= (now() at time zone 'America/Mexico_City')::date
    and (
      nullif(btrim(p_query), '') is null
      or event_row.title ilike '%' || btrim(p_query) || '%'
      or event_row.venue ilike '%' || btrim(p_query) || '%'
    );
$$;

revoke all on function public.get_public_event_catalog(text) from public;
grant execute on function public.get_public_event_catalog(text) to anon, authenticated;
