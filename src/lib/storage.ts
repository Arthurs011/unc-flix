import { Movie } from "./tmdb";

const WATCHLIST_KEY = "apl_mov_watchlist";
const RECENT_KEY = "apl_mov_recent";
const CONTINUE_KEY = "apl_mov_continue";

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
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Watchlist
export function getWatchlist(): Movie[] {
  return read<Movie>(WATCHLIST_KEY);
}

export function isInWatchlist(id: number): boolean {
  return getWatchlist().some((m) => m.id === id);
}

export function toggleWatchlist(movie: Movie): boolean {
  const list = getWatchlist();
  const idx = list.findIndex((m) => m.id === movie.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(WATCHLIST_KEY, list);
    return false;
  }
  list.unshift(movie);
  write(WATCHLIST_KEY, list);
  return true;
}

export function removeFromWatchlist(id: number) {
  write(WATCHLIST_KEY, getWatchlist().filter((m) => m.id !== id));
}

// Recently Viewed
export function getRecentlyViewed(): Movie[] {
  return read<Movie>(RECENT_KEY);
}

export function addRecentlyViewed(movie: Movie) {
  const list = getRecentlyViewed().filter((m) => m.id !== movie.id);
  list.unshift(movie);
  write(RECENT_KEY, list.slice(0, 20));
}

// Continue Watching
export function getContinueWatching(): ContinueItem[] {
  return read<ContinueItem>(CONTINUE_KEY);
}

export function updateContinueWatching(item: ContinueItem) {
  const list = getContinueWatching().filter((c) => c.id !== item.id);
  list.unshift({ ...item, timestamp: Date.now() });
  write(CONTINUE_KEY, list.slice(0, 20));
}

export function removeContinueWatching(id: number) {
  write(CONTINUE_KEY, getContinueWatching().filter((c) => c.id !== id));
}
