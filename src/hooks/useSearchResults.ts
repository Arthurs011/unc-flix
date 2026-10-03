import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { tmdb } from "@/lib/tmdb";
import {
  SEARCH_DEBOUNCE_MS,
  isSearchable,
  toTitles,
} from "@/lib/search";
import { useDebouncedValue } from "./useDebouncedValue";

interface Options {
  page?: number;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Search results, cached and cancellable.
 *
 * Three problems this replaces:
 *
 * 1. Stale responses used to win. Two searches in flight could resolve out of
 *    order and the slower, older one would overwrite the newer results. Passing
 *    react-query's `signal` to fetch means a superseded request is aborted, so
 *    there is nothing left to land late.
 *
 * 2. Every visit cost a fresh round trip. Results are keyed by query and page,
 *    so re-opening a search or paging back is served from cache.
 *
 * 3. Typing blanked the list. `keepPreviousData` holds the last results while
 *    the next query loads, so the grid does not flash empty between keystrokes.
 *
 * Suggestions and the results page share this hook, so a query typed in the nav
 * that is then submitted to the page reuses the same cache entry rather than
 * costing a second request for the same term.
 */
export function useSearchResults(query: string, options: Options = {}) {
  const { page = 1, debounceMs = SEARCH_DEBOUNCE_MS, enabled = true } = options;

  const debouncedQuery = useDebouncedValue(query.trim(), debounceMs);
  const active = enabled && isSearchable(debouncedQuery);

  const queryResult = useQuery({
    queryKey: ["search", "multi", debouncedQuery, page],
    queryFn: ({ signal }) => tmdb.search(debouncedQuery, page, signal),
    enabled: active,
    // Hold the previous page while the next loads rather than blanking.
    placeholderData: keepPreviousData,
    // Search terms are rarely revisited within a session; a short window stops
    // back-and-forth paging from refetching.
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Narrowed outside `select` on purpose: `select` would replace the response
  // with the filtered array and take total_pages / total_results with it.
  const results = useMemo(() => toTitles(queryResult.data?.results), [queryResult.data]);

  return {
    /** Narrowed to movies and shows, de-duplicated by type and id. */
    results,
    /** True only for the first load, so the caller can show a skeleton. */
    isLoading: queryResult.isLoading,
    /** True while any fetch is in flight, including background refreshes. */
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    /** True once a request has actually gone out. */
    hasSearched: active,
    /** The query the results belong to, which lags the input while debouncing. */
    debouncedQuery,
    totalPages: queryResult.data?.total_pages ?? 0,
    totalResults: queryResult.data?.total_results ?? 0,
  };
}