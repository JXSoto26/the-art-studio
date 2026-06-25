import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminUser } from "./types";

/**
 * Mock authentication. Any email + a non-empty password "works"; the session
 * is persisted to localStorage. Replace `signIn`/`signOut` with Supabase Auth
 * calls later — the context shape can stay the same.
 */

const AUTH_KEY = "tas_admin_auth_v1";

// Demo credentials shown on the login screen.
export const DEMO_EMAIL = "owner@theartstudio.com";
export const DEMO_PASSWORD = "studio";

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AdminUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(readStoredUser);

  const signIn = useCallback(async (email: string, password: string) => {
    // Simulate latency.
    await new Promise((r) => setTimeout(r, 450));
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

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
