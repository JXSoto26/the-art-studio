/**
 * Domain types for the admin CMS.
 *
 * Field names use snake_case to match a typical Postgres/Supabase schema, so
 * the eventual swap from the mock DataService to a Supabase-backed one needs
 * no shape translation in the UI layer.
 */

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "all";

export type WorkshopCategory =
  | "painting"
  | "ceramics"
  | "printmaking"
  | "textiles";

export interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  duration_minutes: number;
  category: WorkshopCategory;
  skill_level: SkillLevel;
  image_url: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload accepted when creating/updating a workshop (no server-managed fields). */
export type WorkshopInput = Omit<
  Workshop,
  "id" | "created_at" | "updated_at"
>;

export interface WorkshopSession {
  id: string;
  workshop_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  capacity: number;
  available_spots: number;
}

export type WorkshopSessionInput = Omit<WorkshopSession, "id">;

export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  featured: boolean;
  display_order: number;
  created_at: string;
}

export type GalleryItemInput = Omit<GalleryItem, "id" | "created_at">;

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "paid";

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  /** Null for a general contact inquiry not tied to a specific workshop. */
  workshop_id: string | null;
  /** Null for a general contact inquiry not tied to a specific session. */
  session_id: string | null;
  participants: number;
  status: BookingStatus;
  /** Free-text message from a contact inquiry (subject + body); null otherwise. */
  notes: string | null;
  created_at: string;
}

export type BookingInput = Omit<Booking, "id" | "created_at">;

/**
 * A public booking request for a specific workshop session. Handled atomically
 * by the data layer (`DataService.bookSession`): validate availability, create
 * a pending booking, and decrement the session's spots in one operation.
 */
export interface SessionBookingRequest {
  workshopId: string;
  sessionId: string;
  name: string;
  email: string;
  phone: string;
  participants: number;
  notes: string;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  whatsapp_number: string;
  email: string;
  address: string;
  business_hours: string;
  instagram_url: string;
}

/** The authenticated admin user (mock). */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
}
