-- The Art Studio — add the missing primary-key `id` columns.
--
-- ROOT CAUSE: the tables were created without an `id` column. The app addresses
-- rows by id everywhere — getWorkshop/update/delete (.eq("id", …)), insert().
-- select().single() (needs the generated id back), the workshop→session join,
-- the booking RPCs (p_booking_id → bookings.id), and site_settings (id = 1).
--
-- This migration adds:
--   workshops, workshop_sessions, gallery_images, bookings → id uuid PK
--   site_settings                                          → id int singleton (= 1)
--
-- Idempotent: safe to run repeatedly and whether or not `id` already exists.
-- Apply alongside 0004 (which aligns the workshop_sessions date/time columns).
--
-- NOTE: admin_users is matched by `email` (not id), so it is intentionally left
-- untouched here.

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ---------------------------------------------- uuid id + PK on the content tables
do $$
declare
  t text;
begin
  foreach t in array array['workshops', 'workshop_sessions', 'gallery_images', 'bookings']
  loop
    -- Add the column (existing rows get a fresh uuid from the default).
    execute format(
      'alter table %I add column if not exists id uuid default gen_random_uuid()', t);
    -- Belt-and-suspenders: fill any pre-existing nulls.
    execute format('update %I set id = gen_random_uuid() where id is null', t);

    -- Make it the primary key only if the table has no primary key yet.
    if not exists (
      select 1
      from pg_index i
      join pg_class c on c.oid = i.indrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = t and i.indisprimary
    ) then
      execute format('alter table %I alter column id set not null', t);
      execute format('alter table %I add constraint %I primary key (id)', t, t || '_pkey');
    end if;
  end loop;
end
$$;

-- -------------------------------------------------- site_settings singleton (id = 1)
do $$
declare
  v_rows int;
begin
  alter table site_settings add column if not exists id int;
  alter table site_settings alter column id set default 1;

  select count(*) into v_rows from site_settings;

  if v_rows <= 1 then
    -- Pin the single (or soon-to-exist) row to id = 1.
    update site_settings set id = 1 where id is distinct from 1;

    if not exists (
      select 1 from pg_index i
      join pg_class c on c.oid = i.indrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'site_settings' and i.indisprimary
    ) then
      alter table site_settings alter column id set not null;
      alter table site_settings add constraint site_settings_pkey primary key (id);
    end if;

    if not exists (select 1 from pg_constraint where conname = 'site_settings_singleton') then
      alter table site_settings add constraint site_settings_singleton check (id = 1);
    end if;
  else
    raise notice
      'site_settings has % rows (expected 0 or 1). Leaving id as-is — reconcile to a single id=1 row manually.',
      v_rows;
  end if;
end
$$;

-- Ensure the singleton row exists (getSettings expects exactly one row at id = 1).
-- Wrapped so a NOT NULL column without a default can't abort the migration; if it
-- raises, seed site_settings via the admin Settings page or insert columns manually.
do $$
begin
  if not exists (select 1 from site_settings where id = 1) then
    begin
      insert into site_settings (id) values (1);
    exception when others then
      raise notice 'Could not auto-seed site_settings(id=1): %. Seed it via the app or manually.', sqlerrm;
    end;
  end if;
end
$$;
