import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { DataService } from "./dataService";
import type {
  Booking,
  GalleryItem,
  SiteSettings,
  Workshop,
  WorkshopSession,
} from "./types";

/**
 * Supabase-backed implementation of the same `DataService` interface used by the
 * mock. No UI component or provider knows which one is active — the swap happens
 * once at the bottom of `dataService.ts` via the VITE_USE_SUPABASE flag.
 *
 * Snake_case domain types already match the Postgres columns, so rows map 1:1.
 * Booking inventory (decrement on book, restore on cancel/delete) is delegated to
 * the project's transactional RPCs named in `RPC` below.
 *
 * NOTE: the RPC *parameter* names below (p_customer_name, p_session_id, …) and
 * return shapes must match the deployed functions. If a function uses different
 * argument names, update only the keys in the `.rpc(...)` payloads here.
 */

/** Single-row settings table is keyed by a fixed id. */
const SETTINGS_ID = 1;

/** Names of the deployed Postgres functions handling booking inventory. */
const RPC = {
  createBooking: "create_booking_and_decrement_spots",
  createInquiry: "create_inquiry",
  cancelBooking: "cancel_booking_and_restore_spots",
  deleteBooking: "delete_booking_and_restore_spots",
} as const;

function fail(error: PostgrestError): never {
  throw new Error(error.message);
}

/** Unwrap a list query, throwing the Postgrest error message on failure. */
function rows<T>(res: { data: T[] | null; error: PostgrestError | null }): T[] {
  if (res.error) fail(res.error);
  return res.data ?? [];
}

/**
 * Normalize an RPC's booking result. Tolerates a function that `RETURNS
 * bookings` (object) or `RETURNS SETOF bookings` (array), so the caller doesn't
 * depend on which form the deployed function uses.
 */
function asBooking(data: unknown): Booking {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Booking RPC returned no row.");
  return row as Booking;
}

/** Unwrap a single-row query, throwing on error or missing row. */
function one<T>(res: { data: T | null; error: PostgrestError | null }): T {
  if (res.error) fail(res.error);
  if (res.data == null) throw new Error("Record not found.");
  return res.data;
}

export function createSupabaseDataService(
  supabase: SupabaseClient,
): DataService {
  return {
    // Workshops -----------------------------------------------------------
    listWorkshops: async () =>
      rows<Workshop>(
        await supabase
          .from("workshops")
          .select("*")
          .order("created_at", { ascending: false }),
      ),

    getWorkshop: async (id) => {
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) fail(error);
      return (data as Workshop | null) ?? null;
    },

    createWorkshop: async (input) =>
      one<Workshop>(
        await supabase.from("workshops").insert(input).select().single(),
      ),

    updateWorkshop: async (id, input) =>
      one<Workshop>(
        await supabase
          .from("workshops")
          .update({ ...input, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single(),
      ),

    deleteWorkshop: async (id) => {
      // Sessions are removed by the ON DELETE CASCADE FK, matching the mock.
      const { error } = await supabase.from("workshops").delete().eq("id", id);
      if (error) fail(error);
    },

    // Sessions ------------------------------------------------------------
    listSessions: async () =>
      rows<WorkshopSession>(
        await supabase
          .from("workshop_sessions")
          .select("*")
          .order("date", { ascending: true }),
      ),

    createSession: async (input) =>
      one<WorkshopSession>(
        await supabase
          .from("workshop_sessions")
          .insert(input)
          .select()
          .single(),
      ),

    updateSession: async (id, input) =>
      one<WorkshopSession>(
        await supabase
          .from("workshop_sessions")
          .update(input)
          .eq("id", id)
          .select()
          .single(),
      ),

    deleteSession: async (id) => {
      const { error } = await supabase
        .from("workshop_sessions")
        .delete()
        .eq("id", id);
      if (error) fail(error);
    },

    // Gallery -------------------------------------------------------------
    listGallery: async () =>
      rows<GalleryItem>(
        await supabase
          .from("gallery_images")
          .select("*")
          .order("display_order", { ascending: true }),
      ),

    createGalleryItem: async (input) =>
      one<GalleryItem>(
        await supabase.from("gallery_images").insert(input).select().single(),
      ),

    updateGalleryItem: async (id, input) =>
      one<GalleryItem>(
        await supabase
          .from("gallery_images")
          .update(input)
          .eq("id", id)
          .select()
          .single(),
      ),

    deleteGalleryItem: async (id) => {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id);
      if (error) fail(error);
    },

    // Bookings ------------------------------------------------------------
    listBookings: async () =>
      rows<Booking>(
        await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false }),
      ),

    createBooking: async (input) => {
      // General inquiries (no workshop/session) are submitted by anonymous
      // visitors, who have no direct INSERT/SELECT on bookings under RLS. Route
      // them through the SECURITY DEFINER RPC. Real (admin) bookings tied to a
      // workshop go through a normal insert, gated by the admin RLS policy.
      if (input.workshop_id == null && input.session_id == null) {
        const { data, error } = await supabase.rpc(RPC.createInquiry, {
          p_customer_name: input.customer_name,
          p_customer_email: input.customer_email,
          p_customer_phone: input.customer_phone,
          p_notes: input.notes ?? null,
        });
        if (error) fail(error);
        return asBooking(data);
      }
      return one<Booking>(
        await supabase.from("bookings").insert(input).select().single(),
      );
    },

    bookSession: async (request) => {
      // Real session booking: insert + decrement spots in one transaction.
      const notes = request.notes.trim();
      const { data, error } = await supabase.rpc(RPC.createBooking, {
        p_workshop_id: request.workshopId,
        p_session_id: request.sessionId,
        p_customer_name: request.name.trim(),
        p_customer_email: request.email.trim(),
        p_customer_phone: request.phone.trim(),
        p_participants: request.participants,
        p_notes: notes ? notes : null,
      });
      if (error) fail(error);
      return asBooking(data);
    },

    updateBookingStatus: async (id, status) => {
      // Cancelling restores inventory, so route it through the RPC that updates
      // the booking and its session atomically. Other status changes are plain.
      if (status === "cancelled") {
        const { data, error } = await supabase.rpc(RPC.cancelBooking, {
          p_booking_id: id,
        });
        if (error) fail(error);
        return asBooking(data);
      }
      return one<Booking>(
        await supabase
          .from("bookings")
          .update({ status })
          .eq("id", id)
          .select()
          .single(),
      );
    },

    deleteBooking: async (id) => {
      // The RPC restores spots for non-cancelled bookings before deleting.
      const { error } = await supabase.rpc(RPC.deleteBooking, {
        p_booking_id: id,
      });
      if (error) fail(error);
    },

    // Settings ------------------------------------------------------------
    getSettings: async () =>
      one<SiteSettings>(
        await supabase
          .from("site_settings")
          .select("*")
          .eq("id", SETTINGS_ID)
          .single(),
      ),

    updateSettings: async (settings) =>
      one<SiteSettings>(
        await supabase
          .from("site_settings")
          .upsert({ ...settings, id: SETTINGS_ID })
          .select()
          .single(),
      ),
  };
}
