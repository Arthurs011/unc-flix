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
  currentTime: number; // seconds into video
  duration: number; // total seconds
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

function getMediaType(movie: Movie): "movie" | "tv" {
  if (movie.media_type === "tv" || (!movie.title && movie.name)) return "tv";
  return "movie";
}

export function isInWatchlist(id: number, type?: "movie" | "tv"): boolean {
  return getWatchlist().some((movie) => movie.id === id && (!type || getMediaType(movie) === type));
}

export function toggleWatchlist(movie: Movie): boolean {
  const list = getWatchlist();
  const type = getMediaType(movie);
  const normalized = { ...movie, media_type: type };
  const idx = list.findIndex((item) => item.id === movie.id && getMediaType(item) === type);
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(normalized);
    added = true;
  }
  write(WATCHLIST_KEY, list);
  return added;
}

export function removeFromWatchlist(id: number, type?: "movie" | "tv") {
  const remaining = getWatchlist().filter((movie) => !(movie.id === id && (!type || getMediaType(movie) === type)));
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
  // If progress is >= 95%, title is finished: remove from queue
  if (item.progress >= 95) {
    removeContinueWatching(item.id, item.type, item.season, item.episode);
    return;
  }

  const list = getContinueWatching().filter(
    (c) => !(c.id === item.id && c.type === item.type && c.season === item.season && c.episode === item.episode)
  );
  const next = { ...item, timestamp: Date.now() };
  list.unshift(next);
  write(CONTINUE_KEY, list.slice(0, 20));
}

export function removeContinueWatching(id: number, type?: "movie" | "tv", season?: number, episode?: number) {
  write(
    CONTINUE_KEY,
    getContinueWatching().filter((c) => {
      if (c.id !== id) return true;
      if (type && c.type !== type) return true;
      if (season !== undefined && c.season !== season) return true;
      if (episode !== undefined && c.episode !== episode) return true;
      return false;
    })
  );
}

// ---------- Likes / Votes ----------
const VOTES_KEY = "uncflix_votes";

export type VoteType = "like" | "dislike";

export interface VoteRecord {
  id: number;
  type: "movie" | "tv";
  vote: VoteType;
}

export function getRatingVote(id: number, type: "movie" | "tv"): VoteType | null {
  const votes = read<VoteRecord>(VOTES_KEY);
  const found = votes.find((v) => v.id === id && v.type === type);
  return found ? found.vote : null;
}

export function setRatingVote(id: number, type: "movie" | "tv", vote: VoteType | null) {
  const votes = read<VoteRecord>(VOTES_KEY).filter((v) => !(v.id === id && v.type === type));
  if (vote) {
    votes.unshift({ id, type, vote });
  }
  write(VOTES_KEY, votes.slice(0, 200));
}

export function clearLocalUserData() {
  localStorage.removeItem(WATCHLIST_KEY);
  localStorage.removeItem(CONTINUE_KEY);
  localStorage.removeItem(RECENT_KEY);
  localStorage.removeItem(VOTES_KEY);
}
