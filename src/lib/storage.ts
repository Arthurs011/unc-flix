import { Movie } from "./tmdb";
import {
  fetchRemoteContinue,
  upsertRemoteContinue,
  upsertRemoteContinueBatch,
  deleteRemoteContinue,
} from "./continueSync";
import {
  fetchRemoteWatchlist,
  upsertRemoteWatchlist,
  upsertRemoteWatchlistBatch,
  deleteRemoteWatchlist,
  sameTitle,
  titleType,
} from "./watchlistSync";

const WATCHLIST_KEY = "uncflix_watchlist";
const RECENT_KEY = "uncflix_recent";
const CONTINUE_KEY = "uncflix_continue";
const MAX_CONTINUE = 20;

export interface ContinueItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: number; // 0-100
  season?: number;
  episode?: number;
  timestamp: number;
}

function read<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

let persistenceOk = true;
let persistenceProbed = false;
const persistenceListeners = new Set<() => void>();

/**
 * Whether this browser can persist at all. iOS Safari private browsing and a
 * full quota make setItem throw, so the save appears to work in memory and the
 * next page load renders an empty library with no explanation.
 *
 * Probed once up front rather than inferred from a failed write, because the
 * failure happens on the page where the user taps save: by the time they open
 * the library, a write has not been attempted in that session and the flag would
 * still read healthy.
 */
function probePersistence() {
  if (persistenceProbed) return;
  persistenceProbed = true;
  const key = "uncflix_persist_probe";
  try {
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    setPersistence(true);
  } catch {
    setPersistence(false);
  }
}

/**
 * True when this browser can actually persist the watchlist.
 */
export function isWatchlistPersistent(): boolean {
  probePersistence();
  return persistenceOk;
}

export function subscribeWatchlistPersistence(listener: () => void) {
  persistenceListeners.add(listener);
  return () => {
    persistenceListeners.delete(listener);
  };
}

function setPersistence(ok: boolean) {
  if (persistenceOk === ok) return;
  persistenceOk = ok;
  persistenceListeners.forEach((l) => l());
}

function write<T>(key: string, data: T[]) {
  probePersistence();
  try {
    localStorage.setItem(key, JSON.stringify(data));
    setPersistence(true);
  } catch {
    // The in-memory cache still works, so a failed write must not break the UI,
    // but it must not be silent either: the caller surfaces a warning so a saved
    // title isn't silently lost on the next page load.
    setPersistence(false);
  }
}

// ---------- Watchlist (local cache + account sync) ----------

let watchlistCache: Movie[] | null = null;
const watchlistListeners = new Set<() => void>();

function watchlistCacheValue(): Movie[] {
  if (watchlistCache === null) watchlistCache = read<Movie>(WATCHLIST_KEY);
  return watchlistCache;
}

function commitWatchlist(items: Movie[], notify = true) {
  watchlistCache = items;
  write(WATCHLIST_KEY, items);
  if (notify) watchlistListeners.forEach((l) => l());
}

/** Subscribe to watchlist changes. Returns an unsubscribe function. */
export function subscribeWatchlist(listener: () => void) {
  watchlistListeners.add(listener);
  return () => {
    watchlistListeners.delete(listener);
  };
}

export function getWatchlist(): Movie[] {
  return watchlistCacheValue();
}

/**
 * TMDB ids repeat across media types, so membership has to consider the type
 * too. Passing only an id checks the movie and the show with that id.
 */
export function isInWatchlist(id: number, type?: "movie" | "tv"): boolean {
  const list = getWatchlist();
  if (!type) return list.some((m) => m.id === id);
  return list.some((m) => sameTitle(m, id, type));
}

export function toggleWatchlist(movie: Movie): boolean {
  const type = titleType(movie);
  const list = getWatchlist();
  const idx = list.findIndex((m) => sameTitle(m, movie.id, type));
  // Build a new array. Mutating the cached one in place left React comparing the
  // next state against the identical reference it already holds, so it bailed
  // out of the re-render and the saved item never appeared in the library even
  // though it was stored correctly.
  let added: boolean;
  let next: Movie[];
  if (idx >= 0) {
    next = list.filter((_, i) => i !== idx);
    added = false;
  } else {
    next = [movie, ...list];
    added = true;
  }
  commitWatchlist(next);

  if (!remoteUserId) return added;

  const call = added
    ? upsertRemoteWatchlist(remoteUserId, movie)
    : deleteRemoteWatchlist(remoteUserId, type, movie.id);
  call.catch((e) => console.error("watchlist sync failed", e));
  return added;
}

export function removeFromWatchlist(id: number, type?: "movie" | "tv") {
  const list = getWatchlist();
  const target = list.find((m) => (type ? sameTitle(m, id, type) : m.id === id));
  commitWatchlist(
    type ? list.filter((m) => !sameTitle(m, id, type)) : list.filter((m) => m.id !== id),
  );

  if (remoteUserId && target) {
    deleteRemoteWatchlist(remoteUserId, titleType(target), target.id).catch((e) => {
      console.error("watchlist delete failed", e);
    });
  }
}

