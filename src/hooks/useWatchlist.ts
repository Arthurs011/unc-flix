import { useCallback, useEffect, useState } from "react";
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
 * Watchlist state for one title, kept in step with the store so a merge that
 * lands while the page is open still updates the button.
 */
export function useWatchlistItem(movie: Movie | null | undefined) {
  const movieId = movie?.id;
  const movieType = movie ? titleType(movie) : null;

  const [saved, setSaved] = useState(() =>
    movieId && movieType ? isInWatchlist(movieId, movieType) : false,
  );

  useEffect(() => {
    if (!movieId || !movieType) {
      setSaved(false);
      return;
    }
    // Same reason as useWatchlist: read on first render so a client-side
    // navigation shows the correct saved state immediately.
    setSaved(isInWatchlist(movieId, movieType));
    return subscribeWatchlist(() => setSaved(isInWatchlist(movieId, movieType)));
  }, [movieId, movieType]);

  const toggle = useCallback(() => {
    if (!movie) return false;
    return toggleWatchlist(movie);
  }, [movie]);

  return { saved, toggle };
}

/** The whole library, kept in step with the store. */
export function useWatchlist(): Movie[] {
  // Read during the first render, not in an effect. On a client-side route
  // change the store already holds the saved titles, but an effect-based read
  // still renders one frame of the empty state and, because nothing else
  // notifies, the library sat on "empty" until a reload rebuilt it.
  const [list, setList] = useState<Movie[]>(getWatchlist);

  useEffect(() => {
    // Catch up on anything that landed between render and subscribe.
    setList(getWatchlist());
    return subscribeWatchlist(() => setList(getWatchlist()));
  }, []);

  return list;
}

/**
 * False when this browser cannot persist the watchlist, so the library can say
 * so instead of silently rendering empty after a reload.
 */
export function useWatchlistPersistent(): boolean {
  const [persistent, setPersistent] = useState(isWatchlistPersistent());

  useEffect(() => {
    const read = () => setPersistent(isWatchlistPersistent());
    read();
    return subscribeWatchlistPersistence(read);
  }, []);

  return persistent;
}