# UNCFLIX — DeepTest Inputs Baseline

**Revision:** `1065d96` + uncommitted UI/motion polish (local working tree)
**Prepared:** 2026-10-21
**Purpose:** Spec-Driven Development baseline for DeepTest script generation and decision-path exploration.
**Scope owner:** UNCFLIX web app (`React 18 + Vite + Bootstrap 5.3 + Anime.js/Motion`).

---

## 0. Execution Contract

### 0.1 Scope resolution

The request refers to “this component” without naming one. This baseline covers the **integrated UI surface and its core decision paths**:

- App shell, desktop nav, mobile top bar/dock, sheets and menus
- `/`, `/movies`, `/tv`, `/search`, `/watchlist`
- `/movie/:id`, `/tv/:id`
- `/watch/movie/:id`, `/watch/tv/:id/:season/:episode`
- `/auth`, `/account`, `*` (404)

If DeepTest needs a single-unit suite, the highest-value target is **search** (`SearchBox` + `SearchPage` + `useSearchResults` + `lib/search.ts`), followed by **watchlist/continue persistence and account sync**. Everything below is tagged so it can be narrowed.

### 0.2 Environment matrix

| Dimension | Values |
|---|---|
| Base URL | `http://localhost:5001` (dev server currently on 5001; `vite.config.ts` may declare 5000). LAN: `http://192.168.1.3:5001` |
| Browser | Chromium required; WebKit/Safari for storage-quota and `type=search` native-clear checks |
| Viewports | 375×812, 414×896, 768×1024, 1024×768, 1440×900 |
| Motion | Default **and** `prefers-reduced-motion: reduce` |
| Network | Fast, Slow 3G, offline, TMDB 5xx, request timeout |
| Auth | Signed out, signed in (dedicated test account), Supabase env absent (inert mode) |
| Storage | Healthy, private-browsing/quota-failure, corrupt JSON, cross-tab |
| Locale | `en-US` plus one non-US locale for date rendering |

### 0.3 Deterministic reset protocol (run before every case)

1. Sign out if signed in; clear `uncflix.auth` if the runner can.
2. Delete localStorage keys: `uncflix_watchlist`, `uncflix_recent`, `uncflix_continue`, `uncflix_profile`, `uncflix_persist_probe`.
3. Unregister service workers and delete caches (`CLEAR_CACHES` path or DevTools).
4. Return to `/`; reload once.
5. For auth cases, use accounts created per run (e.g. `qa+<runid>@…`) so additive merges are predictable.

### 0.4 Oracle legend

| Tag | Oracle |
|---|---|
| `[D]` | DOM text/role/attribute/state |
| `[U]` | URL path, query, history behaviour |
| `[N]` | Network request count, parameters, abort |
| `[S]` | localStorage content, ordering, caps |
| `[V]` | Geometry: visibility, bounding box, overflow, computed style |
| `[A]` | Accessibility: role, name, focus, keyboard, reduced motion |

### 0.5 Severity

| Sev | Meaning |
|---|---|
| S1 | Data loss, cross-account leakage, auth bypass, app crash |
| S2 | Core journey blocked or wrong destination/result |
| S3 | Degraded state, misleading empty/error, stale data |
| S4 | Visual/motion/a11y polish defect |

### 0.6 Exit criteria for the baseline

- `npx vitest run` → 118/118
- `npx tsc --noEmit` → clean
- `npx eslint . --max-warnings 0` → clean
- `npm run build` → success
- No horizontal overflow at all matrix viewports; content paints with JS animations disabled.
- All P0 flows in §2 pass in the built app, not only in dev.

---

## 1. TARGET REQUIREMENT

### 1.1 Functional baseline

| ID | Surface | Requirement (must) | Primary oracle |
|---|---|---|---|
| R1 | App shell | Every route renders without the error boundary; 404 route shows recovery; nav hides on `/watch/*`. | `[D][U]` |
| R2 | Home | Five discovery rails + trending hero load; skeleton while loading; one recovery screen if initial load fails; mood pill swaps the rail; Continue Watching appears only when history exists. | `[D][N][S]` |
| R3 | Browse | `/movies` and `/tv` show hero/rail + genre pills; genre is persisted in `?genre=`; selecting a genre resets to page 1; infinite scroll appends pages until `total_pages`; end-of-library indicator on TV. | `[D][U][N]` |
| R4 | Search suggestions | Nav pill (desktop) and search sheet (mobile) share one implementation: 250 ms debounce, minimum 2 trimmed chars, max 8 suggestions, combobox/listbox ARIA, arrow/Home/End/Escape/Enter semantics. | `[D][A][N]` |
| R5 | Search results | URL is the source of truth (`/search?q=&page=`); editing the page field updates the URL without history spam; results exclude people, de-duplicate by `type:id`, page by 20; All/Movies/Series filter narrows the current page; error and empty states are distinct. | `[D][U][N]` |
| R6 | Details | Movie/TV detail loads title, meta, overview, cast, reviews, recommendations; trailer opens and closes; watchlist toggle reflects and persists state; invalid id shows “not found”; viewing adds to recently viewed. | `[D][S][V]` |
| R7 | Watchlist | Library renders saved titles on first paint (no empty flash); count matches items; remove works; empty state routes to browse; non-persistent storage shows a warning. | `[D][S][V]` |
| R8 | Continue watching | Rail shows newest first, resume link goes to the correct movie/episode, progress is rendered, remove deletes the item; survives reload; capped at 20. | `[D][S][U]` |
| R9 | Player pages | `/watch/movie/:id` and `/watch/tv/:id/:s/:e` load metadata, embed the correct source, sync progress from CineSrc messages, advance episodes without remounting the iframe, show Up Next/finale, and show “Title not found” on invalid id. | `[D][U][S][N]` |
| R10 | Auth | Email trimmed; password ≥ 6; sign-in failure is human-readable; signup may land in “check your inbox”; signed-in visitors are redirected to `from` or `/`; signed-out browsing remains possible. | `[D][U]` |
| R11 | Account | Signed-out users see a gate; signed-in users edit display name (40 max), avatar colour (8 swatches), autoplay toggles, email, password; sign out other devices; clear local data; sign out. Validation is enforced client-side where specified. | `[D][S][N]` |
| R12 | Sync/isolation | Signing in uploads local watchlist additively and merges continue-watching newest-first; writes stop on sign-out; a different account must not inherit the previous account’s private library. | `[S][N]` |
| R13 | Resilience | Loading, empty, error, partial-failure, offline and slow-network states are distinguishable; no blank grid under a correct count. | `[D][V]` |
| R14 | Accessibility/motion | Combobox and dialogs expose roles/names; keyboard traversal works; content is visible with animations disabled; reduced motion suppresses non-essential movement. | `[A][V]` |
| R15 | Deep links/PWA | Any route reloads directly; service worker serves documents network-first and never pins itself; old caches are dropped on version bump. | `[U][N]` |

