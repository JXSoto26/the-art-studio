import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dataService } from "./dataService";
import type {
  Booking,
  BookingInput,
  BookingStatus,
  GalleryItem,
  GalleryItemInput,
  SiteSettings,
  Workshop,
  WorkshopInput,
  WorkshopSession,
  WorkshopSessionInput,
} from "./types";

/**
 * App-wide admin state. Loads every collection up front (so loading/error
 * states are centralized) and re-fetches the affected collection after each
 * mutation. Components read data and call mutations from here and never touch
 * the DataService directly.
 */
interface AdminDataContextValue {
  workshops: Workshop[];
  sessions: WorkshopSession[];
  gallery: GalleryItem[];
  bookings: Booking[];
  settings: SiteSettings | null;

  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  createWorkshop: (input: WorkshopInput) => Promise<Workshop>;
  updateWorkshop: (id: string, input: WorkshopInput) => Promise<Workshop>;
  deleteWorkshop: (id: string) => Promise<void>;

  createSession: (input: WorkshopSessionInput) => Promise<WorkshopSession>;
  updateSession: (
    id: string,
    input: WorkshopSessionInput,
  ) => Promise<WorkshopSession>;
  deleteSession: (id: string) => Promise<void>;

  createGalleryItem: (input: GalleryItemInput) => Promise<GalleryItem>;
  updateGalleryItem: (
    id: string,
    input: GalleryItemInput,
  ) => Promise<GalleryItem>;
  deleteGalleryItem: (id: string) => Promise<void>;

  createBooking: (input: BookingInput) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<Booking>;
  deleteBooking: (id: string) => Promise<void>;

  updateSettings: (settings: SiteSettings) => Promise<SiteSettings>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, s, g, b, st] = await Promise.all([
        dataService.listWorkshops(),
        dataService.listSessions(),
        dataService.listGallery(),
        dataService.listBookings(),
        dataService.getSettings(),
      ]);
      setWorkshops(w);
      setSessions(s);
      setGallery(g);
      setBookings(b);
      setSettings(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Workshops ------------------------------------------------------------
  const createWorkshop = useCallback(async (input: WorkshopInput) => {
    const created = await dataService.createWorkshop(input);
    setWorkshops(await dataService.listWorkshops());
    return created;
  }, []);

  const updateWorkshop = useCallback(
    async (id: string, input: WorkshopInput) => {
      const updated = await dataService.updateWorkshop(id, input);
      setWorkshops(await dataService.listWorkshops());
      return updated;
    },
    [],
  );

  const deleteWorkshop = useCallback(async (id: string) => {
    await dataService.deleteWorkshop(id);
    const [w, s] = await Promise.all([
      dataService.listWorkshops(),
      dataService.listSessions(),
    ]);
    setWorkshops(w);
    setSessions(s);
  }, []);

  // Sessions -------------------------------------------------------------
  const createSession = useCallback(async (input: WorkshopSessionInput) => {
    const created = await dataService.createSession(input);
    setSessions(await dataService.listSessions());
    return created;
  }, []);

  const updateSession = useCallback(
    async (id: string, input: WorkshopSessionInput) => {
      const updated = await dataService.updateSession(id, input);
      setSessions(await dataService.listSessions());
      return updated;
    },
    [],
  );

  const deleteSession = useCallback(async (id: string) => {
    await dataService.deleteSession(id);
    setSessions(await dataService.listSessions());
  }, []);

  // Gallery --------------------------------------------------------------
  const createGalleryItem = useCallback(async (input: GalleryItemInput) => {
    const created = await dataService.createGalleryItem(input);
    setGallery(await dataService.listGallery());
    return created;
  }, []);

  const updateGalleryItem = useCallback(
    async (id: string, input: GalleryItemInput) => {
      const updated = await dataService.updateGalleryItem(id, input);
      setGallery(await dataService.listGallery());
      return updated;
    },
    [],
  );

  const deleteGalleryItem = useCallback(async (id: string) => {
    await dataService.deleteGalleryItem(id);
    setGallery(await dataService.listGallery());
  }, []);

  // Bookings -------------------------------------------------------------
  const createBooking = useCallback(async (input: BookingInput) => {
    const created = await dataService.createBooking(input);
    setBookings(await dataService.listBookings());
    return created;
  }, []);

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      const updated = await dataService.updateBookingStatus(id, status);
      // Cancelling can restore session spots, so refresh sessions too.
      const [b, s] = await Promise.all([
        dataService.listBookings(),
        dataService.listSessions(),
      ]);
      setBookings(b);
      setSessions(s);
      return updated;
    },
    [],
  );

  const deleteBooking = useCallback(async (id: string) => {
    await dataService.deleteBooking(id);
    // Deleting a live booking can restore session spots, so refresh sessions.
    const [b, s] = await Promise.all([
      dataService.listBookings(),
      dataService.listSessions(),
    ]);
    setBookings(b);
    setSessions(s);
  }, []);

  // Settings -------------------------------------------------------------
  const updateSettings = useCallback(async (next: SiteSettings) => {
    const saved = await dataService.updateSettings(next);
    setSettings(saved);
    return saved;
  }, []);

  const value = useMemo<AdminDataContextValue>(
    () => ({
      workshops,
      sessions,
      gallery,
      bookings,
      settings,
      loading,
      error,
      refresh,
      createWorkshop,
      updateWorkshop,
      deleteWorkshop,
      createSession,
      updateSession,
      deleteSession,
      createGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
      createBooking,
      updateBookingStatus,
      deleteBooking,
      updateSettings,
    }),
    [
      workshops,
      sessions,
      gallery,
      bookings,
      settings,
      loading,
      error,
      refresh,
      createWorkshop,
      updateWorkshop,
      deleteWorkshop,
      createSession,
      updateSession,
      deleteSession,
      createGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
      createBooking,
      updateBookingStatus,
      deleteBooking,
      updateSettings,
    ],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx)
    throw new Error("useAdminData must be used within an AdminDataProvider");
  return ctx;
}
