

## APL_MOV — Apple TV-Inspired Movie Streaming App

### Overview
A premium movie/TV browsing app with dark glassmorphism UI, TMDB integration, and VidSrc video embedding.

### Pages & Components

**1. Homepage**
- Auto-rotating hero banner with featured trending movie (backdrop image, title, overview, Play/Watchlist buttons)
- Horizontal scroll sections: Trending, Top Rated, Popular TV Shows, Upcoming, Continue Watching, Recently Viewed
- Movie cards with hover scale effect (1.05x), rating badge, lazy-loaded images

**2. Movie/TV Details Page** (`/movie/:id`, `/tv/:id`)
- Full backdrop + poster layout, title, rating, genres, runtime, overview
- Horizontal scrolling cast section
- Play Now + Add to Watchlist buttons

**3. Video Player Page** (`/watch/movie/:id`, `/watch/tv/:id/:season/:episode`)
- VidSrc iframe embed (fullscreen)
- Episode selector for TV shows (season/episode dropdowns)
- Back button, auto-saves to Continue Watching with progress tracking in localStorage

**4. Search Page** (`/search`)
- Real-time TMDB multi-search with debounce
- Grid results with posters, titles, ratings
- "No results found" state

**5. Watchlist Page** (`/watchlist`)
- Grid of saved movies/shows from localStorage
- Remove from watchlist functionality

### Design System
- **Dark theme only** — near-black backgrounds (`#0a0a0a`, `#1a1a1a`)
- **Colors**: White text, subtle blue highlights (`#2997ff` Apple blue), gray accents
- **Glassmorphism navbar**: sticky, backdrop-blur, semi-transparent
- **Typography**: Inter font (San Francisco substitute)
- **Animations**: Framer Motion for page transitions, card hovers, carousel

### Navigation (Sticky Glassmorphism Navbar)
- Logo: **APL_MOV**
- Links: Home, TV Shows, Movies, Watchlist
- Search icon → opens search

### Technical Details
- TMDB API key stored in code (public key)
- localStorage for watchlist, recently viewed, continue watching (with progress bar)
- Loading skeletons during data fetches
- Error/fallback UI for API failures
- Fully responsive: desktop-first, mobile-optimized with stacked layouts and smaller cards

