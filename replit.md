# Uncleflix

A Netflix-style movie and TV show discovery and streaming app built with React, TypeScript, and Vite.

## Architecture

**Frontend only** — pure React/Vite SPA with no custom backend server.

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM v6
- **Data fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion

## External Services

- **Supabase** — Auth (email/password + Google OAuth), PostgreSQL database with RLS
- **TMDB API** — Movie and TV show metadata, images, cast, etc.

## Environment Variables

All set via Replit's environment variable system:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `VITE_TMDB_API_KEY` — TMDB API key

## Key Files

- `src/integrations/supabase/client.ts` — Supabase client initialization
- `src/integrations/supabase/types.ts` — TypeScript types from Supabase schema
- `src/contexts/AuthContext.tsx` — Auth state and session management
- `src/lib/storage.ts` — Watchlist/continue-watching (localStorage + Supabase sync)
- `src/lib/tmdb.ts` — TMDB API wrapper
- `src/lib/servers.ts` — Streaming embed server configurations
- `src/pages/Auth.tsx` — Sign in / Sign up page
- `src/App.tsx` — Root with routing

## Database Schema (Supabase)

Tables managed on Supabase with Row Level Security:
- `profiles` — User profiles (auto-created on signup via trigger)
- `user_watchlist` — Per-user saved watchlist items
- `user_continue_watching` — Per-user viewing progress
- `signup_notifications` — Admin log of new signups

## Running

```
npm run dev
```

Runs Vite dev server on port 5000.
