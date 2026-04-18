import { Movie } from "./tmdb";
import { supabase } from "@/integrations/supabase/client";

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

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
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

  // Background sync to Cloud
  getUserId().then((uid) => {
    if (!uid) return;
    const mediaType = (movie.media_type as "movie" | "tv") || "movie";
    if (added) {
      supabase
        .from("user_watchlist")
        .upsert(
          { user_id: uid, tmdb_id: movie.id, media_type: mediaType, data: movie as any },
          { onConflict: "user_id,tmdb_id,media_type" }
        )
        .then(() => {});
    } else {
      supabase
        .from("user_watchlist")
        .delete()
        .eq("user_id", uid)
        .eq("tmdb_id", movie.id)
        .eq("media_type", mediaType)
        .then(() => {});
    }
  });

  return added;
}

export function removeFromWatchlist(id: number) {
  const remaining = getWatchlist().filter((m) => m.id !== id);
  write(WATCHLIST_KEY, remaining);
  getUserId().then((uid) => {
    if (!uid) return;
    supabase.from("user_watchlist").delete().eq("user_id", uid).eq("tmdb_id", id).then(() => {});
  });
}

// ---------- Recently Viewed (local only) ----------
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

  getUserId().then((uid) => {
    if (!uid) return;
    supabase
      .from("user_continue_watching")
      .upsert(
        {
          user_id: uid,
          tmdb_id: item.id,
          media_type: item.type,
          title: item.title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          progress: Math.round(item.progress),
          season: item.season ?? null,
          episode: item.episode ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,tmdb_id,media_type" }
      )
      .then(() => {});
  });
}

export function removeContinueWatching(id: number) {
  write(CONTINUE_KEY, getContinueWatching().filter((c) => c.id !== id));
  getUserId().then((uid) => {
    if (!uid) return;
    supabase
      .from("user_continue_watching")
      .delete()
      .eq("user_id", uid)
      .eq("tmdb_id", id)
      .then(() => {});
  });
}

// ---------- Cross-device sync ----------
// Pull cloud state into localStorage (called after sign-in)
export async function syncFromCloud() {
  const uid = await getUserId();
  if (!uid) return;

  const [{ data: wl }, { data: cw }] = await Promise.all([
    supabase.from("user_watchlist").select("data").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("user_continue_watching").select("*").eq("user_id", uid).order("updated_at", { ascending: false }),
  ]);

  if (wl) {
    const movies = wl.map((r: any) => r.data as Movie);
    write(WATCHLIST_KEY, movies);
  }

  if (cw) {
    const items: ContinueItem[] = cw.map((r: any) => ({
      id: r.tmdb_id,
      type: r.media_type,
      title: r.title,
      poster_path: r.poster_path,
      backdrop_path: r.backdrop_path,
      progress: r.progress,
      season: r.season ?? undefined,
      episode: r.episode ?? undefined,
      timestamp: new Date(r.updated_at).getTime(),
    }));
    write(CONTINUE_KEY, items);
  }
}

// Push current localStorage state up (called once after sign-in to merge local changes made while logged out)
export async function pushLocalToCloud() {
  const uid = await getUserId();
  if (!uid) return;

  const wl = getWatchlist();
  const cw = getContinueWatching();

  if (wl.length) {
    await supabase.from("user_watchlist").upsert(
      wl.map((m) => ({
        user_id: uid,
        tmdb_id: m.id,
        media_type: (m.media_type as "movie" | "tv") || "movie",
        data: m as any,
      })),
      { onConflict: "user_id,tmdb_id,media_type" }
    );
  }

  if (cw.length) {
    await supabase.from("user_continue_watching").upsert(
      cw.map((c) => ({
        user_id: uid,
        tmdb_id: c.id,
        media_type: c.type,
        title: c.title,
        poster_path: c.poster_path,
        backdrop_path: c.backdrop_path,
        progress: Math.round(c.progress),
        season: c.season ?? null,
        episode: c.episode ?? null,
        updated_at: new Date(c.timestamp).toISOString(),
      })),
      { onConflict: "user_id,tmdb_id,media_type" }
    );
  }
}

export function clearLocalUserData() {
  localStorage.removeItem(WATCHLIST_KEY);
  localStorage.removeItem(CONTINUE_KEY);
}
