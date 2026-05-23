import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: ({ request, url }) =>
          request.mode === "navigate" && url.pathname.startsWith("/flights"),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "flight-search-pages",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },
      {
        urlPattern: ({ request, url }) =>
          request.mode === "navigate" && url.pathname === "/my-bookings",
        handler: "NetworkFirst",
        options: {
          cacheName: "my-bookings-pages",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern:
          /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp|ico|avif)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* PWA uses Workbox webpack plugin — build with `next build --webpack` */
};

export default withPWA(nextConfig);
