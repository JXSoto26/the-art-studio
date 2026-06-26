import type {
  Booking,
  BookingInput,
  BookingStatus,
  GalleryItem,
  GalleryItemInput,
  SessionBookingRequest,
  SiteSettings,
  Workshop,
  WorkshopInput,
  WorkshopSession,
  WorkshopSessionInput,
} from "./types";
import {
  seedBookings,
  seedGallery,
  seedSessions,
  seedSettings,
  seedWorkshops,
} from "./mockData";
import { createSupabaseDataService } from "./supabaseDataService";
import { getSupabaseClient } from "../supabase";

/**
 * The single seam between the UI and the backend.
 *
 * Today this is implemented by `createMockDataService` (in-memory + localStorage).
 * To move to Supabase later, write `createSupabaseDataService(client)` that
 * implements this same interface and swap the export at the bottom of the file —
 * no page or component needs to change.
 */
export interface DataService {
  // Workshops
  listWorkshops(): Promise<Workshop[]>;
  getWorkshop(id: string): Promise<Workshop | null>;
  createWorkshop(input: WorkshopInput): Promise<Workshop>;
  updateWorkshop(id: string, input: WorkshopInput): Promise<Workshop>;
  deleteWorkshop(id: string): Promise<void>;

  // Sessions
  listSessions(): Promise<WorkshopSession[]>;
  createSession(input: WorkshopSessionInput): Promise<WorkshopSession>;
  updateSession(
    id: string,
    input: WorkshopSessionInput,
  ): Promise<WorkshopSession>;
  deleteSession(id: string): Promise<void>;

  // Gallery
  listGallery(): Promise<GalleryItem[]>;
  createGalleryItem(input: GalleryItemInput): Promise<GalleryItem>;
  updateGalleryItem(id: string, input: GalleryItemInput): Promise<GalleryItem>;
  deleteGalleryItem(id: string): Promise<void>;

  // Bookings
  listBookings(): Promise<Booking[]>;
  createBooking(input: BookingInput): Promise<Booking>;
  /**
   * Book a workshop session atomically: validate availability, create a pending
   * booking, and decrement the session's `available_spots` in one operation.
   * Rejects if the session is gone or has too few spots.
   */
  bookSession(request: SessionBookingRequest): Promise<Booking>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;

  // Settings
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: SiteSettings): Promise<SiteSettings>;
}

/* ------------------------------------------------------------------ helpers */

const STORAGE_KEY = "tas_admin_db_v1";

interface Db {
  workshops: Workshop[];
  sessions: WorkshopSession[];
  gallery: GalleryItem[];
  bookings: Booking[];
  settings: SiteSettings;
}

function freshDb(): Db {
  return {
    workshops: structuredClone(seedWorkshops),
    sessions: structuredClone(seedSessions),
    gallery: structuredClone(seedGallery),
    bookings: structuredClone(seedBookings),
    settings: structuredClone(seedSettings),
  };
}

/**
 * Return a cancelled/deleted booking's participants to its session, never
 * exceeding the session's capacity. No-op for general inquiries (null session)
 * or sessions that no longer exist. Centralizes the inventory-restore rule so
 * cancel and delete stay consistent.
 */
function restoreSessionSpots(db: Db, booking: Booking): void {
  if (!booking.session_id) return;
  const session = db.sessions.find((s) => s.id === booking.session_id);
  if (!session) return;
  session.available_spots = Math.min(
    session.capacity,
    session.available_spots + booking.participants,
  );
}

