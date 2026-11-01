-- An email can hold at most one registration per event, independently of the
-- selected ticket type. Trimming and lower-casing make the comparison stable.
create unique index ticket_sales_event_email_registration_key
  on public.ticket_sales (event_id, lower(btrim(buyer_email)))
  where buyer_email is not null;

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
exception
  when unique_violation then
    raise exception using errcode = 'P0001', message = 'EMAIL_ALREADY_REGISTERED';
end;
$$;
