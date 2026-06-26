/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" switches the app onto the Supabase backend; anything else uses the mock. */
  readonly VITE_USE_SUPABASE?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
