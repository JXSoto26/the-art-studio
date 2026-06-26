-- The Art Studio — Supabase schema reference.
--
-- REFERENCE ONLY: the live project already has these tables, RLS, and RPCs.
-- This file documents the contract the TypeScript service in
-- src/lib/admin/supabaseDataService.ts expects. If the deployed objects differ
-- (especially RPC argument names / return types), reconcile the two.
--
-- Mirrors the domain types in src/lib/admin/types.ts (snake_case columns map
-- 1:1 to the TypeScript fields). Booking inventory is transactional via the
-- RPCs at the bottom (names match the deployed functions):
--   create_booking_and_decrement_spots — validate spots, insert, decrement, in one tx
--   cancel_booking_and_restore_spots   — restore spots (capped) and set status cancelled
--   delete_booking_and_restore_spots   — restore spots for non-cancelled, then delete

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------------------------- workshops
create table if not exists workshops (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  description       text not null default '',
  short_description text not null default '',
  price             numeric not null default 0 check (price >= 0),
  duration_minutes  int not null default 0 check (duration_minutes >= 0),
  category          text not null check (category in ('painting','ceramics','printmaking','textiles')),
  skill_level       text not null check (skill_level in ('beginner','intermediate','advanced','all')),
  image_url         text not null default '',
  is_active         boolean not null default true,
  featured          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -------------------------------------------------------- workshop_sessions
create table if not exists workshop_sessions (
  id              uuid primary key default gen_random_uuid(),
  workshop_id     uuid not null references workshops(id) on delete cascade,
  date            date not null,
  start_time      text not null,
  end_time        text not null,
  capacity        int not null check (capacity >= 0),
  available_spots int not null,
  -- Inventory can never oversell or exceed the session's capacity.
  constraint available_spots_within_capacity
    check (available_spots >= 0 and available_spots <= capacity)
);

create index if not exists workshop_sessions_workshop_id_idx
  on workshop_sessions (workshop_id);

-- ----------------------------------------------------------- gallery_images
create table if not exists gallery_images (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  image_url     text not null default '',
  category      text not null default '',
  featured      boolean not null default false,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------- bookings
-- workshop_id / session_id are nullable: a general contact inquiry has neither.
-- ON DELETE SET NULL keeps inquiry/booking history if a workshop is removed.
create table if not exists bookings (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  customer_email text not null,
  customer_phone text not null default '',
  workshop_id    uuid references workshops(id) on delete set null,
  session_id     uuid references workshop_sessions(id) on delete set null,
  participants   int not null default 1 check (participants >= 1),
  status         text not null default 'pending'
                   check (status in ('pending','confirmed','cancelled','paid')),
  notes          text,
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------- site_settings
-- Single-row (singleton) table: id is pinned to 1.
create table if not exists site_settings (
  id              int primary key default 1 check (id = 1),
  hero_title      text not null default '',
  hero_subtitle   text not null default '',
  hero_image_url  text not null default '',
  whatsapp_number text not null default '',
  email           text not null default '',
  address         text not null default '',
  business_hours  text not null default '',
  instagram_url   text not null default ''
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ========================================================================
-- Transactional inventory RPCs
-- ========================================================================

-- Book a session atomically: lock the row, validate spots, insert the booking,
-- decrement availability. Raises a clear error the client surfaces verbatim.
create or replace function create_booking_and_decrement_spots(
  p_workshop_id    uuid,
  p_session_id     uuid,
  p_customer_name  text,
  p_customer_email text,
  p_customer_phone text,
  p_participants   int,
  p_notes          text
) returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_spots   int;
  v_booking bookings;
begin
  if p_participants is null or p_participants < 1 then
    raise exception 'Please choose at least one participant.';
  end if;

  select available_spots into v_spots
  from workshop_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'That session is no longer available.';
  end if;

  if p_participants > v_spots then
    if v_spots > 0 then
      raise exception 'Only % spot(s) left for this session.', v_spots;
    else
      raise exception 'This session is fully booked.';
    end if;
  end if;

  insert into bookings (
    customer_name, customer_email, customer_phone,
    workshop_id, session_id, participants, status, notes
  ) values (
    p_customer_name, p_customer_email, p_customer_phone,
    p_workshop_id, p_session_id, p_participants, 'pending', nullif(p_notes, '')
  )
  returning * into v_booking;

  update workshop_sessions
  set available_spots = available_spots - p_participants
  where id = p_session_id;

  return v_booking;
end;
$$;

-- Cancel a booking, restoring its spots to the session once (capped at
-- capacity). No-op restore for inquiries (null session) or already-cancelled.
create or replace function cancel_booking_and_restore_spots(p_booking_id uuid)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  select * into v_booking from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status <> 'cancelled' and v_booking.session_id is not null then
    update workshop_sessions
    set available_spots = least(capacity, available_spots + v_booking.participants)
    where id = v_booking.session_id;
  end if;

  update bookings set status = 'cancelled'
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Delete a booking, restoring spots first for non-cancelled bookings (cancelled
-- ones already returned theirs, so we never restore twice).
create or replace function delete_booking_and_restore_spots(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  select * into v_booking from bookings where id = p_booking_id for update;
  if not found then
    return;
  end if;

  if v_booking.status <> 'cancelled' and v_booking.session_id is not null then
    update workshop_sessions
    set available_spots = least(capacity, available_spots + v_booking.participants)
    where id = v_booking.session_id;
  end if;

  delete from bookings where id = p_booking_id;
end;
$$;

-- ========================================================================
-- Row Level Security
--
-- NOTE: admin auth is still the app-side mock (no Supabase Auth yet), so admin
-- writes arrive on the anon key. These policies are permissive to keep the demo
-- working end-to-end. TIGHTEN THESE once Supabase Auth replaces the mock login:
-- restrict workshops/sessions/gallery/settings writes (and booking management)
-- to authenticated staff, leaving only public read + the book_session RPC open.
-- ========================================================================
alter table workshops        enable row level security;
alter table workshop_sessions enable row level security;
alter table gallery_images   enable row level security;
alter table bookings         enable row level security;
alter table site_settings    enable row level security;

create policy "public read workshops"  on workshops        for select using (true);
create policy "public read sessions"   on workshop_sessions for select using (true);
create policy "public read gallery"    on gallery_images   for select using (true);
create policy "public read settings"   on site_settings    for select using (true);

-- Demo-only blanket write access (see NOTE above).
create policy "demo write workshops"   on workshops        for all using (true) with check (true);
create policy "demo write sessions"    on workshop_sessions for all using (true) with check (true);
create policy "demo write gallery"     on gallery_images   for all using (true) with check (true);
create policy "demo write settings"    on site_settings    for all using (true) with check (true);
create policy "demo manage bookings"   on bookings         for all using (true) with check (true);

-- The booking RPCs run as SECURITY DEFINER; allow the public roles to call them.
grant execute on function create_booking_and_decrement_spots(uuid, uuid, text, text, text, int, text) to anon, authenticated;
grant execute on function cancel_booking_and_restore_spots(uuid) to anon, authenticated;
grant execute on function delete_booking_and_restore_spots(uuid) to anon, authenticated;
