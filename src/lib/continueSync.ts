import { supabase } from "./supabase";
import type { ContinueItem } from "./storage";

const TABLE = "continue_watching";

/** Shape of a row in public.continue_watching. */
export interface ContinueRow {
  id: number;
  user_id: string;
  media_type: "movie" | "tv";
  media_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: number;
  season: number | null;
  episode: number | null;
  updated_at: string;
}

const SELECT_COLUMNS =
  "id,user_id,media_type,media_id,title,poster_path,backdrop_path,progress,season,episode,updated_at";

export function rowToItem(row: ContinueRow): ContinueItem {
  return {
    id: row.media_id,
    type: row.media_type,
    title: row.title,
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    progress: row.progress,
    season: row.season ?? undefined,
    episode: row.episode ?? undefined,
    timestamp: Date.parse(row.updated_at) || Date.now(),
  };
}

export function itemToRow(userId: string, item: ContinueItem) {
  return {
    user_id: userId,
    media_type: item.type,
    media_id: item.id,
    title: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    progress: item.progress,
    season: item.season ?? null,
    episode: item.episode ?? null,
    updated_at: new Date(item.timestamp || Date.now()).toISOString(),
  };
}

/** Newest first. RLS keeps this scoped to the caller. */
export async function fetchRemoteContinue(): Promise<ContinueItem[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data as ContinueRow[]).map(rowToItem);
}

async function upsertRows(userId: string, items: ContinueItem[]) {
  if (!items.length) return;
  const { error } = await supabase.from(TABLE).upsert(items.map((i) => itemToRow(userId, i)), {
    onConflict: "user_id,media_type,media_id",
  });
  if (error) throw error;
}

export function upsertRemoteContinue(userId: string, item: ContinueItem) {
  return upsertRows(userId, [item]);
}

export function upsertRemoteContinueBatch(userId: string, items: ContinueItem[]) {
  return upsertRows(userId, items);
}

export async function deleteRemoteContinue(userId: string, type: "movie" | "tv", mediaId: number) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("media_type", type)
    .eq("media_id", mediaId);
  if (error) throw error;
}
