import type { Movie } from "./tmdb";

/**
 * Everything the search surfaces need to agree on.
 *
 * The dropdown and the results page used to keep separate copies of this logic
 * and drifted: the page filtered on poster_path and ignored media_type, the
 * dropdown filtered on media_type and ignored poster_path, one sent the raw
 * query and the other sent it trimmed. The same search term therefore produced
 * different results depending on which surface asked. There is one definition
 * of a searchable title here now.
 */

/** Below this a query is not worth a request; TMDB matches noise. */
export const MIN_QUERY_LENGTH = 2;

/** How long typing settles before a request goes out. */
export const SEARCH_DEBOUNCE_MS = 250;

/** Suggestions shown in the nav dropdown. */
export const SUGGESTION_LIMIT = 8;

/** Results on one page of the results grid. */
export const PAGE_SIZE = 20;

export type TitleType = "movie" | "tv";

/** The media type TMDB labelled a result with, narrowed to titles. */
export function titleType(item: { media_type?: string }): TitleType {
  return item.media_type === "tv" ? "tv" : "movie";
}

/** True for a movie or show, false for the people /search/multi also returns. */
export function isTitle(item: Movie): boolean {
  return item.media_type === "movie" || item.media_type === "tv";
}

/** A displayable title has somewhere to go and something to call itself. */
export function isSearchableTitle(item: Movie): boolean {
  return isTitle(item) && Boolean(title(item));
}

/**
 * TMDB ids are unique per media type, not globally: movie 550 and tv 550 are
 * different things. The old `key={m.id}` collided on those, which dropped or
 * duplicated cells in the grid. Every list key has to include the type.
 */
export function searchResultKey(item: { id: number; media_type?: string }): string {
  return `${titleType(item)}:${item.id}`;
}

/** Where a result links to. */
export function titlePath(item: { id: number; media_type?: string }): string {
  return titleType(item) === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
}

/** Movie or show name, never both. */
export function title(item: Movie): string {
  return (titleType(item) === "tv" ? item.name : item.title) ?? "";
}

/**
 * Narrow and de-duplicate a /search/multi page.
 *
 * De-duplication matters because the endpoint can return the same title more
 * than once, and because a naive id filter would let a movie and a show that
 * share an id through as if they were one row.
 */
export function toTitles(results: Movie[] | undefined | null): Movie[] {
  if (!Array.isArray(results)) return [];
  const seen = new Set<string>();
  const out: Movie[] = [];
  for (const item of results) {
    if (!isSearchableTitle(item)) continue;
    const key = searchResultKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Narrow to one media type. */
export function filterByType(titles: Movie[], type: TitleType | "all"): Movie[] {
  if (type === "all") return titles;
  return titles.filter((item) => titleType(item) === type);
}

/** The URL for a search, shared so the nav and the page cannot disagree. */
export function searchUrl(query: string, page = 1): string {
  const params = new URLSearchParams({ q: query.trim() });
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

/** Read a search URL back into its parts. */
export function readSearchParams(
  params: URLSearchParams,
): { query: string; page: number } {
  const page = Number(params.get("page") ?? "1");
  return {
    query: params.get("q")?.trim() ?? "",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

/** Whether a query is long enough to be worth sending. */
export function isSearchable(query: string): boolean {
  return query.trim().length >= MIN_QUERY_LENGTH;
}