### 1.2 Invariants (assert after every mutating case)

- **INV-1** A displayable title always has a resolvable route and a non-empty label.
- **INV-2** TMDB identity is `(media_type, id)`, never `id` alone.
- **INV-3** A local write must either persist or raise the non-persistence warning; it must never fail silently.
- **INV-4** Search requests fire only for trimmed queries ≥ 2 chars, at most once per settled query/page within `staleTime`.
- **INV-5** The URL determines the search query/page; reloading reproduces the results.
- **INV-6** Continue Watching order is timestamp-descending; one entry per `(type,id)`; length ≤ 20.
- **INV-7** Watchlist membership is `(type,id)`; re-toggle restores the exact prior list.
- **INV-8** Unmounting/route-changing during an entrance animation never leaves content at `opacity: 0`.
- **INV-9** No horizontal document overflow at 375 px.
- **INV-10** Signed-out users can browse; only account/cloud features require auth.
- **INV-11** Error states never masquerade as “no results”.
- **INV-12** No uncaught exception reaches the user; the boundary is the last resort, not the expected path.

### 1.3 Out of scope

- Actual playback inside the third-party CineSrc iframe; DRM, buffering, quality.
- Live Supabase schema/RLS correctness (covered only through app-visible sync behaviour).
- Pixel-diff against design comps; this baseline asserts structure/geometry, not art direction.
- TMDB editorial correctness (which title is trending).

---

## 2. EXPECTED UI TRAVERSAL

### 2.1 Route map

```
/                         Home
├─ /movie/:id             Details (movie)
│  └─ /watch/movie/:id    Player
├─ /tv/:id                Details (series)
│  └─ /watch/tv/:id/:s/:e Player + episode browser
├─ /movies?genre=:id      Browse movies + genre filter
├─ /tv?genre=:id          Browse series + genre filter
├─ /search?q=&page=       Results
├─ /watchlist             Library
├─ /auth                  Sign in / sign up
├─ /account               Profile & security
└─ *                      404
```

### 2.2 Selector contract (stable automation anchors)

| Element | Anchor |
|---|---|
| Desktop nav | `nav[aria-label="Desktop navigation"]` |
| Mobile nav | `nav[aria-label="Mobile navigation"]`, `header` top bar |
| Search field | `role=combobox` name “Search movies and series” |
| Suggestions | `role=listbox`; `role=option`; option button `type=button` |
| Search page field | placeholder “Search movies and series...” |
| Account trigger | `button[aria-label="Account"]` / link `[aria-label="Sign in"]` |
| Watchlist toggle | `[aria-label="Add to watchlist"]` / `[aria-label="Remove from watchlist"]` |
| Continue remove | `[aria-label="Remove from continue watching"]` |
| Trailer | `[role=dialog][aria-label="Trailer"]`, `[aria-label="Close trailer"]` |
| Auth errors | `[role=alert]` |
| Search filters | buttons “All”, “Movies”, “Series” with `aria-pressed` |
| Pagination | `nav[aria-label="Search result pages"]`, buttons “Previous page”/“Next page” |

### 2.3 Traversal flows

#### T1 — Cold landing → discover → details → play → back
1. Open `/` with empty storage. `[D]` Hero + rails appear after skeleton; no “Something went wrong”.
2. Observe Continue Watching absent. Click a poster in “Trending This Week”.
3. Expect `/movie/:id`; title, rating, year/runtime (when present), overview, actions.
4. Click **Play Now** → `/watch/movie/:id`; header has “Feature Film”; iframe has a title containing the movie name.
5. Browser Back twice → details → home; scroll position and content restored without blank rails.
6. Pass: no console error; every transition paints within 2 s on fast network.

