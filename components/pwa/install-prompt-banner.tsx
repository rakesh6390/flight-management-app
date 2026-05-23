"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  dismissInstallPrompt,
  isMobileUserAgent,
  wasInstallPromptDismissed,
} from "@/lib/pwa/install-prompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (wasInstallPromptDismissed() || !isMobileUserAgent()) {
      return;
    }

    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    setInstalling(true);

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setInstalling(false);
      setVisible(false);
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    dismissInstallPrompt();
    setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sky-200 bg-sky-600 px-4 py-3 text-white shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl sm:border"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <Download className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p id="pwa-install-title" className="text-sm font-semibold">
            Install Flight Management
          </p>
          <p id="pwa-install-desc" className="mt-0.5 text-xs text-sky-100">
            Add to your home screen for faster access and offline bookings.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-sky-700 disabled:opacity-70"
            >
              {installing ? "Installing…" : "Install"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-white/10"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-lg p-1 text-sky-100 hover:bg-white/10"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
