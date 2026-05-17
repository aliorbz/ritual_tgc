import { createClient } from "@supabase/supabase-js";

let supabaseUrlRaw = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
let supabaseUrl = "";

if (supabaseUrlRaw && supabaseUrlRaw !== "mock") {
  try {
    let urlToParse = supabaseUrlRaw;
    // Automatically prepend protocol if the user pasted a raw domain/path without https://
    if (!urlToParse.startsWith("http://") && !urlToParse.startsWith("https://")) {
      urlToParse = "https://" + urlToParse;
    }
    const parsed = new URL(urlToParse);
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