#### T2 — Genre browse + pagination
1. `/movies`; open **Filters**; select a genre.
2. Expect URL `?genre=<id>`, header “Exploring <Genre>”, page reset to 1, grid refreshed, no duplicate cards.
3. Scroll to the observer sentinel repeatedly. Expect appended pages, spinner only during fetch, `totalPages` eventually reached.
4. Select a different genre mid-load. Expect stale in-flight results not appended to the new genre.
5. Repeat on `/tv`; verify “End of library” at the end and the hero is suppressed while a genre is active.
6. Reload once. Expect the same genre selected from the URL.

#### T3 — Search suggestion path (keyboard + touch)
1. Desktop `/`: press `Ctrl/Cmd+K`. Expect the search field focused and the pill expanded.
2. Type `d`. Expect **no network request** and no listbox.
3. Type `u`. Expect one request after ~250 ms; listbox opens; ≤ 8 options; no people.
4. `ArrowDown` → first option `aria-selected=true` and `aria-activedescendant` set; `ArrowUp` wraps to the last; `Home`/`End` jump.
5. Press `Enter` with a row highlighted → navigates to `/movie/:id` or `/tv/:id`; field clears; panel closes.
6. Reopen, type `dune`, press `Enter` with no highlight → `/search?q=dune`.
7. Click/tap an option → title route, **not** `/search` (button must be `type=button`).
8. Press `Escape` → panel closes and field blurs without navigating.
9. Mobile: repeat through the sheet; backdrop tap/X closes; quick-genre chips only appear while the field is empty.

#### T4 — Search results page as URL state
1. Deep link `/search?q=dune&page=3`. Expect field prefilled, request `dune` page 3, “Page 3 of N”.
2. Edit the field to `dune part two`; observe no URL change until the debounce settles (~400 ms), then `?q=dune+part+two` (no `page`).
3. Verify history: typing does not create one entry per keystroke; Back returns to the prior meaningful state.
4. Toggle **Movies** then **Series**; count updates; only that type is shown; `aria-pressed` switches.
5. Clear the field; URL drops `q`; prompt state returns; no new request is made for the empty query.
6. Use Next/Previous; page changes in URL and network; Back/Forward replay pages from cache without duplicate requests.
7. Force TMDB 500 → distinct error copy (“Could not reach the search service…”), not “No matches found”.
8. Search a no-hit term → “No matches found”.

#### T5 — Search edge behaviour
1. Submit whitespace only, then 1 char, then 2 chars including a space: verify no request until the trimmed length is ≥ 2.
2. Search `zzzz`, `50%`, `a&b`, `<script>alert(1)</script>`, emoji, RTL text: no crash, no script execution, previous results do not blank unnecessarily.
3. On a filtered page, change page: filter selection remains applied to the new page (current behaviour), and the page count is the API’s unfiltered count.

#### T6 — Watchlist round trip
1. Open a movie details page, press **Add to watchlist**. Expect the icon to become a check and the accessible name “Remove from watchlist”.
2. Open `/watchlist`: the card is present; count shows 1 Item; no empty flash on client-side arrival.
3. Reload: card persists; count still 1.
4. Remove via the card. Expect empty state + “Browse Movies” link; count 0.
5. Save both a movie and a TV show that share a TMDB id (e.g. 550). Expect two cards; removing one leaves the other.
6. Block `localStorage.setItem` (quota simulation), add a title. Expect the non-persistence warning and the in-memory item; reload may lose it (documented behaviour).

#### T7 — Continue watching
1. Seed history then open `/`. Expect the rail, newest first, correct `S/E` badge for TV, progress bar width ≥ 3%.
2. Click a TV item → `/watch/tv/:id/:season/:episode` for the stored episode, not `1/1`.
3. Click remove on the rail. Expect it disappears immediately and stays gone after reload.
4. Add 21 distinct entries. Expect only 20, newest first, oldest dropped.
5. Seed a movie and a TV show with the same id. Expect both rows.

#### T8 — Player progress contract
1. Open `/watch/movie/:id`; wait for metadata. Confirm the iframe src contains the movie id and the watch title updates.
2. Simulate/allow CineSrc `timeupdate` events. Expect progress persisted at most once per 15 s, clamped to 0–100, and the rail timestamp refreshed.
3. Ignore messages from any other origin, non-object payloads, `duration ≤ 0`, and non-numeric times.
4. On `/watch/tv/:id/:s/:e`, send `nextepisode`:
   - `internalNavigation: true` → URL replaced without iframe remount; badge/title/episode list update.
   - otherwise → navigate with replace; iframe remounts once.
5. Verify Up Next advances to `e+1`, else next season `1`, else “Season Finale Reached”.
6. Invalid id → “Title not found” + “Go Home”. Invalid season/episode strings fall back to `1`.

#### T9 — Auth and redirect
1. Signed out, open `/account` → gate with **Sign In**.
2. From `/movies`, click **Sign In** in the account menu. Expect `/auth`; after successful sign-in return to `/movies`.
3. Submit empty email → “Enter your email address.”; password 5 chars → “Password needs to be at least 6 characters.”; both client-side, no network.
4. Wrong credentials → “That email and password don't match an account.”
5. Signup with a new email → either immediate sign-in or “Check your inbox”; “Back to sign in” restores the form.
6. Signed-in user manually opens `/auth` → redirected to `from` or `/`.
7. Supabase env absent → auth actions report “Supabase is not configured on this deployment.” and the app does not white-screen.