function uid(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Simulate network latency so loading states are real and exercised. */
function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/* ------------------------------------------------------- mock implementation */

function createMockDataService(): DataService {
  function load(): Db {
    if (typeof localStorage === "undefined") return freshDb();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const db = freshDb();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        return db;
      }
      return JSON.parse(raw) as Db;
    } catch {
      return freshDb();
    }
  }

  function save(db: Db): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  return {
    // Workshops -----------------------------------------------------------
    listWorkshops: () => delay(load().workshops),

    getWorkshop: (id) =>
      delay(load().workshops.find((w) => w.id === id) ?? null),

    createWorkshop: (input) => {
      const db = load();
      const ts = nowIso();
      const workshop: Workshop = {
        ...input,
        id: uid("ws"),
        created_at: ts,
        updated_at: ts,
      };
      db.workshops.unshift(workshop);
      save(db);
      return delay(workshop);
    },

    updateWorkshop: (id, input) => {
      const db = load();
      const idx = db.workshops.findIndex((w) => w.id === id);
      if (idx === -1) return Promise.reject(new Error("Workshop not found"));
      const updated: Workshop = {
        ...db.workshops[idx],
        ...input,
        id,
        updated_at: nowIso(),
      };
      db.workshops[idx] = updated;
      save(db);
      return delay(updated);
    },

    deleteWorkshop: (id) => {
      const db = load();
      db.workshops = db.workshops.filter((w) => w.id !== id);
      // Cascade: remove sessions belonging to the workshop.
      db.sessions = db.sessions.filter((s) => s.workshop_id !== id);
      save(db);
      return delay(undefined);
    },

    // Sessions ------------------------------------------------------------
    listSessions: () => delay(load().sessions),

    createSession: (input) => {
      const db = load();
      const session: WorkshopSession = { ...input, id: uid("se") };
      db.sessions.push(session);
      save(db);
      return delay(session);
    },

    updateSession: (id, input) => {
      const db = load();
      const idx = db.sessions.findIndex((s) => s.id === id);
      if (idx === -1) return Promise.reject(new Error("Session not found"));
      const updated: WorkshopSession = { ...input, id };
      db.sessions[idx] = updated;
      save(db);
      return delay(updated);
    },

    deleteSession: (id) => {
      const db = load();
      db.sessions = db.sessions.filter((s) => s.id !== id);
      save(db);
      return delay(undefined);
    },

    // Gallery -------------------------------------------------------------
    listGallery: () =>
      delay(
        [...load().gallery].sort((a, b) => a.display_order - b.display_order),
      ),

    createGalleryItem: (input) => {
      const db = load();
      const item: GalleryItem = {
        ...input,
        id: uid("gal"),
        created_at: nowIso(),
      };
      db.gallery.push(item);
      save(db);
      return delay(item);
    },

    updateGalleryItem: (id, input) => {
      const db = load();
      const idx = db.gallery.findIndex((g) => g.id === id);
      if (idx === -1) return Promise.reject(new Error("Gallery item not found"));
      const updated: GalleryItem = { ...db.gallery[idx], ...input, id };
      db.gallery[idx] = updated;
      save(db);
      return delay(updated);
    },

    deleteGalleryItem: (id) => {
      const db = load();
      db.gallery = db.gallery.filter((g) => g.id !== id);
      save(db);
      return delay(undefined);
    },

    // Bookings ------------------------------------------------------------
    listBookings: () =>
      delay(
        [...load().bookings].sort((a, b) =>
          b.created_at.localeCompare(a.created_at),
        ),
      ),

    createBooking: (input) => {
      const db = load();
      const booking: Booking = {
        ...input,
        id: uid("bk"),
        created_at: nowIso(),
      };
      db.bookings.unshift(booking);
      save(db);
      return delay(booking);
    },

    bookSession: (request) => {
      const db = load();
      const session = db.sessions.find((s) => s.id === request.sessionId);
      if (!session) {
        return Promise.reject(
          new Error("That session is no longer available."),
        );
      }
      if (!Number.isInteger(request.participants) || request.participants < 1) {
        return Promise.reject(
          new Error("Please choose at least one participant."),
        );
      }
      if (request.participants > session.available_spots) {
        return Promise.reject(
          new Error(
            session.available_spots > 0
              ? `Only ${session.available_spots} spot${
                  session.available_spots === 1 ? "" : "s"
                } left for this session.`
              : "This session is fully booked.",
          ),
        );
      }

      // Create the booking and decrement spots in a single load/save so the two
      // writes can't diverge — the in-memory equivalent of the Supabase RPC.
      const booking: Booking = {
        customer_name: request.name.trim(),
        customer_email: request.email.trim(),
        customer_phone: request.phone.trim(),
        workshop_id: request.workshopId,
        session_id: request.sessionId,
        participants: request.participants,
        status: "pending",
        notes: request.notes.trim() ? request.notes.trim() : null,
        id: uid("bk"),
        created_at: nowIso(),
      };
      db.bookings.unshift(booking);
      session.available_spots -= request.participants;
      save(db);
      return delay(booking);
    },

    updateBookingStatus: (id, status) => {
      const db = load();
      const idx = db.bookings.findIndex((b) => b.id === id);
      if (idx === -1) return Promise.reject(new Error("Booking not found"));
      const prev = db.bookings[idx];
      // Restore inventory when a still-live booking is cancelled — once only.
      if (status === "cancelled" && prev.status !== "cancelled") {
        restoreSessionSpots(db, prev);
      }
      db.bookings[idx] = { ...prev, status };
      save(db);
      return delay(db.bookings[idx]);
    },

    deleteBooking: (id) => {
      const db = load();
      const booking = db.bookings.find((b) => b.id === id);
      // A non-cancelled booking still holds its spots; cancelled ones already
      // gave theirs back, so don't restore twice.
      if (booking && booking.status !== "cancelled") {
        restoreSessionSpots(db, booking);
      }
      db.bookings = db.bookings.filter((b) => b.id !== id);
      save(db);
      return delay(undefined);
    },

    // Settings ------------------------------------------------------------
    getSettings: () => delay(load().settings),

    updateSettings: (settings) => {
      const db = load();
      db.settings = settings;
      save(db);
      return delay(settings);
    },
  };
}

/**
 * Active data service, chosen at build time by the VITE_USE_SUPABASE flag:
 *   - "true"  → Supabase backend (real Postgres + transactional RPCs)
 *   - else    → in-memory mock backed by localStorage (the default)
 *
 * Components and providers import `dataService` and stay unaware of which one is
 * live. The Supabase client is built lazily, so mock mode needs no Supabase env.
 */
export const dataService: DataService =
  import.meta.env.VITE_USE_SUPABASE === "true"
    ? createSupabaseDataService(getSupabaseClient())
    : createMockDataService();

/** Exposed for a future "reset demo data" affordance / tests. */
export function resetMockData(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
