"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  // Keep runtime failure explicit during local setup.
  console.warn(
    "Supabase env vars are missing. Auth and cloud sync are disabled until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return hasSupabaseConfig;
}

function createSupabaseClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!hasSupabaseConfig) {
    return null;
  }

  if (!browserClient) {
    browserClient = createSupabaseClient();
  }

  return browserClient;
}