#### T10 — Account management
1. Sign in → `/account`. Identity shows display name (or email prefix), email, member-since, avatar initial.
2. Save a display name. Expect success toast and persistence after reload; `maxLength` caps at 40.
3. Choose each avatar colour. Expect `aria-pressed` to follow and the header/avatar to update immediately.
4. Toggle both autoplay switches; reload; states persist.
5. Change password: 5 chars → error toast; 6+ → success and field clears.
6. Change email: invalid value → native validation or “Enter a valid email address”; valid → “Check your inbox…”.
7. “Sign out on all other devices” → success/error toast and disabled state during the call.
8. “Clear local data on this device” → success toast; `/watchlist` and Continue Watching are empty; account data remains.
9. Sign out → `/`; account menu becomes Sign In; protected routes show gates.

#### T11 — Mobile chrome and sheets
1. 375 px: top bar + bottom dock; no desktop nav; active dock item has the moving indicator.
2. Open the search sheet: body scroll locks; sheet slides up; backdrop/X closes; focus lands in the field.
3. Tap a quick genre from Home → `/movies?genre=…`; sheet closes (pathname changed).
4. **Regression probe:** open the sheet while already on `/movies`, tap a quick genre. The pathname does not change; the sheet should still close. Current close effect watches only `pathname` (`MobileNav.tsx:32-35`), so verify this explicitly.
5. Dock navigation preserves the active state and does not cover the last content row (bottom padding).

#### T12 — Reduced motion, deep links, PWA
1. Emulate `prefers-reduced-motion: reduce`; reload all main routes. Content must be visible and static; no staggered opacity dip.
2. Disable JS animations at runtime (or throttle CPU) and navigate client-side to `/watchlist`; cards must still paint.
3. Direct-load every route in a fresh tab (no client-side navigation): `/`, `/movies?genre=28`, `/tv?genre=16`, `/search?q=dune&page=2`, `/movie/550`, `/tv/1399`, `/watch/movie/550`, `/watch/tv/1399/1/1`, `/watchlist`, `/auth`, `/account`, `/nope`.
4. Rebuild/redeploy, reload a previously visited route; confirm the new document is fetched (network-first) and hashed assets are cached.

### 2.4 Accessibility traversal

- Tab order: skip-link/nav → search → account → main content → dock.
- Search: combobox/listbox roles, `aria-expanded`, `aria-controls`, `aria-activedescendant`, option `aria-selected`.
- Account menu: `aria-expanded`, Escape closes, outside click closes, focus returns sensibly.
- Trailer dialog: `role=dialog aria-modal=true`; verify close button focus, Escape, and focus return (currently **no focus trap/Escape** — see D-20).
- All icon-only buttons have names; stateful ones expose pressed/checked.
- Colour contrast on muted text over glass; focus ring visible on dark backgrounds.

---

## 3. DATA BOUNDARIES

### 3.1 Search inputs

Constants: `MIN_QUERY_LENGTH=2`, `SEARCH_DEBOUNCE_MS=250`, page debounce 400, `SUGGESTION_LIMIT=8`, `PAGE_SIZE=20` (`src/lib/search.ts:15-24`).

| Class | Values | Expected |
|---|---|---|
| Valid | `dune`, `The Office`, `severance`, `spider-man`, `amélie`, `三体` | Trimmed query sent after debounce; results render |
| Below threshold | `""`, `" "`, `"   "`, `a`, `" a "` | No network request; dropdown hidden (`SearchBox.tsx:64`); page URL clears |
| Boundary | 2 chars exactly (`ab`); 2 chars with edge spaces (`" ab "`) | Trimmed length 2 → request; 1 → none |
| Whitespace | leading/trailing tabs/newlines | URL and request use trimmed value |
| Case | `DUNE` vs `dune` | No client-side lowercasing; both must not crash; API decides |
| URL metacharacters | `%`, `&`, `#`, `?`, `/`, `+`, `=`, `&page=9` | Properly percent-encoded; page is not injected |
| Markup | `<img src=x onerror=…>`, `<script>` | Rendered as text; no execution |
| Unicode | emoji, RTL, zero-width joiner, combining marks | No truncation crash; stable key |
| Long | 100, 255, 500, 2048 chars | No crash; request/URL may fail gracefully; previous results not lost |
| Duplicate submit | same query twice, Enter twice | Same route; no duplicate request within 60 s cache |
| Pagination | `0`, `-1`, `0.5`, `1.5`, `abc`, `1e3`, `9999`, empty | Normalized to positive integer (`readSearchParams`); no `NaN` in request |
| Type filter | All / Movies / Series | All ⊇ each; counts update; filter is per-page |
| Genre | `28`, `16`, `0`, `-5`, `abc`, `999999`, duplicate `genre` params | Valid id filters; invalid must not crash or emit `NaN` |

### 3.2 Auth inputs

| Field | Valid | Edge / limits | Current rule |
|---|---|---|---|
| Email | `user@example.com`, `user+tag@example.com` | `""`, spaces, `a`, `a@`, `@b`, `a@b`, 254/255 chars, unicode, uppercase, leading/trailing spaces | Client: trimmed non-empty only (`Auth.tsx:42`); `<form noValidate>` (`:110`) → malformed values reach Supabase |
| Password | 6+ chars | 0–5, exactly 6, 72, 73, 1000, six spaces, unicode | Client: `password.length >= 6`; **not trimmed** (`Auth.tsx:43`) |
| Signup confirmation | New email | Existing email, rate-limited, network failure | No session → “Check your inbox”; existing email may also land there (enumeration-safe) |
| Error mapping | Wrong password, existing account, short password, rate limit, other | Raw Supabase text for unmapped errors | `AuthProvider.tsx:13-28` |
| Redirect | `from` path | Query/hash deep link, `/watch/...`, 404 | Only `location.pathname` is stored (`AccountMenu.tsx:54`); query/hash are lost |

