"use client";

import { useSyncAuthStore } from "@/hooks/use-sync-auth-store";

export function AuthStoreSync({ children }: { children: React.ReactNode }) {
  useSyncAuthStore();
  return <>{children}</>;
}
