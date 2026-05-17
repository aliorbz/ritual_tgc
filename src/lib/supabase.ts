import { createClient } from "@supabase/supabase-js";

let supabaseUrlRaw = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
let supabaseUrl = "";

if (supabaseUrlRaw && supabaseUrlRaw !== "mock") {
  try {
    // Standard URL parser extracts strictly the base domain origin (e.g. https://xxx.supabase.co)
    // completely discarding trailing slashes, ports, or accidental /rest/v1 sub-paths
    const parsed = new URL(supabaseUrlRaw);
    supabaseUrl = parsed.origin;
  } catch (e) {
    // Fallback if URL parsing fails
    supabaseUrl = supabaseUrlRaw;
  }
}

const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "mock" && supabaseAnonKey !== "mock");
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