### 3.3 Account/profile inputs

| Field | Valid | Edge / limits | Current rule |
|---|---|---|---|
| Display name | `Harsh`, `Alex Kim` | `""`, spaces, 1, 40, 41, emoji, RTL, HTML | Trimmed (`Account.tsx:103`); `maxLength=40` (`:202`); empty falls back to email prefix |
| Avatar colour | 8 listed hex values | Arbitrary/remote value, `null`, CSS injection attempt | Accepts stored string (`profile.ts:82`); no allow-list check |
| Autoplay flags | `true`/`false` | Rapid toggling, reload, sync conflict | Immediate local commit + remote upsert (`profile.ts:102-111`) |
| Email change | `a@b.co` | `a@b`, `@`, `a b@c`, 255 chars | Native `type=email` validation plus `includes("@")` (`Account.tsx:121`) |
| Password change | 6+ | 0–5, spaces, 1000 | `length >= 6` (`Account.tsx:110`); no max |
| Clear local data | — | Repeated clicks; signed-out state | Removes watchlist/continue/recent (`storage.ts:333-339`) |

### 3.4 Persistence payload boundaries

Keys: `uncflix_watchlist`, `uncflix_recent`, `uncflix_continue`, `uncflix_profile`, `uncflix_persist_probe`, `uncflix.auth`.

| Payload | Edge values | Expected |
|---|---|---|
| Watchlist array | `[]`, 1, 20, 100+ items | Rendered; no cap on watchlist |
| Duplicate watchlist | Same `(type,id)` twice | Toggle removes; merge should not duplicate |
| Same id, different type | movie 550 + tv 550 | Both retained |
| Malformed JSON | `{bad`, `null`, `"str"`, `{}` | Read falls back to `[]` (`storage.ts:34-41`); **a non-array truthy value is not shape-checked** — probe for `.some/.map` crash |
| Missing fields | No `title`, no `poster_path`, no `media_type` | Fallback title/poster/type; no crash |
| Continue progress | `-5`, `0`, `3`, `100`, `150`, `NaN` | UI clamps visual min 3% (`ContinueRow.tsx:115-116`); stored value unvalidated |
| Continue timestamp | `0`, past, future, invalid date string from DB | Explicit 0 becomes `Date.now()` (`storage.ts:228`); invalid DB date becomes now (`continueSync.ts:34`) |
| Continue season/episode | `0`, `-1`, `1`, `1.5`, `"x"` | Route builder uses `item.season || 1`; negatives/decimals flow through |
| Continue cap | 19, 20, 21 distinct | ≤ 20, newest first |
| Cross-account | Local library from account A, then sign in as B | B must not inherit A’s titles (high-risk probe) |
| Private mode/quota | `setItem` throws | In-memory UI works; persistence warning shown; subscriber notified |
| Multi-tab | Add/remove in tab 1 | Tab 2 currently has no `storage` listener; verify refresh requirement |

Compact valid seed:

```json
// uncflix_watchlist
[{"id":550,"title":"Fight Club","media_type":"movie","overview":"","poster_path":null,"backdrop_path":null,"vote_average":8.4,"vote_count":100}]
// uncflix_continue
[{"id":1399,"type":"tv","title":"Game of Thrones","poster_path":null,"backdrop_path":null,"progress":42,"season":2,"episode":5,"timestamp":1700000000000}]
```

### 3.5 Player message contract

Origin must equal the first configured source (`WatchMovie.tsx:61`, `WatchTv.tsx:97`).

| Message | Boundary values | Expected |
|---|---|---|
| Any | `null`, string, array, `{}` | Ignored |
| `cinesrc:timeupdate` | `currentTime`/`duration` numeric; `duration` 0, -1, `NaN`; currentTime negative/Infinity | Persist only when `duration > 0`; progress `Math.min(100, round(...))` (can still be negative) |
| Throttle | Two events <15 s apart | Second is dropped; timestamp of last save is not advanced by dropped events |
| `cinesrc:nextepisode` | Missing/0/NaN season or episode; same episode; `internalNavigation` true/false; next season does not exist | Ignore invalid; identical → no-op; internal → `replaceState` without remount; external → navigate replace |
| Origin spoof | Different origin | Ignored |
| Duplicate events | Same payload flood | Idempotent storage (replace, not duplicate); no render storm |

### 3.6 TMDB/API boundaries

| Condition | Expected |
|---|---|
| Empty `results` | Empty state, not error |
| `total_pages: 0` or 1 | Pagination hidden or single page |
| `results` contains `media_type: person` | Filtered out |
| Duplicate row / same id movie+tv | De-duplicated by `type:id`; two distinct links |
| Missing poster/backdrop | Neutral inline SVG or initial fallback (`tmdb.ts:161-175`) |
| Broken image URL | `onError` swaps to fallback; no blank card |
| `vote_average: 0` | Rating badge hidden |
| `overview: ""` | “No description available.” on watch pages |
| HTTP 500 / timeout | Search: explicit error; Home: recovery screen; Browse: currently conflated with empty (probe) |
| Slow older response | Aborted; newer results win |
| `formatCount` | 999, 1000, 999999, 1 000 000, negative |
| Invalid date string | `getYear` yields `""` or a nonsense substring probe |

