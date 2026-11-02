import { createBrowserClient } from "@supabase/ssr";

/**
 * Validate that an environment variable is set and looks like a URL or key.
 * Returns the value if valid, otherwise logs a warning and returns an empty string.
 */
function getEnvVar(name: string, validator?: (v: string) => boolean): string {
  const value = process.env[name] ?? "";
  if (!value) {
    console.warn(`[Supabase] Environment variable ${name} is not defined.`);
    return "";
  }
  if (validator && !validator(value)) {
    console.warn(`[Supabase] Environment variable ${name} appears invalid: ${value}`);
    return "";
  }
  return value;
}

// Basic validators – support standard JWT format and new Supabase publishable keys (sb_publishable_...)
const isUrl = (v: string) => /^https:\/\/.+/.test(v);
const isAnonKey = (v: string) =>
  /^[a-zA-Z0-9_\-\.]{30,}$/.test(v) || v.startsWith("sb_publishable_");

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL", isUrl);
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY", isAnonKey);

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
