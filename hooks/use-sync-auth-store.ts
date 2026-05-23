"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  clearUserStoreOnSignOut,
  syncUserStoreFromSupabase,
  useUserStore,
} from "@/stores/useUserStore";

/**
 * Keeps `useUserStore` in sync with Supabase Auth (cookies + session).
 * Mount once near the app root (e.g. a providers component).
 */
export function useSyncAuthStore() {
  const hasHydrated = useUserStore((s) => s.hasHydrated);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch (error) {
      console.warn("[useSyncAuthStore] Supabase client unavailable", error);
      clearUserStoreOnSignOut();
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserStoreFromSupabase(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        syncUserStoreFromSupabase(session);
      } else {
        clearUserStoreOnSignOut();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { hasHydrated };
}
