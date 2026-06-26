-- The Art Studio — align workshop_sessions columns with the app.
--
-- ROOT CAUSE: the app (TypeScript types + mock + Supabase data service) expects
-- workshop_sessions to expose:
--     date        date    (YYYY-MM-DD)
--     start_time  text    (HH:MM)
--     end_time    text    (HH:MM)
-- but the deployed table used start_at / end_at (timestamptz), so queries like
-- `select ... order by date` failed with: column workshop_sessions.date does not exist.
--
-- This migration brings the table to the app's shape. It is idempotent and safe
-- to run whether or not the legacy columns are present (Option A: align the DB to
-- the code; no application code changes, both mock and Supabase modes keep working).

-- 1. Ensure the columns the app expects exist.
alter table workshop_sessions add column if not exists date            date;
alter table workshop_sessions add column if not exists start_time      text;
alter table workshop_sessions add column if not exists end_time        text;
alter table workshop_sessions add column if not exists capacity        int;
alter table workshop_sessions add column if not exists available_spots int;

-- 2. Backfill date/start_time/end_time from legacy start_at/end_at, then drop them.
--    Wall-clock values are rendered in the database's time zone (UTC by default
--    on Supabase). If your start_at values were stored with a non-UTC offset,
--    spot-check a few rows after running and adjust if needed (see notes below).
do $$
declare
  has_start_at boolean;
  has_end_at   boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workshop_sessions'
      and column_name = 'start_at'
  ) into has_start_at;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'workshop_sessions'
      and column_name = 'end_at'
  ) into has_end_at;

  if has_start_at then
    execute $sql$
      update workshop_sessions
      set date       = coalesce(date, (start_at)::date),
          start_time = coalesce(start_time, to_char(start_at, 'HH24:MI'))
      where start_at is not null
    $sql$;
    alter table workshop_sessions drop column start_at;
  end if;

  if has_end_at then
    execute $sql$
      update workshop_sessions
      set end_time = coalesce(end_time, to_char(end_at, 'HH24:MI'))
      where end_at is not null
    $sql$;
    alter table workshop_sessions drop column end_at;
  end if;
end
$$;

-- 3. (Optional, belt-and-suspenders) keep available_spots sane. Enabled only if
--    no existing row violates it, so the migration can't fail on dirty data.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'available_spots_within_capacity'
  )
  and not exists (
    select 1 from workshop_sessions
    where available_spots < 0 or available_spots > capacity
  ) then
    alter table workshop_sessions
      add constraint available_spots_within_capacity
      check (available_spots >= 0 and available_spots <= capacity);
  end if;
end
$$;