### 3.7 Metamorphic relations

| ID | Transformation | Relation |
|---|---|---|
| MR-01 | Add leading/trailing whitespace to a query | Same trimmed request, same URL target, same results |
| MR-02 | Submit the same query twice | Same route; second call served from cache within `staleTime` |
| MR-03 | Query under 2 chars with any number of keystrokes | Zero search requests |
| MR-04 | Filter All → Movies ∪ Series | Union equals the unfiltered current page; intersection is empty |
| MR-05 | Next page then previous | Page N result ids identical; no duplicate network within cache window |
| MR-06 | Toggle watchlist twice | List, count and membership return to the original state |
| MR-07 | Reload after saving | Same titles and same order |
| MR-08 | Same TMDB id, different type | Independent membership, route, history entry |
| MR-09 | Update the same continue item twice | One entry, latest progress/timestamp |
| MR-10 | Add N > 20 continue items | Length exactly 20; drop order is oldest |
| MR-11 | Reduced motion on/off | Same DOM text/count/links; only animation differs |
| MR-12 | Reload any route vs client-side navigation | Same content and no blank-under-count |
| MR-13 | Deep link with `page=n` vs clicking next n−1 times | Same URL and same results |
| MR-14 | Email with surrounding spaces | Trimmed identity; same account/auth outcome |
| MR-15 | Saved title with/without artwork | Same route and accessible title; only image source differs |

### 3.8 Auth-required data matrix

| Case | Local state | Remote state | Expected |
|---|---|---|---|
| Anonymous save | 2 titles | none | Local library only |
| First sign-in | 2 local | 3 remote, 1 overlap | Union = 4; no duplicate; local uploads the missing 2 |
| Existing sign-in | 2 local | 3 remote | Same additive rule |
| Remote newer continue | progress 10 | progress 95, newer | Remote wins |
| Local newer continue | progress 80, newer | progress 5 | Local wins + upload |
| Sign-out | local library remains on device | untouched | Writes stop; next account must be checked for inheritance |
| Account switch A→B | A’s merged local cache | B’s list | No A-only titles leak into B (probe) |

---

## 4. DEFECT PATTERNS

### 4.1 Historical regressions (fixed — DeepTest must keep them fixed)

| ID | Pattern | Evidence / guard | Assertion seed |
|---|---|---|---|
| D-01 | Watchlist grid stayed at `opacity: 0` under a correct item count after client-side navigation | Variant labels removed; CSS-only card entrance (`Watchlist.tsx:19-23`; `src/test/watchlistRender.test.tsx:27-44`) | Navigate Home → Watchlist; assert cards’ computed opacity is 1 without reload |
| D-02 | Watchlist mutated the cached array in place, so React bailed out and the library never updated | New array on every mutation (`storage.ts:146-168`) | Toggle twice; DOM count changes each time |
| D-03 | Library seeded from `useState([])`, causing a first-frame empty state | `useSyncExternalStore` (`useWatchlist.ts:26-27`) | Seed storage, client-navigate; first paint has cards |
| D-04 | Same TMDB id for movie and show collided in keys and membership | `type:id` keying (`search.ts:43-50`, `storage.ts:132-140`, `watchlistSync.ts:21-24`) | Search 550; both links; save both; remove one |
| D-05 | Stale search response overwrote the newer one | AbortSignal + query key (`useSearchResults.ts:21-25,44-53`; `tmdb.ts:5-20`) | Slow `dune`, fast `dune part`; newest wins |
| D-06 | Nav dropdown and results page used different filtering/trimming | Single `lib/search.ts`; `toTitles` used by both | Same query yields same title set on both surfaces |
| D-07 | Suggestions were unreachable by keyboard/screen reader; option button submitted the form | Combobox ARIA + `type=button` (`SearchBox.tsx:134-160`, `SearchDropdown.tsx:81-88`) | Arrow/Enter/Escape; click option → title route |
| D-08 | Search page ignored its own input / did not reflect in URL | URL-driven page + debounced draft (`SearchPage.tsx:28-51`) | Type → URL after settle → reload reproduces |
| D-09 | Auth trimmed email in one path but not another | Trim at submit (`Auth.tsx:42`; `AuthProvider.tsx:83-98`) | Email with edge spaces signs into the same account |
| D-10 | Service worker cached non-root documents and pinned itself | Network-first navigate/document, `/sw.js` guard (`public/sw.js`; `src/test/sw.test.ts:14-36`) | Reload `/watchlist` after deploy → fresh build |
| D-11 | Continue entries clobbered a movie/show with the same id; sync overwrote newer history | `(type,id)` + timestamp merge (`storage.ts:227-239,290-318`) | Seed both; newest progress wins |
| D-12 | Persistence failure was silent (private mode/quota) | Probe + warning (`storage.ts:47-102`; `Watchlist.tsx:48-57`) | Simulate quota; warning visible |
| D-13 | Search grid dropped cells because keys were bare ids | `searchResultKey` (`SearchPage.tsx:203`) | Movie 550 + show 550 both render |
| D-14 | Progress bar width transition (accepted visual exception) | `src/styles/components.css:690,972` | Do **not** file as a defect |
| D-15 | Trailer overlay `stopPropagation` wrappers (accepted) | `MovieDetails.tsx:122`, `TvDetails.tsx:166` | Do **not** file as a defect |

