import { Movie } from "./tmdb";

const WATCHLIST_KEY = "uncflix_watchlist";
const RECENT_KEY = "uncflix_recent";
const CONTINUE_KEY = "uncflix_continue";

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

// ---------- Watchlist ----------
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

// ---------- Recently Viewed ----------
export function getRecentlyViewed(): Movie[] {
  return read<Movie>(RECENT_KEY);
}

export function addRecentlyViewed(movie: Movie) {
  const list = getRecentlyViewed().filter((m) => m.id !== movie.id);
  list.unshift(movie);
  write(RECENT_KEY, list.slice(0, 20));
}

// ---------- Continue Watching ----------
export function getContinueWatching(): ContinueItem[] {
  return read<ContinueItem>(CONTINUE_KEY);
}

export function updateContinueWatching(item: ContinueItem) {
  const list = getContinueWatching().filter((c) => c.id !== item.id);
  const next = { ...item, timestamp: Date.now() };
  list.unshift(next);
  write(CONTINUE_KEY, list.slice(0, 20));
}

export function removeContinueWatching(id: number) {
  write(CONTINUE_KEY, getContinueWatching().filter((c) => c.id !== id));
}

export function clearLocalUserData() {
  localStorage.removeItem(WATCHLIST_KEY);
  localStorage.removeItem(CONTINUE_KEY);
  localStorage.removeItem(RECENT_KEY);
}
