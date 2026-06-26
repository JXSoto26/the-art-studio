/**
 * Presentation helpers that turn admin domain types (snake_case, numeric,
 * normalized) into the strings and visuals the public design expects.
 *
 * These keep mapping logic out of the public components so the markup stays
 * focused on layout. They reuse the shared formatters in `../format`.
 */

import { formatCurrency, formatDate, formatDuration } from "../format";
import type {
  SkillLevel,
  Workshop,
  WorkshopSession,
} from "../admin/types";

/** Human label for a workshop's skill level (e.g. "All levels", "Beginner"). */
export function skillLevelLabel(level: SkillLevel): string {
  if (level === "all") return "All levels";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

/**
 * Brand-gradient fallback used as an image stand-in when a gallery item or
 * workshop has no `image_url` yet. Keyed by category so the wall stays varied.
 */
const TONE_BY_CATEGORY: Record<string, string> = {
  painting: "from-olive/80 via-olive/40 to-beige",
  ceramics: "from-clay/80 via-clay/40 to-ivory",
  printmaking: "from-ink/70 via-clay/30 to-beige",
  textiles: "from-beige via-clay/40 to-olive/50",
};

const TONE_FALLBACK = "from-clay/60 via-olive/30 to-ivory";

export function toneForCategory(category: string): string {
  return TONE_BY_CATEGORY[category] ?? TONE_FALLBACK;
}

/** Title-case a category slug for display (e.g. "printmaking" -> "Printmaking"). */
export function categoryLabel(category: string): string {
  return category
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Active workshops, suitable for the public schedule. */
export function activeWorkshops(workshops: Workshop[]): Workshop[] {
  return workshops.filter((w) => w.is_active);
}

/** The active workshop matching a slug, or undefined (inactive treated as absent). */
export function findWorkshopBySlug(
  workshops: Workshop[],
  slug: string,
): Workshop | undefined {
  return workshops.find((w) => w.slug === slug && w.is_active);
}

/** A workshop's upcoming sessions (today onward), earliest first. */
export function upcomingSessionsForWorkshop(
  sessions: WorkshopSession[],
  workshopId: string,
): WorkshopSession[] {
  const today = new Date().toISOString().slice(0, 10);
  return sessions
    .filter((s) => s.workshop_id === workshopId && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** "Jul 8, 2026 · 6:00pm–8:00pm" style label for a session. */
export function sessionLabel(session: WorkshopSession): string {
  return `${formatDate(session.date)} · ${session.start_time}–${session.end_time}`;
}

/** Active + featured workshops, for the homepage highlight section. */
export function featuredWorkshops(workshops: Workshop[]): Workshop[] {
  return workshops.filter((w) => w.is_active && w.featured);
}

/**
 * Formatted date of the next upcoming session for a workshop, or "" when none
 * are scheduled. Date-only strings (YYYY-MM-DD) sort lexicographically, so a
 * string compare against today is sufficient.
 */
export function nextSessionDate(
  workshopId: string,
  sessions: WorkshopSession[],
): string {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = sessions
    .filter((s) => s.workshop_id === workshopId && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming.length ? formatDate(upcoming[0].date) : "";
}

/** Display-ready view of a workshop for the public cards. */
export interface WorkshopCardView {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  level: string;
  duration: string;
  /** Formatted next-session date, or "" if nothing is scheduled. */
  begins: string;
}

export function toWorkshopCard(
  workshop: Workshop,
  sessions: WorkshopSession[],
): WorkshopCardView {
  return {
    id: workshop.id,
    slug: workshop.slug,
    title: workshop.title,
    description: workshop.description,
    shortDescription: workshop.short_description,
    price: formatCurrency(workshop.price),
    level: skillLevelLabel(workshop.skill_level),
    duration: formatDuration(workshop.duration_minutes),
    begins: nextSessionDate(workshop.id, sessions),
  };
}
