-- The Art Studio — defense-in-depth: admin-guard the cancel/delete booking RPCs.
--
-- Apply AFTER 0002 (is_admin() must already exist). These `create or replace`
-- definitions add an admin check at the top of each function, so that even if
-- execute grants or RLS policies are loosened later, only admins can cancel or
-- delete bookings through these RPCs. Replacing a function preserves its grants,
-- so the anon-revoke / authenticated-grant from 0002 stay in effect.
--
-- create_booking_and_decrement_spots and create_inquiry are intentionally NOT
-- guarded — public visitors need them for booking and contact inquiries.
--
-- is_admin() reads the request JWT (auth.jwt()), which is populated per-request
-- regardless of SECURITY DEFINER, so the check reflects the real caller.

-- ----------------------------------------------- cancel_booking_and_restore_spots
create or replace function cancel_booking_and_restore_spots(p_booking_id uuid)
returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

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

-- ----------------------------------------------- delete_booking_and_restore_spots
create or replace function delete_booking_and_restore_spots(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking bookings;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

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