### 4.2 Fragile points / candidate defects to probe

Label **V** = verified from source, needs a runtime repro; **H** = hypothesis requiring investigation.

| ID | Sev | Pattern | Evidence | Probe |
|---|---|---|---|---|
| D-16 | **S1** | **Cross-account library inheritance.** Sign-out clears in-memory caches only; localStorage still holds the previous account’s merged watchlist/continue. The next sign-in is additive, so account B can receive account A’s titles. | `AuthProvider.tsx:58-64`; `storage.ts:263-282,324-331` | A saves 2, signs out; B signs in on the same browser; assert B’s library |
| D-17 | S2 | **Auth redirect drops query/hash.** Only `location.pathname` is passed as `from`; signing in from `/search?q=dune&page=2` loses the search. | `AccountMenu.tsx:54`; `Auth.tsx:28` | Gate a deep link, sign in, compare URL |
| D-18 | S2 | **Account email validation is `includes("@")`.** `a@b`, `@`, `a b@c` can reach Supabase (native `type=email` may block some). Auth has no format check at all (`noValidate`). | `Account.tsx:121`; `Auth.tsx:42,110` | Try malformed addresses on both forms |
| D-19 | S2 | **Browse fetch errors look like “No matches found”.** `catch` only logs; `loading` ends with an empty list, so network/API failure renders the empty state. TV has no empty state at all. | `Movies.tsx:56-71,204-225`; `TvShows.tsx:54-72` | Force `/discover/movie` 500; assert error copy, not empty |
| D-20 | S2 | **Trailer modal lacks Escape/focus trap/scroll lock.** Only a close button and backdrop click exist. | `MovieDetails.tsx:114-141`; `TvDetails.tsx` equivalent | Open trailer; press Escape; Tab through page behind |
| D-21 | S2 | **Mobile quick genre can leave the search sheet open.** The close effect watches `pathname` only; from `/movies` to `/movies?genre=…` the pathname is unchanged. | `MobileNav.tsx:32-35,149-163` | On `/movies`, open sheet, tap genre, assert sheet closed |
| D-22 | S3 | **Opening a series moves it to the top of Continue Watching** even without playback: mount writes `progress: prior?.progress ?? 0` with `timestamp: Date.now()`. Movies do not do this. | `WatchTv.tsx:62-73`; contrast `WatchMovie.tsx:59-82` | Seed 3 items, open the oldest show, go home, inspect order |
| D-23 | S3 | **Invalid URL params are not normalized.** `page=9999` is requested verbatim and renders an empty state instead of clamping/redirecting, while the API may still report 4 total pages; genre `abc/-5/0` is passed through or silently dropped; season/episode accept negatives/decimals and only fall back for `0`/NaN. | `search.ts:97-105`; `SearchPage.tsx:209-236`; `Movies.tsx:52-54`; `WatchTv.tsx:33-34` | Deep-link each invalid value |
| D-24 | S3 | **Search filtering is page-local while pagination is global.** With Series selected, a page may show 3 items and still claim 4 pages; filter state is not in the URL, so reload/back loses it. | `SearchPage.tsx:31,58,189-193,209-236` | Filter + page + reload |
| D-25 | S3 | **Home is all-or-nothing.** `Promise.all` of five endpoints means one failure blanks the entire home instead of degrading one rail. | `Index.tsx:44-65` | Fail one endpoint only |
| D-26 | S3 | **LocalStorage shape is trusted.** `read()` catches JSON errors but returns any parsed value as `T[]`; `{}` or `"str"` can crash `.some`/`.map`. | `storage.ts:34-41`; `profile.ts:46-55` | Seed `{}` under each key |
| D-27 | S3 | **Recently viewed de-dupes by id only.** A movie and a show sharing an id overwrite each other. | `storage.ts:189-193` | View movie 550 then show 550; check the rail |
| D-28 | S3 | **Continue row React keys use id only.** Storage and links are type-aware, but the rail key is `item.id`, so id-equal movie/show entries can collide. | `ContinueRow.tsx:85` | Seed both; assert both rendered/updated independently |
| D-29 | S3 | **Multi-tab state is not synchronized.** No `storage` listener; another tab’s save/remove is invisible until reload. | `storage.ts` listeners are in-memory only | Two tabs, mutate one, observe the other |
| D-30 | S3 | **Continue timestamps are weakly validated.** Invalid DB dates become `Date.now()` and can beat genuinely newer local progress; clock skew decides winners. | `continueSync.ts:34`; `storage.ts:304-307` | Seed `updated_at: "nope"` with stale progress |
| D-31 | S3 | **Recently viewed/continue can resurrect remote-deleted rows.** Continue merge is union + newest-wins; a deletion on another device can be re-uploaded by a stale local cache. | `storage.ts:290-318` | Delete remotely, then sign in from a stale device |
| D-32 | S4 | **Search box can be cleared twice on WebKit.** `type="search"` renders a native clear affordance alongside the custom clear button. | `SearchPage.tsx:95-113` | Safari: count clear controls |
| D-33 | S4 | **`getYear` is a substring.** Malformed dates yield partial/false years rather than `""`. | `tmdb.ts:189-192` | Feed `release_date: "20"` / `"abcd-ef"` |
| D-34 | S4 | **Auth redirect is a render-time side effect.** `navigate()` runs in the component body, which can warn or loop under StrictMode. | `Auth.tsx:34-36` | Signed-in visit to `/auth` with console capture |
| D-35 | S4 | **Profile/avatar values are unvalidated.** Remote `avatar_color` is injected into inline CSS; display names can be whitespace-only until fallback. | `profile.ts:79-86,102-111` | Seed a weird remote profile |