// ---------- Recently Viewed (stays device-local) ----------
export function getRecentlyViewed(): Movie[] {
  return read<Movie>(RECENT_KEY);
}

export function addRecentlyViewed(movie: Movie) {
  const list = getRecentlyViewed().filter((m) => m.id !== movie.id);
  list.unshift(movie);
  write(RECENT_KEY, list.slice(0, 20));
}

// ---------- Continue Watching (local cache + account sync) ----------

const sameMedia = (a: ContinueItem, id: number, type: "movie" | "tv") =>
  a.id === id && a.type === type;

let continueCache: ContinueItem[] | null = null;
let remoteUserId: string | null = null;
const listeners = new Set<() => void>();

function cache(): ContinueItem[] {
  if (continueCache === null) continueCache = read<ContinueItem>(CONTINUE_KEY);
  return continueCache;
}

function commit(items: ContinueItem[], notify = true) {
  continueCache = items.slice(0, MAX_CONTINUE);
  write(CONTINUE_KEY, continueCache);
  if (notify) listeners.forEach((l) => l());
}

/** Subscribe to continue-watching changes. Returns an unsubscribe function. */
export function subscribeContinueWatching(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getContinueWatching(): ContinueItem[] {
  return cache();
}

export function updateContinueWatching(item: ContinueItem) {
  const next = { ...item, timestamp: item.timestamp || Date.now() };
  // Key on id *and* type so a movie and a show sharing a TMDB id don't clobber.
  const list = cache().filter((c) => !sameMedia(c, next.id, next.type));
  list.unshift(next);
  commit(list);

  if (remoteUserId) {
    upsertRemoteContinue(remoteUserId, next).catch((e) => {
      console.error("continue-watching sync failed", e);
    });
  }
}

export function removeContinueWatching(id: number, type: "movie" | "tv" = "movie") {
  const target = cache().find((c) => sameMedia(c, id, type));
  commit(cache().filter((c) => !sameMedia(c, id, type)));

  if (remoteUserId && target) {
    deleteRemoteContinue(remoteUserId, target.type, target.id).catch((e) => {
      console.error("continue-watching delete failed", e);
    });
  }
}

/** Called when the session changes. Stops remote writes on sign-out. */
export function setRemoteUser(userId: string | null) {
  remoteUserId = userId;
}

/**
 * Union this device's watchlist with the account's. Additive on purpose: a
 * saved title is never dropped by signing in, so a phone's library and a
 * laptop's library end up merged rather than one overwriting the other.
 * Uploads are upserts against the unique (user, media_type, media_id) index.
 */
export async function syncWatchlistForUser(userId: string): Promise<void> {
  remoteUserId = userId;

  const local = getWatchlist();
  const remote = await fetchRemoteWatchlist();

  const merged = [...remote];
  const toUpload: Movie[] = [];

  for (const movie of local) {
    if (!merged.some((m) => sameTitle(m, movie.id, titleType(movie)))) {
      merged.push(movie);
      toUpload.push(movie);
    }
  }

  commitWatchlist(merged, false);
  if (toUpload.length) await upsertRemoteWatchlistBatch(userId, toUpload);
  watchlistListeners.forEach((l) => l());
}

/**
 * Pull the account's continue-watching down, then push anything this device
 * has that the account is missing or is behind on. Where both sides have an
 * entry, the more recently updated one wins. Uploads are upserts against the
 * (user, media_type, media_id) unique index, so re-sending is harmless.
 */
export async function syncContinueWatchingForUser(userId: string): Promise<void> {
  remoteUserId = userId;

  const local = cache();
  const remote = await fetchRemoteContinue();

  const merged = [...remote];
  const toUpload: ContinueItem[] = [];

  for (const item of local) {
    const idx = merged.findIndex((c) => sameMedia(c, item.id, item.type));
    if (idx === -1) {
      merged.push(item);
      toUpload.push(item);
    } else if (item.timestamp > merged[idx].timestamp) {
      merged[idx] = item;
      toUpload.push(item);
    }
  }

  merged.sort((a, b) => b.timestamp - a.timestamp);
  commit(merged, false);

  if (toUpload.length) {
    await upsertRemoteContinueBatch(userId, toUpload);
  }

  listeners.forEach((l) => l());
}

/**
 * Clears every signed-out user's cached copies without touching their data in
 * the account, so the next sign-in can re-pull it from the server.
 */
export function resetSyncedCaches() {
  continueCache = null;
  watchlistCache = null;
  // Re-probe on the next read: storage health can differ between sessions, and
  // a private-browsing tab is a different situation each time it opens.
  persistenceProbed = false;
  persistenceOk = true;
}

export function clearLocalUserData() {
  localStorage.removeItem(WATCHLIST_KEY);
  localStorage.removeItem(CONTINUE_KEY);
  localStorage.removeItem(RECENT_KEY);
  continueCache = null;
  watchlistCache = null;
}
