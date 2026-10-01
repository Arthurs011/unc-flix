import { supabase } from "./supabase";
import type { Movie } from "./tmdb";

const TABLE = "watchlist";

export interface WatchlistRow {
  id: number;
  user_id: string;
  media_type: "movie" | "tv";
  media_id: number;
  title: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  created_at: string;
}

const SELECT_COLUMNS =
  "id,user_id,media_type,media_id,title,poster_path,backdrop_path,overview,created_at";

/** TMDB ids are only unique per media type, so this must key on both. */
export function sameTitle(a: Movie, mediaId: number, type: "movie" | "tv") {
  return a.id === mediaId && titleType(a) === type;
}

export function titleType(movie: Movie): "movie" | "tv" {
  if (movie.media_type === "movie" || movie.media_type === "tv") return movie.media_type;
  return movie.title ? "movie" : "tv";
}

export function titleOf(movie: Movie) {
  return movie.title || movie.name || "Untitled";
}

export function rowToMovie(row: WatchlistRow): Movie {
  return {
    id: row.media_id,
    title: row.media_type === "movie" ? row.title : undefined,
    name: row.media_type === "tv" ? row.title : undefined,
    overview: row.overview || "",
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    vote_average: 0,
    vote_count: 0,
    media_type: row.media_type,
  };
}

export function movieToRow(userId: string, movie: Movie) {
  return {
    user_id: userId,
    media_type: titleType(movie),
    media_id: movie.id,
    title: titleOf(movie),
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    overview: movie.overview ?? "",
  };
}

/** Newest first. RLS keeps this scoped to the caller. */
export async function fetchRemoteWatchlist(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as WatchlistRow[]).map(rowToMovie);
}

async function upsertRows(userId: string, items: Movie[]) {
  if (!items.length) return;
  const { error } = await supabase
    .from(TABLE)
    .upsert(items.map((m) => movieToRow(userId, m)), {
      onConflict: "user_id,media_type,media_id",
    });
  if (error) throw error;
}

export function upsertRemoteWatchlist(userId: string, movie: Movie) {
  return upsertRows(userId, [movie]);
}

export function upsertRemoteWatchlistBatch(userId: string, items: Movie[]) {
  return upsertRows(userId, items);
}

export async function deleteRemoteWatchlist(
  userId: string,
  type: "movie" | "tv",
  mediaId: number,
) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("media_type", type)
    .eq("media_id", mediaId);
  if (error) throw error;
}