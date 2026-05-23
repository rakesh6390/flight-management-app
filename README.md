# Flight Management App

A full-stack flight booking and management platform built with Next.js 14 and Supabase.

Features include:
- Authentication with Supabase
- Flight search and filtering
- Aircraft seat selection
- Realtime seat updates
- Booking management
- Cancellation and rescheduling
- Progressive Web App (PWA) support
- Responsive mobile-first UI

---

## Live Demo

https://flight-management-app-five.vercel.app/

---

## Features

- JWT authentication with Supabase Auth
- Protected routes using Next.js middleware
- Realtime seat synchronization using Supabase Realtime
- Responsive aircraft seat map
- Booking and cancellation flows
- Transactional reschedule logic
- Zustand persisted state management
- Offline PWA support
- Mobile responsive UI
- Loading skeletons and toast notifications
- Role-based protected booking flows

---

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase
  - PostgreSQL
  - Authentication
  - Realtime
  - Row Level Security (RLS)
  - RPC functions
- Zustand
- react-hook-form
- Zod
- sonner
- @ducanh2912/next-pwa

---

# Screenshots

## Home Page

![Home Page](./README-assets/home-page.png)

---

## Flight Results

![Flight Results](./README-assets/flights-page.png)

---

## Seat Selection

![Seat Selection](./README-assets/seat-map.png)

---

## Booking Confirmation

![Booking Confirmation](./README-assets/booking-confirmation.png)

---

## My Bookings

![My Bookings](./README-assets/my-bookings.png)

---

# Lighthouse Report

![Lighthouse Report](./README-assets/lighthouse-report.png)

| Category | Score |
|----------|-------|
| Performance | 87 |
| Accessibility | 86 |
| Best Practices | 100 |
| SEO | 100 |

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/rakesh6390/flight-management-app.git
cd flight-management-app
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Create Environment Variables

Create:

```bash
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 4. Apply Supabase Migrations

```bash
npx supabase db push
```

---

### 5. Run Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Production Build (Required for PWA)

PWA uses Workbox via `@ducanh2912/next-pwa`.

```bash
npm run build
npm run start
```

Service worker is disabled in development.

---

# PWA Features

| Feature | Implementation |
|--------|----------------|
| Installable | manifest.json + app icons |
| Service worker | @ducanh2912/next-pwa |
| Flight search cache | StaleWhileRevalidate |
| Static asset caching | CacheFirst |
| Offline fallback | /offline |
| Cached bookings | localStorage + NetworkFirst |
| Install banner | beforeinstallprompt |

---

# Offline Testing

1. Run production build:

```bash
npm run build
npm run start
```

2. Open app and login.

3. Visit:
- `/my-bookings`
- `/flights`

4. Open Chrome DevTools:
- Application → Service Workers
- Verify `sw.js`

5. Open:
- DevTools → Network → Offline

6. Reload pages to test offline behavior.

---

# Folder Structure

```txt
app/
components/
hooks/
lib/
stores/
types/
actions/
public/
supabase/
```

---

# Important Features

## Authentication

- Supabase email authentication
- Protected routes
- Session middleware
- Auth redirects

---

## Flight Search

- Origin/destination filtering
- Date filtering
- Passenger count support
- URL query synchronization

---

## Seat Selection

- Economy/business/first-class seat maps
- Occupied/available seat states
- Responsive aircraft layout
- Realtime updates

---

## Booking Flow

- Passenger validation
- Seat reservation RPC
- Booking confirmation
- PNR generation

---

## Reschedule & Cancellation

- Transaction-safe booking updates
- Cancellation RPC
- Seat release logic
- Reschedule tracking

---

# Scripts

| Command | Description |
|---------|-------------|
| npm run dev | Development server |
| npm run build | Production build |
| npm run start | Production server |
| npm run pwa:icons | Generate PWA icons |

---

# Deployment

Frontend deployed on:
- Vercel

Backend services:
- Supabase

---

# Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

# Future Improvements

- Payment gateway integration
- Email ticket generation
- QR boarding passes
- Admin dashboard
- Flight analytics
- Multi-passenger bookings

---

# Author

Built by Rakesh Chauhan.