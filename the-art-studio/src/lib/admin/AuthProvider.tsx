import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AdminUser } from "./types";
import { getSupabaseClient } from "../supabase";

/**
 * Admin authentication with two interchangeable backends, chosen by the same
 * VITE_USE_SUPABASE flag as the data layer:
 *
 *   - mock (default): any email + non-empty password "works", persisted to
 *     localStorage. For local development against the mock data service.
 *   - Supabase: real `supabase.auth` email/password sign-in, gated on a matching
 *     row in `public.admin_users`. An authenticated user that is NOT an admin is
 *     signed back out and shown a clear message.
 *
 * Both expose the same context shape, so ProtectedRoute / LoginPage / AdminHeader
 * never know which one is active.
 */

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === "true";

/** True when admin auth runs against Supabase (vs the local mock). */
export const IS_SUPABASE_AUTH = USE_SUPABASE;

const AUTH_KEY = "tas_admin_auth_v1";

// Demo credentials shown on the login screen in mock mode.
export const DEMO_EMAIL = "owner@theartstudio.com";
export const DEMO_PASSWORD = "studio";

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  /** True while an existing session is being restored (Supabase); false in mock. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ----------------------------------------------------------------- mock auth */

function readStoredUser(): AdminUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function useMockAuth(): AuthContextValue {
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 450)); // simulate latency
    if (!email.trim() || !password.trim()) {
      throw new Error("Please enter an email and password.");
    }
    const nextUser: AdminUser = {
      id: "admin_1",
      name: "Studio Owner",
      email: email.trim(),
    };
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
    }
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, loading: false, signIn, signOut }),
    [user, signIn, signOut],
  );
}

/* ------------------------------------------------------------- Supabase auth */

/**
 * Look up the admin_users row for an authenticated user (matched by email).
 * Returns an AdminUser when authorized, or null when the user is not an admin.
 */
async function resolveAdmin(
  supabase: SupabaseClient,
  authUser: User,
): Promise<AdminUser | null> {
  const email = authUser.email ?? "";
  if (!email) return null;
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { name?: string | null };
  return { id: authUser.id, email, name: row.name?.trim() || email };
}

function useSupabaseAuth(): AuthContextValue {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let active = true;

    // Restore an existing session on load.
    supabase.auth.getSession().then(async ({ data }) => {
      const authUser = data.session?.user ?? null;
      if (!active) return;
      if (!authUser) {
        setLoading(false);
        return;
      }
      const admin = await resolveAdmin(supabase, authUser);
      if (!active) return;
      // A restored session for a non-admin is not granted admin access.
      if (!admin) await supabase.auth.signOut();
      setUser(admin);
      setLoading(false);
    });

    // Keep state in sync with later sign-in / sign-out events.
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const authUser = session?.user ?? null;
        if (!authUser) {
          if (active) setUser(null);
          return;
        }
        const admin = await resolveAdmin(supabase, authUser);
        if (active) setUser(admin);
      },
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);

    const admin = data.user ? await resolveAdmin(supabase, data.user) : null;
    if (!admin) {
      // Valid credentials, but not an authorized admin — don't keep the session.
      await supabase.auth.signOut();
      throw new Error(
        "This account isn't authorized for admin access. Contact the studio owner.",
      );
    }
    setUser(admin);
  }, []);

  const signOut = useCallback(() => {
    const supabase = getSupabaseClient();
    setUser(null); // clear UI immediately; the async sign-out completes in the background
    void supabase.auth.signOut();
  }, []);

  return useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );
}

/* -------------------------------------------------------------------- export */

// Selected once at module load — the flag is constant for the app's lifetime,
// so this never violates the rules of hooks.
const useAuthState = USE_SUPABASE ? useSupabaseAuth : useMockAuth;

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
