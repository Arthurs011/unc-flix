# UNCFLIX

A cinematic streaming-portal UI for movies and TV — Netflix-style browsing, TMDB-powered catalog, and a full watch experience with continue-watching, episode navigation, and multi-source playback.

**Live:** [unc-flix.vercel.app](https://unc-flix.vercel.app)

![Tech](https://img.shields.io/badge/React%2018-Vite%205-61dafb) ![Style](https://img.shields.io/badge/Tailwind%203-Motion%2013-38bdf8) ![Tests](https://img.shields.io/badge/Vitest-smoke%20tests-22c55e)

## Features

### Discovery
- **Auto-playing hero carousel** with parallax backdrop, word-by-word title reveal, magnetic CTA, and per-slide progress bars
- **Top 10 rails** with Netflix-style outlined rank numerals
- **Mood pills** (Action, Anime, Comedy, Horror, Romance, Sci-Fi, Thriller) that filter results instantly
- **Curated home rails**: Trending This Week, Popular Movies, Top Rated, Popular TV, Coming Soon, Recently Viewed — each with "Explore all" links
- **Live search** (`Cmd/Ctrl+K`) with debounced dropdown results across movies, TV, and people

### Watch Experience
- **CineSrc player** with brand-matched embeds, autoplay, and auto-next-episode
- **Two-column watch layout**: compact cinema stage on the left; Up Next card, season pills, and scrollable episode browser on the right (More Like This for movies)
- **Continue Watching**: progress synced from player `postMessage` events, resumable across sessions (localStorage)
- **Multi-server switching** with preferred-source memory

### Craft Details
- **Midnight Aurora design system**: deep-space palette, aurora backdrop blobs, glassmorphism chrome, sky→indigo gradient accents
- **Motion-powered UI**: spring physics everywhere, 3D cursor tilt on cards, scroll-linked navbar glass intensity, page blur transitions, scroll progress bar, reduced-motion respected via `MotionConfig`
- **Mobile-first chrome**: rebuilt from scratch as its own component — labeled bottom dock with sliding active pill, slide-up search sheet with quick genres, safe-area insets (`pt-safe` / `pb-safe`), ≥44px touch targets
- **Auto-hiding headers** on both the main nav and the floating watch-page pill

## Tech Stack

| Layer      | Tools |
|------------|-------|
| Framework  | React 18, TypeScript, Vite 5 |
| Routing    | React Router 6 (animated transitions) |
| Styling    | Tailwind CSS 3, custom design tokens |
| Animation  | Motion (`motion/react` v13) |
| Data       | TanStack Query + TMDB API |
| Player     | Plyr + hls.js, CineSrc embeds |
| Components | Radix UI primitives, shadcn/ui, lucide icons |
| Testing    | Vitest + Testing Library |

## Getting Started

```bash
git clone https://github.com/Arthurs011/unc-flix.git
cd unc-flix
npm install
```

Create a `.env` file:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key
```

> Get a free key at [themoviedb.org](https://www.themoviedb.org/settings/api). A fallback dev key exists in `src/lib/tmdb.ts`.

```bash
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview the build
npm test           # run smoke tests
npm run lint       # eslint
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # desktop floating pill nav (scroll-aware glass)
│   ├── MobileNav.tsx       # mobile top bar + dock + search sheet
│   ├── HeroBanner.tsx      # parallax carousel hero
│   ├── ContentRow.tsx      # horizontal slider w/ rank numerals + edge fades
│   ├── ContinueRow.tsx     # resume-watching rail with progress bars
│   ├── WatchHeader.tsx     # floating pill header for watch pages
│   └── ...
├── pages/                  # Index, Movies, TvShows, details, watch, search…
├── hooks/                  # usePageTitle, useAutoHideNav
├── lib/
│   ├── tmdb.ts             # TMDB client (trending, details, seasons, credits)
│   ├── servers.ts          # stream source registry + URL builder
│   ├── storage.ts          # watchlist / history / progress persistence
│   └── motion.ts           # shared springs & easing variants
└── test/                   # route smoke tests
```

## Routes

| Path | Page |
|------|------|
| `/` | Home — hero, mood pills, content rails |
| `/movies`, `/tv` | Browse hubs with genre filters + Top 10 |
| `/movie/:id`, `/tv/:id` | Detail pages |
| `/watch/movie/:id` | Movie player |
| `/watch/tv/:id/:season/:episode` | Episode player with sidebar browser |
| `/search?q=` | Search results |
| `/watchlist` | Saved titles |

## Deployment

Deploys to Vercel on push to `main`. No server component — everything runs client-side against TMDB and CineSrc.

---

Built with a little help from AI, a lot of coffee, and questionable taste in color gradients.
