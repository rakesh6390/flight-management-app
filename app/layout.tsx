import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthStoreSync } from "@/components/providers/auth-store-sync";
import { AppToaster } from "@/components/providers/toaster";
import { InstallPromptBanner } from "@/components/pwa/install-prompt-banner";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flight Management",
  description: "Search flights, reserve seats, and manage bookings",
  applicationName: "Flight Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flights",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthStoreSync>{children}</AuthStoreSync>
        <AppToaster />
        <InstallPromptBanner />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
