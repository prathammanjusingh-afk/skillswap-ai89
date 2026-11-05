import { createBrowserClient } from "@supabase/ssr";

// Basic validators – support standard JWT format and new Supabase publishable keys (sb_publishable_...)
const isUrl = (v: string) => /^https:\/\/.+/.test(v);
const isAnonKey = (v: string) =>
  /^[a-zA-Z0-9_\-\.]{30,}$/.test(v) || v.startsWith("sb_publishable_");

// Note: In Next.js client bundles, process.env.NEXT_PUBLIC_* MUST be referenced directly
// so that Webpack can statically replace them during compilation.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabaseUrl = isUrl(rawUrl) ? rawUrl : "";
const supabaseAnonKey = isAnonKey(rawKey) ? rawKey : "";

/**
 * Flag indicating whether the Supabase client can be created.
 * It is true only when both URL and anon key are present and appear valid.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-id") &&
    supabaseUrl.startsWith("https://")
);

/**
 * Create a browser‑side Supabase client singleton.
 * Returns `null` when the configuration is missing – callers should handle the fallback.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn("[Supabase] Client not created – configuration missing or invalid.");
    return null;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Export a ready‑to‑use client (or null) for convenience. */
export const supabase = isSupabaseConfigured ? createClient() : null;

/**
 * Utility for UI to describe the current data mode.
 */
export function getSupabaseMode(): { isLive: boolean; message: string } {
  if (isSupabaseConfigured) {
    return {
      isLive: true,
      message: "Connected to live Supabase PostgreSQL database & Auth",
    };
  }
  return {
    isLive: false,
    message: "Demo Mode active (Persistent storage enabled)",
  };
}
