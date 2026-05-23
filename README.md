# Flight Management App

Next.js flight booking app with Supabase auth, seat selection, bookings, reschedule/cancel flows, and **Progressive Web App (PWA)** support.

## Getting Started

```bash
npm install
cp .env.example .env.local   # add Supabase URL + anon key
npx supabase db push         # apply migrations
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build (required for PWA)

PWA uses Workbox via `@ducanh2912/next-pwa` and **must be built with Webpack**:

```bash
npm run build    # runs prebuild (icons) + next build --webpack
npm run start
```

Service worker is **disabled in development**; test install/offline with a production build.

---

## PWA (Task 05)

### Features

| Feature | Implementation |
|--------|----------------|
| **Installable** | `public/manifest.json` — name, 192/512 icons, `#0284c7` theme, `display: standalone` |
| **Service worker** | `@ducanh2912/next-pwa` → `public/sw.js` on build |
| **Flight search cache** | `StaleWhileRevalidate` for `/flights` navigations |
| **Static assets** | `CacheFirst` for `/_next/static/*` and file extensions (js, css, fonts, images) |
| **Offline fallback** | `/offline` when document fetch fails |
| **My Bookings offline** | `localStorage` cache + `NetworkFirst` page cache; read-only when offline |
| **Install banner** | Mobile-first `beforeinstallprompt` banner (dismiss stored in `localStorage`) |

### Test offline

1. `npm run build && npm run start`
2. Sign in, open **My bookings** (loads live data → cached locally).
3. DevTools → **Application** → Service Workers → verify `sw.js`.
4. DevTools → **Network** → **Offline** → reload `/my-bookings` (cached list) or visit `/flights` (stale search if previously loaded).

### Lighthouse PWA audit (target ≥ 90)

1. Run production server: `npm run start`
2. Chrome → `http://localhost:3000` → DevTools → **Lighthouse**
3. Mode: **Navigation**, Device: **Mobile**, Categories: **Progressive Web App** (and Performance if desired)
4. Run on `/` and `/my-bookings` (authenticated) for best scores.

**Checklist for a high PWA score:**

- [x] Web app manifest with required fields
- [x] Service worker registered
- [x] HTTPS (or `localhost`)
- [x] 192px and 512px icons
- [x] `theme-color` / `display: standalone`
- [x] Offline fallback page

#### Lighthouse PWA score (add your screenshot)

After running the audit, save a screenshot as `docs/lighthouse-pwa.png` and embed it here:

```markdown
![Lighthouse PWA audit](./docs/lighthouse-pwa.png)
```

_Example placeholder — replace with your run:_

| Category | Score |
|----------|-------|
| PWA      | _Run Lighthouse and paste score_ |

### Regenerate icons

```bash
npm run pwa:icons
```

Outputs `public/icons/icon-192.png` and `public/icons/icon-512.png`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (Webpack + PWA) |
| `npm run start` | Production server |
| `npm run pwa:icons` | Generate PWA PNG icons |

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase (auth, Postgres, RLS, RPC)
- Zustand, sonner, Zod
- `@ducanh2912/next-pwa` (Workbox)
