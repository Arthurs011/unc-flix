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
  const [saved, setSaved] = useState(false);

  const movieId = movie?.id;
  const movieType = movie ? titleType(movie) : null;

  useEffect(() => {
    if (!movieId || !movieType) {
      setSaved(false);
      return;
    }
    const read = () => setSaved(isInWatchlist(movieId, movieType));
    read();
    return subscribeWatchlist(read);
  }, [movieId, movieType]);

  const toggle = useCallback(() => {
    if (!movie) return false;
    return toggleWatchlist(movie);
  }, [movie]);

  return { saved, toggle };
}

/** The whole library, kept in step with the store. */
export function useWatchlist(): Movie[] {
  const [list, setList] = useState<Movie[]>([]);

  useEffect(() => {
    const read = () => setList(getWatchlist());
    read();
    return subscribeWatchlist(read);
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