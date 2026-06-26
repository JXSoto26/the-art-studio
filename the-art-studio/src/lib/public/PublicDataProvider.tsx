import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dataService } from "../admin/dataService";
import type {
  Booking,
  GalleryItem,
  SessionBookingRequest,
  SiteSettings,
  Workshop,
  WorkshopSession,
} from "../admin/types";

/** Fields collected by the public contact form. */
export interface ContactInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Read-only public view over the same `dataService` the admin CMS writes to.
 *
 * Loads the collections the public site needs once on mount and exposes them
 * plus centralized `loading`/`error`. The provider wraps the public layout, so
 * it stays mounted while navigating between public pages and remounts (picking
 * up any admin edits) when the user returns from `/admin`.
 *
 * Public components read through `usePublicData()` and never touch the
 * DataService directly — the same boundary the admin side keeps.
 */
interface PublicDataContextValue {
  workshops: Workshop[];
  sessions: WorkshopSession[];
  gallery: GalleryItem[];
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  /**
   * Submit a contact inquiry. Stored as a `pending` booking with no workshop
   * or session attached; the subject + message are kept in `notes`.
   */
  submitInquiry: (inquiry: ContactInquiry) => Promise<Booking>;

  /**
   * Book a specific workshop session. Re-checks live availability, creates a
   * `pending` booking, decrements the session's `available_spots`, and refreshes
   * local session state. Throws if the session is gone or oversubscribed.
   */
  bookSession: (request: SessionBookingRequest) => Promise<Booking>;
}

const PublicDataContext = createContext<PublicDataContextValue | null>(null);

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, s, g, st] = await Promise.all([
        dataService.listWorkshops(),
        dataService.listSessions(),
        dataService.listGallery(),
        dataService.getSettings(),
      ]);
      setWorkshops(w);
      setSessions(s);
      setGallery(g);
      setSettings(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitInquiry = useCallback(async (inquiry: ContactInquiry) => {
    const subject = inquiry.subject.trim();
    const message = inquiry.message.trim();
    const notes = subject ? `${subject}\n\n${message}` : message;
    return dataService.createBooking({
      customer_name: inquiry.name.trim(),
      customer_email: inquiry.email.trim(),
      customer_phone: "",
      workshop_id: null,
      session_id: null,
      participants: 1,
      status: "pending",
      notes,
    });
  }, []);

  const bookSession = useCallback(async (request: SessionBookingRequest) => {
    // The data layer validates availability and decrements the session's spots
    // atomically (in-memory for the mock, via a transactional RPC for Supabase).
    const booking = await dataService.bookSession(request);
    setSessions(await dataService.listSessions());
    return booking;
  }, []);

  const value = useMemo<PublicDataContextValue>(
    () => ({
      workshops,
      sessions,
      gallery,
      settings,
      loading,
      error,
      refresh,
      submitInquiry,
      bookSession,
    }),
    [
      workshops,
      sessions,
      gallery,
      settings,
      loading,
      error,
      refresh,
      submitInquiry,
      bookSession,
    ],
  );

  return (
    <PublicDataContext.Provider value={value}>
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData(): PublicDataContextValue {
  const ctx = useContext(PublicDataContext);
  if (!ctx)
    throw new Error("usePublicData must be used within a PublicDataProvider");
  return ctx;
}
