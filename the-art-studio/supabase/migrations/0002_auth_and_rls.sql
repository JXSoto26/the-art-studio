-- The Art Studio — admin auth gating + tightened RLS.
--
-- Apply AFTER 0001 (or after the equivalent objects already in your project).
-- This migration:
--   1. Adds is_admin(): is the current JWT user an admin? (matched by email)
--   2. Adds create_inquiry(): lets anonymous visitors submit contact inquiries
--      without any direct table access.
--   3. Replaces the permissive demo policies with tight ones:
--        - public/anon: SELECT active workshops + their sessions, gallery, settings
--        - admins: full INSERT/UPDATE/DELETE on all content + bookings
--        - public booking & inquiry creation only via SECURITY DEFINER RPCs
--   4. Restricts cancel/delete booking RPCs to authenticated callers.
--
-- ASSUMPTION: public.admin_users has an `email` column whose value matches the
-- Supabase Auth user's email. Seed it with your owner account (see bottom).
--
-- If your project already has custom policies under different names, review and
-- drop them so only the tight policies below remain in force (RLS is OR-ed).

-- ============================================================ helper: is_admin
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users a
    where a.email = (auth.jwt() ->> 'email')
  );
$$;

grant execute on function is_admin() to anon, authenticated;

-- ===================================================== anonymous inquiry path
-- A general contact inquiry: a pending booking with no workshop/session. Runs as
-- SECURITY DEFINER so anon never needs INSERT/SELECT on the bookings table.
create or replace function create_inquiry(
  p_customer_name  text,
  p_customer_email text,
  p_customer_phone text,
  p_notes          text
) returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  insert into bookings (
    customer_name, customer_email, customer_phone,
    workshop_id, session_id, participants, status, notes
  ) values (
    p_customer_name, p_customer_email, coalesce(p_customer_phone, ''),
    null, null, 1, 'pending', nullif(p_notes, '')
  )
  returning * into v_booking;
  return v_booking;
end;
$$;

grant execute on function create_inquiry(text, text, text, text) to anon, authenticated;

-- ================================================================ admin_users
alter table admin_users enable row level security;

drop policy if exists "admins read own row" on admin_users;
create policy "admins read own row" on admin_users
  for select to authenticated
  using (email = (auth.jwt() ->> 'email'));

-- ================================================================== workshops
alter table workshops enable row level security;

drop policy if exists "demo write workshops" on workshops;
drop policy if exists "public read workshops" on workshops;

-- Public sees active workshops; admins see all (so they can manage drafts).
create policy "read active or admin workshops" on workshops
  for select using (is_active or is_admin());
create policy "admin write workshops" on workshops
  for all to authenticated using (is_admin()) with check (is_admin());

-- ========================================================== workshop_sessions
alter table workshop_sessions enable row level security;

drop policy if exists "demo write sessions" on workshop_sessions;
drop policy if exists "public read sessions" on workshop_sessions;

-- Public sees sessions of active workshops; admins see all.
create policy "read sessions of active or admin" on workshop_sessions
  for select using (
    is_admin()
    or exists (
      select 1 from workshops w
      where w.id = workshop_sessions.workshop_id and w.is_active
    )
  );
create policy "admin write sessions" on workshop_sessions
  for all to authenticated using (is_admin()) with check (is_admin());

-- ============================================================= gallery_images
alter table gallery_images enable row level security;

drop policy if exists "demo write gallery" on gallery_images;
drop policy if exists "public read gallery" on gallery_images;

create policy "public read gallery" on gallery_images
  for select using (true);
create policy "admin write gallery" on gallery_images
  for all to authenticated using (is_admin()) with check (is_admin());

-- ============================================================== site_settings
alter table site_settings enable row level security;

drop policy if exists "demo write settings" on site_settings;
drop policy if exists "public read settings" on site_settings;

create policy "public read settings" on site_settings
  for select using (true);
create policy "admin write settings" on site_settings
  for all to authenticated using (is_admin()) with check (is_admin());

-- =================================================================== bookings
alter table bookings enable row level security;

drop policy if exists "demo manage bookings" on bookings;

-- Only admins read/manage bookings directly. Public creation happens through the
-- SECURITY DEFINER RPCs (create_booking_and_decrement_spots, create_inquiry),
-- which bypass RLS — so no anon table policy is required.
create policy "admin manage bookings" on bookings
  for all to authenticated using (is_admin()) with check (is_admin());

-- ============================================================ RPC execute grants
-- Public may book a session and submit inquiries; cancel/delete are admin tasks.
grant execute on function create_booking_and_decrement_spots(uuid, uuid, text, text, text, int, text) to anon, authenticated;
revoke execute on function cancel_booking_and_restore_spots(uuid) from anon;
revoke execute on function delete_booking_and_restore_spots(uuid) from anon;
grant  execute on function cancel_booking_and_restore_spots(uuid) to authenticated;
grant  execute on function delete_booking_and_restore_spots(uuid) to authenticated;

-- =====================================================================
-- Creating the first owner admin
-- =====================================================================
-- 1. Create the auth user (Supabase Dashboard → Authentication → Users → "Add
--    user", set email + password and mark Auto Confirm), or via SQL admin API.
-- 2. Add a matching admin_users row keyed by that email, e.g.:
--
--      insert into admin_users (email, name)
--      values ('owner@theartstudio.com', 'Studio Owner')
--      on conflict (email) do nothing;
--
--    (Adjust column list to your admin_users schema — `email` is the field this
--     migration matches on.)
