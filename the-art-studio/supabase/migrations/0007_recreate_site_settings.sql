-- The Art Studio — recreate site_settings in the shape the app expects.
--
-- WHY: the existing site_settings was created as a key/value-style table (a
-- NOT NULL `key` column, etc.), not the wide single-row table the app uses.
-- Patching columns onto it keeps tripping legacy NOT NULL columns:
--   23502: null value in column "key" of relation "site_settings" ...
--
-- site_settings holds a single row of configuration (no critical data), so the
-- clean fix is to drop and recreate it with exactly the columns the SiteSettings
-- type needs, reseed the singleton, and restore RLS. This SUPERSEDES 0006 for
-- site_settings — if you ran (or tried) 0006, just run this; no need to re-run 0006.
--
-- PREREQUISITE: is_admin() from 0002 must already exist (it gates admin writes).

drop table if exists site_settings cascade;

create table site_settings (
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

-- Seed the singleton row with starter content.
insert into site_settings (id, hero_title, hero_subtitle, email)
values (
  1,
  'Make something beautiful by hand.',
  'A warm, light-filled studio for small-group classes and immersive workshops.',
  'hello@theartstudio.com'
);

-- Restore RLS: public can read; only admins can write (matches 0002).
alter table site_settings enable row level security;

create policy "public read settings" on site_settings
  for select using (true);

create policy "admin write settings" on site_settings
  for all to authenticated
  using (is_admin()) with check (is_admin());
