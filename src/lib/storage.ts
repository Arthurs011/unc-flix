import { Movie } from "./tmdb";
import {
  fetchRemoteContinue,
  upsertRemoteContinue,
  upsertRemoteContinueBatch,
  deleteRemoteContinue,
} from "./continueSync";

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

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------- Watchlist (stays device-local) ----------
export function getWatchlist(): Movie[] {
  return read<Movie>(WATCHLIST_KEY);
}

export function isInWatchlist(id: number): boolean {
  return getWatchlist().some((m) => m.id === id);
}

export function toggleWatchlist(movie: Movie): boolean {
  const list = getWatchlist();
  const idx = list.findIndex((m) => m.id === movie.id);
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(movie);
    added = true;
  }
  write(WATCHLIST_KEY, list);
  return added;
}

export function removeFromWatchlist(id: number) {
  const remaining = getWatchlist().filter((m) => m.id !== id);
  write(WATCHLIST_KEY, remaining);
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

export function clearLocalUserData() {
  localStorage.removeItem(WATCHLIST_KEY);
  localStorage.removeItem(CONTINUE_KEY);
  localStorage.removeItem(RECENT_KEY);
  continueCache = null;
}
