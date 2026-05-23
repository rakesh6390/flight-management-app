export const INSTALL_PROMPT_DISMISSED_KEY = "flight-app:pwa-install-dismissed";

export function wasInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1";
}

export function dismissInstallPrompt(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
}

export function isMobileUserAgent(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
}
