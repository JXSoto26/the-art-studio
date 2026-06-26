# Unify the public site onto `dataService`

**Date:** 2026-06-26
**Status:** Approved
**Scope:** Make the public website read its dynamic content from the same mock/localStorage `dataService` the admin CMS uses, so admin edits to workshops, gallery, and site settings are reflected on the public pages.

## Goal

The admin CMS becomes the **source of truth for dynamic public content**. Today the public site renders hardcoded data from `src/lib/content.ts`, while the admin manages a separate dataset via `dataService`. Editing a workshop in the admin has zero effect on what visitors see. This work closes that gap without introducing a real backend.

## Non-goals (explicitly out of scope)

- Supabase or any real backend (keep the existing mock/localStorage `dataService`).
- Real authentication.
- Payments.
- Public booking flow.
- Contact form backend (form stays a no-op success state).
- Major visual redesign — preserve the current look.

## Constraints

- Keep using the current mock/localStorage `dataService` and the existing domain types in `src/lib/admin/types.ts`.
- Preserve the current visual design.
- Avoid large rewrites.
- Keep static marketing content that has no CMS model (class-discipline copy, nav links) in `content.ts`.

## Architecture

### `PublicDataProvider` (new)

A React context that mirrors the existing `AdminDataProvider`. It wraps the public `RootLayout` and:

- On mount, loads `workshops`, `sessions`, `gallery`, and `settings` once via `dataService` (`Promise.all`).
- Derives `featuredWorkshops` (= `is_active && featured`).
- Exposes `{ workshops, featuredWorkshops, gallery, sessions, settings, loading, error }`.

Public components read through a `usePublicData()` hook and never touch `dataService` directly. `settings` reaches Navbar, Footer, Hero, and Contact with no prop drilling.

**Freshness:** `RootLayout` unmounts when the user navigates to `/admin`, so returning to the public site remounts `PublicDataProvider` and re-reads localStorage, picking up admin edits made during the session. Within a single mount the data is not live-refreshed — an acceptable gap for a mock layer.

### Display mapping (new `src/lib/public/display.ts`)

Pure functions that turn domain types into the strings/visuals the current design expects:

- **Workshops**
  - `activeWorkshops(workshops)` → filter `is_active`.
  - `featuredWorkshops` → `is_active && featured`.
  - Price → `formatCurrency(price)`.
  - Duration → `formatDuration(duration_minutes)`.
  - Skill level → label: `beginner|intermediate|advanced` titleCased; `all` → `"All levels"`.
  - "Begins" line → earliest **upcoming** session date for the workshop (`sessions` joined by `workshop_id`, date >= today, formatted via `formatDate`); empty string when none.
- **Gallery**
  - Displayable items sorted by `display_order`.
  - Caption → titleCased `category` (replaces old `medium`); `artist` dropped (no CMS field).
  - Tile → `image_url` when present, else a brand-gradient fallback mapped from `category` (reusing the existing tone palette from the old `galleryPieces`).
- **Settings** → consumed directly by Hero (title/subtitle), Contact (address/email/phone/hours), Footer (address/hours/Instagram).

### Shared formatting helpers

Move `src/lib/admin/format.ts` → `src/lib/format.ts` (pure presentation utilities now used by both halves) and update the 5 admin imports. Avoids a backwards public → admin dependency.

### `content.ts` — static marketing only

Keeps `classCategories` (discipline marketing copy, no CMS model) and `navLinks`. Removes the now-superseded dynamic arrays `featuredWorkshops` and `galleryPieces` plus their `Workshop` / `GalleryPiece` types, which are replaced by `dataService` data and `admin/types`.

## Loading / empty / error states

Each dynamic section renders:

- **Loading:** a lightweight skeleton/placeholder matching the section's card grid.
- **Empty:** a quiet message when a filtered list is empty (e.g. "No workshops scheduled yet.").
- **Error:** an unobtrusive notice when `error` is set.

Static hero and marketing copy always render, so a page never looks broken while data loads.

## Files

**New (3)**
- `src/lib/public/PublicDataProvider.tsx`
- `src/lib/public/display.ts`
- `src/lib/format.ts` (moved from `src/lib/admin/format.ts`)

**Edited**
- `src/components/layout/RootLayout.tsx` — wrap with `PublicDataProvider`.
- `src/components/home/Hero.tsx` — settings-driven hero copy.
- `src/components/home/FeaturedWorkshops.tsx` — featured workshops from context.
- `src/components/home/GalleryPreview.tsx` — gallery from context.
- `src/pages/ClassesPage.tsx` — active workshops from context (disciplines stay static).
- `src/pages/GalleryPage.tsx` — gallery from context.
- `src/pages/ContactPage.tsx` — settings-driven contact details.
- `src/components/layout/Footer.tsx` — settings-driven address/hours/Instagram.
- `src/components/layout/Navbar.tsx` — confirm; only changes if it needs settings (likely none).
- `src/lib/content.ts` — remove superseded dynamic data/types.
- 5 admin files — update `format` import path.

**Unchanged**
- `src/components/home/ClassCategories.tsx` — keeps static `classCategories`.

## Verification

- `npm run build` (tsc + vite) passes.
- `npm run lint` (oxlint) stays clean (existing fast-refresh warnings acceptable).
- Manual: editing a workshop's `is_active`/`featured`/price in admin, then returning to the public site, reflects the change.
