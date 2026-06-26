-- The Art Studio — align site_settings columns with the app + seed the singleton.
--
-- ROOT CAUSE: site_settings was created without the content columns the app's
-- SiteSettings type expects, so seeding/saving failed with:
--   column "hero_title" of relation "site_settings" does not exist
-- and `id` had no unique/PK constraint, so an ON CONFLICT (id) seed failed with:
--   42P10: there is no unique or exclusion constraint matching the ON CONFLICT
--
-- This brings site_settings to the shape the app uses:
--   id int (default 1) with a UNIQUE constraint, plus the eight text columns.
-- It seeds the singleton WITHOUT relying on ON CONFLICT, so it works regardless
-- of what (if any) primary key the table currently has. Idempotent & non-destructive.

-- 1. Singleton id column (the app reads/writes site_settings at id = 1).
alter table site_settings add column if not exists id int;
alter table site_settings alter column id set default 1;

-- 2. Content columns the app reads/writes (SiteSettings type). Defaults keep any
--    existing rows valid under NOT NULL.
alter table site_settings add column if not exists hero_title      text not null default '';
alter table site_settings add column if not exists hero_subtitle   text not null default '';
alter table site_settings add column if not exists hero_image_url  text not null default '';
alter table site_settings add column if not exists whatsapp_number text not null default '';
alter table site_settings add column if not exists email           text not null default '';
alter table site_settings add column if not exists address         text not null default '';
alter table site_settings add column if not exists business_hours  text not null default '';
alter table site_settings add column if not exists instagram_url   text not null default '';

-- 3. If there's exactly one row, pin it to id = 1.
do $$
begin
  if (select count(*) from site_settings) = 1 then
    update site_settings set id = 1 where id is distinct from 1;
  end if;
end
$$;

-- 4. Give `id` a UNIQUE constraint so the app's upsert can conflict-target it
--    (and getSettings always reads at most one id = 1 row). Tolerant of re-runs.
do $$
begin
  alter table site_settings add constraint site_settings_id_key unique (id);
exception
  when duplicate_object then null;  -- constraint already exists (re-run)
  when unique_violation then
    raise notice 'site_settings.id has duplicate values — reconcile to one row per id, then re-run.';
end
$$;

-- 5. Ensure the singleton row exists. No ON CONFLICT, so it needs no constraint.
do $$
begin
  if not exists (select 1 from site_settings where id = 1) then
    insert into site_settings (id) values (1);
  end if;
end
$$;

-- 6. Seed starter content only if the row is still blank (won't clobber edits).
update site_settings
set hero_title    = 'Make something beautiful by hand.',
    hero_subtitle = 'A warm, light-filled studio for small-group classes and immersive workshops.',
    email         = 'hello@theartstudio.com'
where id = 1 and hero_title = '';