### 4.3 Accepted exceptions (do not report)

- Progress-bar `width` transitions (`components.css:690`, `:972`) — intentional.
- Trailer frame `stopPropagation` wrappers (`MovieDetails.tsx:122`, `TvDetails.tsx:166`) — intentional.
- Search dropdown removal is synchronous (no exit animation) — tests assert synchronous listbox removal (`searchBox.test.tsx:250-252`).
- Third-party iframe playback, CineSrc branding, ads, and stream availability.
- jsdom `matchMedia` stubbing with `matches: false` in the unit suite — test-environment detail, not product behaviour.

### 4.4 Highest-value first probes

1. **D-16 cross-account inheritance** — data/privacy; easiest to reproduce and highest impact.
2. **D-19 browse error conflation** — users see “No matches found” during outages.
3. **D-21 mobile sheet stays open** — deterministic pathname logic; cheap check.
4. **D-17 deep-link redirect loss** — breaks shareable search URLs through auth.
5. **D-22 continue order on mere open** — misleads “pick up where you left off”.
6. **D-23/D-24 pagination/filter boundaries** — URL-driven decision paths DeepTest should explore.
7. **D-26 corrupt-storage crash** — one-line seed, potentially S1 if it white-screens.
8. **D-20 trailer a11y** — keyboard users cannot dismiss.

---

## 5. Traceability and Suite Seeding

### 5.1 Existing coverage to preserve

| Area | Existing tests |
|---|---|
| Search suggestions/ARIA/abort/cache | `src/test/searchBox.test.tsx` |
| Search page URL/filter/pagination/errors | `src/test/searchPage.test.tsx` |
| Search primitives | `src/test/search.test.ts` |
| Watchlist render/entrance/first render | `src/test/watchlistRender.test.tsx` |
| Watchlist store/persistence/isolation | `src/test/watchlistStore.test.ts` |
| Watchlist sync | `src/test/watchlistSync.test.ts` |
| Continue sync/merge/row mapping | `src/test/continueSync.test.ts` |
| Service worker policy | `src/test/sw.test.ts` |
| Image fallbacks | `src/test/tmdbImages.test.ts` |
| Route smoke | `src/test/routes.smoke.test.tsx` |

### 5.2 Suggested new DeepTest groups

```
@smoke        routes + shell + 404
@search       T3, T4, T5 + boundaries 3.1 + MR-01..05
@browse       T2 + D-19, D-23
@library      T6, T7 + boundaries 3.4 + MR-06..10
@player       T8 + boundaries 3.5
@auth         T9 + boundaries 3.2 + D-17, D-18, D-34
@account      T10 + boundaries 3.3 + D-16
@mobile       T11 + D-21 + viewport 375/414
@a11y-motion  T12 + §2.4 + D-20 + MR-11
@regression   D-01..D-15 guard assertions
```

### 5.3 Mapping requirements → flows

| Requirement | Flows | Boundary suites | Defect guards |
|---|---|---|---|
| R1, R15 | T1, T12 | 3.7 | D-10; route-smoke on `*` |
| R2 | T1, T7 | 3.6 | D-25 |
| R3 | T2 | 3.1 (genre) | D-19, D-23 |
| R4, R5 | T3, T4, T5 | 3.1, 3.6 | D-05..D-08, D-13, D-24 |
| R6 | T1, T6 | 3.6 | D-20 |
| R7 | T6 | 3.4 | D-01..D-04, D-12 |
| R8, R9 | T7, T8 | 3.4, 3.5 | D-11, D-22, D-27, D-28, D-30, D-31 |
| R10 | T9 | 3.2 | D-09, D-17, D-34 |
| R11 | T10 | 3.3 | D-18, D-35 |
| R12 | A→B matrix | 3.8 | D-16, D-31 |
| R13 | T4.7, T2.4 | 3.6 | D-19, D-25, D-26 |
| R14 | T3.4, T12, §2.4 | 3.7 | D-20, D-32 |

---

## 6. Execution Notes and Known Harness Limits

- The current local browser tooling cannot resize the viewport or emulate devices; responsive cases (375/414/768/1024/1440) and true cross-origin player messages must be run in a runner with emulation or on a physical device via `http://192.168.1.3:5001`.
- Supabase may be inert when `VITE_SUPABASE_*` is unset (`src/lib/supabase.ts:11-53`). Auth/sync cases need a configured test environment; without it, assert the explicit “Supabase is not configured” error path only.
- CineSrc events are cross-origin; `event.origin` cannot be spoofed from page script. Use unit-level `MessageEvent` fixtures for the handler contract and seed localStorage for end-to-end rail assertions.
- TMDB requires deterministic interception for request-count and slow/failed-response oracles. Do not assert on live editorial content.
- Timestamps/dates are locale-dependent (`Member since`, air dates); pin the locale or assert shape, not exact text.
