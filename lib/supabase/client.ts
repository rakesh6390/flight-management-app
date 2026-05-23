import { createBrowserClient } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Client Components, hooks, and browser-only code.
 * Do not use in Server Components, Server Actions, or Route Handlers.
 */
export function createClient() {
  return createBrowserClient<Database>(
    supabaseEnv.url,
    supabaseEnv.anonKey
  );
}
