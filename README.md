# UNCFLIX

A cinematic streaming portal for movies and TV. Netflix-style discovery, a TMDB-powered catalog, a full watch experience with resume and episode navigation, and optional Supabase accounts with cross-device sync — wrapped in a dark glass-and-aurora interface.

**Live:** [unc-flix.vercel.app](https://unc-flix.vercel.app)

![React](https://img.shields.io/badge/React-18-61dafb)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3)
![Tests](https://img.shields.io/badge/Vitest-118%20passing-22c55e)

## Highlights

### Discovery
- Auto-playing hero carousel with parallax backdrop, staggered title reveal, and slide progress
- Ranked Top 10 rails with Netflix-style outlined numerals
- Mood pills for Action, Anime, Comedy, Horror, Romance, Sci-Fi, and Thriller
- Curated home rails: Trending, Popular Movies, Top Rated, Popular TV, Coming Soon, and Recently Viewed
- Detail pages with cast, reviews, recommendations, trailer modal, and watchlist actions
- Genre-filtered `/movies` and `/tv` hubs with URL-persisted filters and infinite scroll

### Search
- `Cmd/Ctrl+K` from anywhere on desktop; a slide-up search sheet on mobile
- 250 ms debounce, minimum 2 trimmed characters, max 8 suggestions
- Accessible combobox/listbox with arrow keys, Home/End, Enter, Escape, and screen-reader announcements
- Results page driven by the URL (`/search?q=&page=`), with All/Movies/Series filters and pagination
- Stale requests are aborted and results are cached, so older responses can never overwrite newer ones
- People from TMDB's `/search/multi` are filtered out; only movies and shows are shown

### Watch experience
- CineSrc player embeds with autoplay and auto-next
- Two-column watch layout: cinema stage plus Up Next, season pills, and an episode browser
- Resume progress synced from player `postMessage` events (throttled to one write per 15 seconds)
- Continue Watching rail that resumes the exact season and episode
- Episode advancement without remounting the iframe; external navigation uses `replace`
- Ambient backdrop, floating watch header, fullscreen orientation support, and share/like actions

### Library and sync
- Watchlist and Continue Watching are local-first, so the app works without an account
- Optional Supabase sync: additive watchlist merge and newest-timestamp-wins continue merge
- Continue Watching is capped at 20 items and keyed by `(media_type, id)` so a movie and show sharing a TMDB id never collide
- Clear local data, non-persistent-storage warning, and per-account write scoping
- Recently Viewed stays device-local

### Accounts
- Email/password sign-in and sign-up, with friendly error mapping and email-confirmation handling
- Profile display name, eight avatar colours, autoplay preferences
- Email and password changes, “sign out on all other devices,” and local-data controls
- Signed-out browsing is fully supported; account features degrade with a clear explanation when Supabase is not configured

### Craft and accessibility
- “Midnight Aurora” design system: deep-space charcoal, sky-to-indigo gradients, glass chrome, soft elevation
- Dual motion stack: Anime.js for page choreography, Motion for interaction state and presence
- Content is visible by default; entrances never leave a grid stranded at `opacity: 0`
- Reduced motion respected globally via `MotionConfig`, CSS tokens, and guarded helpers
- Skip link, visible focus states, ARIA combobox and dialogs, safe-area insets, and ≥44 px touch targets
- Installable PWA with a network-first document cache and cache-first hashed assets

## Tech stack

| Layer | Tools |
|---|---|
| Framework | React 18, TypeScript, Vite 5 |
| Routing | React Router 6 |
| Styling | Bootstrap 5.3 (dark theme) + custom `uf-*` CSS and design tokens |
| Motion | Anime.js 4 (`src/lib/anim.ts`) + Motion 14 (`motion/react`) |
| Data | TanStack Query 5, TMDB API |
| Accounts | Supabase Auth + Postgres (RLS) |
| Player | CineSrc embeds (third-party iframe) |
| UI utilities | Lucide icons, Sonner toasts, clsx |
| Testing | Vitest, Testing Library, jsdom |

No Tailwind and no shadcn/ui — the component layer was intentionally rebuilt on Bootstrap plus the project's own token system.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/Arthurs011/unc-flix.git
cd unc-flix
npm install
cp .env.example .env
npm run dev
```

The dev server listens on `http://localhost:5000` and binds to `0.0.0.0`, so it is also reachable from a phone on the same network. If port 5000 is occupied, Vite picks the next available port.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_TMDB_API_KEY` | Recommended | TMDB v3 API key. A fallback development key exists in `src/lib/tmdb.ts`; use your own for real deployments. |
| `VITE_SUPABASE_URL` | Optional | Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Optional | Supabase publishable key (`sb_publishable_...`). Safe in the browser bundle. |
| `VITE_SUPABASE_PROJECT_ID` | Optional | Used by tooling that needs the project ref directly. |

Get a TMDB key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

Supabase is optional. If the URL or key is missing, the app still loads and browses normally; sign-in and sync report “Supabase is not configured on this deployment.” Never put a Supabase secret or service-role key in a `VITE_` variable — every `VITE_*` value ships to the browser.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production bundle into `dist/` (run `tsc` separately for types) |
| `npm run preview` | Serve the built bundle locally |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint |

Type checking is separate: `npx tsc --noEmit`.

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, mood pills, discovery rails, Continue Watching, Recently Viewed |
| `/movies` | Movie hub with genre filter and infinite scroll |
| `/tv` | Series hub with spotlight hero, genre pills, and trending row |
| `/movie/:id` | Movie details, cast, reviews, trailer, watchlist |
| `/tv/:id` | Series details, seasons, cast, reviews, watchlist |
| `/watch/movie/:id` | Movie player + recommendations |
| `/watch/tv/:id/:season/:episode` | Episode player + Up Next + season/episode browser |
| `/search?q=&page=` | Search results with type filters and pagination |
| `/watchlist` | Saved library |
| `/auth` | Sign in / sign up |
| `/account` | Profile, playback, security, local data |
| `*` | Not found |

The desktop nav is hidden on `/watch/*`; those pages use their own floating header.

## How it works

### Catalog and images
TMDB requests go through `src/lib/tmdb.ts`. TanStack Query handles caching, retries, and request aborting. Missing artwork degrades to a neutral inline SVG or a title-initial poster rather than a blank card.

### Search
`src/lib/search.ts` is the single source of truth for query thresholds, debounce timing, suggestion limits, page size, media-type narrowing, URL construction, and `(type,id)` keys. Both the nav dropdown and the results page share `useSearchResults`, so the same term reuses one cache entry and superseded requests are aborted.

### Persistence and sync
All local state is namespaced under `uncflix_*` keys:

| Key | Contents |
|---|---|
| `uncflix_watchlist` | Saved titles |
| `uncflix_continue` | Resume positions, newest first, max 20 |
| `uncflix_recent` | Recently viewed, device-local |
| `uncflix_profile` | Display name, avatar colour, playback preferences |
| `uncflix.auth` | Supabase session |
| `uncflix_persist_probe` | One-shot storage-health probe |

Writes update the in-memory store first, then localStorage; subscribers re-render through `useSyncExternalStore`. When signed in, watchlist and continue changes are upserted to Supabase. Signing in merges local and remote data: watchlists are additive, continue entries use the newest timestamp. Player progress arrives through validated, origin-checked `cinesrc:timeupdate` / `cinesrc:nextepisode` messages.

### Motion
`MASTER.md` documents the visual and interaction thesis, tokens, elevation ladder, and motion invariants. In short:

- **Anime.js** owns page choreography through `src/lib/anim.ts` (`revealNow`, `revealOnView`, `revealStagger`, `prefersReducedMotion`).
- **Motion** owns React interaction state: `whileTap`, `layoutId` indicators, and `AnimatePresence` exits.
- Transitions use the shared tokens in `src/lib/motion.ts`; no library-default springs.
- Markup is visible by default and entrances are guarded, so reduced motion, hidden tabs, or a failed animation never hide content.

### PWA
`public/sw.js` serves document requests network-first (so route reloads pick up new builds), serves hashed `/assets/` cache-first, and never caches itself or the manifest. A `CLEAR_CACHES` message provides an escape hatch for pinned clients.

## Project structure

```
src/
├── components/          # Navbar, MobileNav, HeroBanner, rails, cards, search, player chrome
├── contexts/            # AuthProvider (session + account sync orchestration)
├── hooks/               # search, watchlist, continue, profile, page title, nav behaviour
├── lib/
│   ├── tmdb.ts          # TMDB client, image fallbacks, formatting
│   ├── search.ts        # shared search rules and URL helpers
│   ├── storage.ts       # local-first watchlist / continue / recent stores
│   ├── watchlistSync.ts # Supabase watchlist mapping + upserts
│   ├── continueSync.ts  # Supabase continue-watching mapping + upserts
│   ├── profile.ts       # local profile cache + account_profiles sync
│   ├── servers.ts       # CineSrc embed URL builder
│   ├── supabase.ts      # configured client or inert fallback
│   ├── motion.ts        # Motion tokens
│   └── anim.ts          # Anime.js reveal helpers
├── pages/               # route-level screens
├── styles/              # components.css, browse.css, details.css, watch.css
├── test/                # Vitest suites
├── App.tsx              # providers, routes, error boundary, skip link
├── index.css            # Bootstrap imports + design tokens
└── main.tsx             # entry point + service worker registration
public/                  # manifest, icons, robots.txt, sw.js
supabase/                # idempotent SQL for tables, indexes, and RLS
```

## Quality

The suite currently has **118 passing tests** covering:

- Search debouncing, stale-response aborting, shared cache, combobox ARIA, keyboard traversal, option selection, empty/error states, and people filtering
- Search-page URL synchronisation, filters, pagination, and result links
- Watchlist rendering, first-render store reads, reference identity, `(type,id)` isolation, and persistence failure
- Watchlist and continue-watching sync merges, row mapping, account scoping, and sign-out write blocking
- Service worker caching policy and image fallbacks
- Smoke rendering for every route

```bash
npx vitest run
npx tsc --noEmit
npx eslint . --max-warnings 0
npm run build
```

`DEEPTEST_INPUTS.md` contains the SDD baseline used for automated exploration: target requirements, UI traversal flows, data boundaries and metamorphic relations, historical regressions, and fragile points with `file:line` evidence.

## Deployment

The app is a client-side SPA and deploys cleanly to Vercel. `vercel.json` rewrites every path to `index.html`, so deep links such as `/watch/tv/1399/1/1` work on reload.

1. Push to `main` (Vercel builds automatically) or import the repository.
2. Add the environment variables from the table above under **Project → Settings → Environment Variables** for all environments.
3. Redeploy. Vite inlines `VITE_*` values at build time, so changing them requires a new build.

### Supabase setup

Run these idempotent scripts in the Supabase SQL editor, in order:

1. `supabase/ensure_schema.sql` — `continue_watching` table, unique index, RLS, policies
2. `supabase/watchlist.sql` — `watchlist` table, unique index, RLS, policies
3. `supabase/account_area.sql` — `account_profiles` table and policies

Enable **Authentication → Providers → Email**. Keep *Confirm email* on unless you are deliberately testing unconfirmed accounts.

### Notes

- UNCFLIX does not host or proxy video. Playback is an embed from CineSrc; availability and content are controlled by that third party.
- The TMDB key is visible in the client bundle. For a high-traffic deployment, route TMDB calls through your own proxy or restrict the key.
- Search is intentionally movies-and-shows only; TMDB person results are discarded.
- `skills-lock.json` is generated tooling metadata for the Supabase agent skills and is not required to build or run the app.

---

Built with React, Bootstrap, Anime.js, Motion, TanStack Query, and Supabase.
