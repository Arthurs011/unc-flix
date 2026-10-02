import { useCallback, useSyncExternalStore } from "react";
import {
  getWatchlist,
  isInWatchlist,
  isWatchlistPersistent,
  subscribeWatchlist,
  subscribeWatchlistPersistence,
  toggleWatchlist,
} from "@/lib/storage";
import { Movie } from "@/lib/tmdb";
import { titleType } from "@/lib/watchlistSync";

/**
 * The library, read through useSyncExternalStore.
 *
 * These hooks used to seed themselves with useState([]) and fill in from an
 * effect. That guaranteed a first render of the empty state, so on a
 * client-side route change the library swapped branches after mount, and a
 * mount like that never resolved the animation label its grid was waiting on.
 * The result was a correct item count above an invisible grid until a reload.
 *
 * useSyncExternalStore reads the snapshot during render, so the value on
 * screen is always the value in the store. There is no window in which the
 * component can render a stale empty library.
 */
export function useWatchlist(): Movie[] {
  return useSyncExternalStore(subscribeWatchlist, getWatchlist, getWatchlist);
}

/**
 * Whether one title is saved, kept in step with the store so a merge that lands
 * while the page is open still updates the button. Same rendering guarantee as
 * useWatchlist: the initial render already reflects the store.
 */
export function useWatchlistItem(movie: Movie | null | undefined) {
  const movieId = movie?.id;
  const movieType = movie ? titleType(movie) : null;

  // Memoised so the snapshot function keeps its identity across renders.
  // Without this, every render would look like a store change.
  const readSaved = useCallback(
    () => (movieId && movieType ? isInWatchlist(movieId, movieType) : false),
    [movieId, movieType],
  );

  const saved = useSyncExternalStore(subscribeWatchlist, readSaved, () => false);

  const toggle = useCallback(() => {
    if (!movie) return false;
    return toggleWatchlist(movie);
  }, [movie]);

  return { saved, toggle };
}

/**
 * False when this browser cannot persist the watchlist, so the library can say
 * so instead of silently rendering empty after a reload.
 */
export function useWatchlistPersistent(): boolean {
  return useSyncExternalStore(
    subscribeWatchlistPersistence,
    isWatchlistPersistent,
    // Assume it works until proven otherwise, so the warning never flashes
    // during the first paint.
    () => true,
  );
}