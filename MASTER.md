# MASTER — UNCFLIX Design System

## Visual Thesis
Dark cinematic interface with deep-space charcoal backgrounds, cool sky-to-indigo gradient accents, glassmorphism chrome, medium-dense spacing, and rounded-2xl cards with soft elevation.

## Interaction Thesis
Every element answers within 100ms (press) and settles in 180ms on one sharp out-expo curve. Hover lifts a single step on the elevation ladder, scroll-triggered reveals stagger, chrome auto-hides, no bounce or elastic.

## Allowed Patterns
glassmorphism panels, gradient accents, motion reveals, rank numerals, aurora backdrop, keyframe staggers (CSS + anime.js), Motion (`motion/react`) gesture states, shared-layout moves and AnimatePresence exits

## Color Tokens
- Background: #0D0F17
- Surface: #12141D
- Card: #1A1D2B
- Foreground: #F8FAFC
- Muted: #94A3B8
- Primary: #0EA5E9
- Secondary: #6366F1
- Accent Gradient: linear-gradient(135deg, #0EA5E9, #6366F1)
- Border: rgba(255,255,255,0.08)
- Destructive: #EF4444

## Typography
- Font: Inter (300, 400, 500, 600, 700)
- Display: 700, tight tracking
- Body: 400, relaxed
- Mono labels: uppercase, tracking-widest, 10px

## Spacing
- Base: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64

## Radii
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- full: 9999px

## Shadows
- 1 (rest): inset light-catch + 0 1px 2px / 0 4px 14px
- 2 (raised, nav): inset light-catch + 0 2px 6px / 0 14px 38px
- 3 (floating chrome, sheets, menus): inset light-catch + 0 4px 12px / 0 24px 64px
- glow: 0 0 20px rgba(14,165,233,0.35)
- glow-strong: 1px sky ring + 0 6px 28px rgba(14,165,233,0.4)

## Motion Tokens
- press: 100ms (scale 0.97, taps answer immediately)
- state: 180ms (hover / focus / open / close)
- fast: 150ms
- slow: 400ms (route entrance)
- easing: cubic-bezier(0.22, 1, 0.36, 1)
- stagger: 40ms

## Notes
- Drop the green accent from the ui-ux-pro-max proposal; keep sky→indigo gradient.
- Glassmorphism only on chrome (nav, docks, modals), not content cards.

## Stack (rebuilt from scratch)
- **CSS**: Bootstrap 5.3 on `data-bs-theme="dark"` + `--uf-*` design tokens in `src/index.css`.
  Components are styled with the `uf-*` class vocabulary in `src/styles/components.css`;
  pages may add scoped sheets (`src/styles/browse.css`, `details.css`, `watch.css`).
  Bootstrap has no responsive positioning or line-clamp utilities — those live in the
  `uf-*` layer, not in ad-hoc markup.
- **Motion**: two layers, one vocabulary.
  - **Anime.js v4** — page choreography only, through `src/lib/anim.ts`
    (`revealNow`, `revealOnView`, `revealStagger`, `prefersReducedMotion`):
    hero timeline/parallax, route + section entrances, progress bars.
  - **Motion v14 (`motion/react`, formerly Framer Motion)** — React interaction
    states only: `whileTap` press feedback, `layoutId` shared indicators,
    `AnimatePresence` exits. Shared numbers live in `src/lib/motion.ts`
    (`STATE_TRANSITION`, `PRESS_TRANSITION`, `LAYOUT_TRANSITION`,
    `SHEET_TRANSITION`, `PRESS_SCALE`) and mirror the CSS tokens.
    `<MotionConfig reducedMotion="user">` in `App.tsx` disables transform and
    layout animation for reduced-motion users.
- No Tailwind, no shadcn/ui. Dependencies are trimmed to what ships:
  react, react-dom, react-router-dom, @tanstack/react-query, @supabase/supabase-js,
  animejs, motion, bootstrap, clsx, lucide-react, sonner.

## Motion Rules (the invariants that keep content painted)
1. Markup is visible by default. No inline `opacity: 0`, no hide-first wrapper class.
   A failed, skipped or frozen animation must leave the page fully readable.
2. Entrances go through the `anim.ts` helpers only. They no-op under
   `prefers-reduced-motion`, no-op in a hidden tab (rAF never ticks there, so an
   entrance started there would freeze at opacity 0), and every inline hide is
   paired with a 4s wall-clock backstop that forces the element visible.
3. Per-item staggers prefer CSS (`route-fade-in` + inline `animationDelay`): a CSS
   animation always runs to completion on its own timeline.
4. `revealOnView` has no fallback timer. The element is visible by default, so if
   IntersectionObserver never fires the content simply stays on screen.
5. Scroll-linked effects (backdrop parallax, watch-header auto-hide) are rAF-throttled
   scroll listeners writing `transform` directly, disabled under reduced motion.
6. Motion may drive interaction state and presence only — press feedback, shared
   layout moves, overlay exits. Page entrances stay progressive (CSS/`anim.ts`).
   Never wrap `SearchDropdown` in `AnimatePresence`: its removal is asserted
   synchronously by the search tests, so it would keep the listbox mounted.
7. Motion transitions must use the tokens in `src/lib/motion.ts`; no library default
   springs. Reduced motion is handled once by `MotionConfig`, not per component.
