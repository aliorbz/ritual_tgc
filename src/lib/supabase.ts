import { createClient } from "@supabase/supabase-js";

let supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Automatically trim any trailing slashes to prevent PGRST125 double-slash routing issues
if (supabaseUrlRaw.endsWith("/")) {
  supabaseUrlRaw = supabaseUrlRaw.slice(0, -1);
}

const supabaseUrl = supabaseUrlRaw.trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "mock" && supabaseAnonKey !== "mock");
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
