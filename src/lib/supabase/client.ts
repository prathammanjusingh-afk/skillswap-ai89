import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project-id")
);

// If configured, instantiate real Supabase client; otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Returns whether the application is running in Live Supabase mode or Interactive Demo mode
 */
export function getSupabaseMode(): {
  isLive: boolean;
  message: string;
} {
  if (isSupabaseConfigured) {
    return {
      isLive: true,
      message: "Connected to live Supabase PostgreSQL database & Auth",
    };
  }
  return {
    isLive: false,
    message: "Demo Mode active (Interactive local memory store with seed data)",
  };
}
