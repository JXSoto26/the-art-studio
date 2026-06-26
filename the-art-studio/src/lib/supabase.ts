import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazily-constructed Supabase client.
 *
 * Only created when the app is actually running against Supabase
 * (VITE_USE_SUPABASE=true), so the default mock/localStorage mode needs no
 * Supabase env vars at all.
 */
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is enabled (VITE_USE_SUPABASE=true) but VITE_SUPABASE_URL " +
        "and/or VITE_SUPABASE_ANON_KEY are not set. Add them to your .env.local.",
    );
  }

  client = createClient(url, key);
  return client;
}
