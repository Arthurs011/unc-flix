import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWatchlist,
  isWatchlistPersistent,
  resetSyncedCaches,
  subscribeWatchlist,
  subscribeWatchlistPersistence,
  toggleWatchlist,
} from "@/lib/storage";
import { Movie } from "@/lib/tmdb";
import { titleType } from "@/lib/watchlistSync";

const movie = (id: number, type: "movie" | "tv" = "movie"): Movie => ({
  id,
  title: `Title ${id}`,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  vote_count: 10,
  media_type: type,
});

describe("watchlist store reference identity", () => {
  beforeEach(() => {
    localStorage.clear();
    resetSyncedCaches();
  });

  it("returns a new array reference on save so React re-renders", () => {
    // The bug: toggleWatchlist spliced/unshifted the cached array in place.
    // React's setState bails out when the new state is the same reference, so
    // the library page kept showing the old list while localStorage was correct.
    toggleWatchlist(movie(1));
    const first = getWatchlist();

    toggleWatchlist(movie(2));
    const second = getWatchlist();

    expect(first).not.toBe(second);
    expect(second).toHaveLength(2);
  });

  it("returns a new array reference on remove", () => {
    toggleWatchlist(movie(1));
    toggleWatchlist(movie(2));
    const before = getWatchlist();

    toggleWatchlist(movie(1));
    const after = getWatchlist();

    expect(before).not.toBe(after);
    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(2);
  });

  it("notifies subscribers so an open library page updates", () => {
    let notified = 0;
    const off = subscribeWatchlist(() => notified++);

    toggleWatchlist(movie(1));
    toggleWatchlist(movie(2));
    toggleWatchlist(movie(1));

    off();
    expect(notified).toBe(3);
  });

  it("keeps same-id movie and tv entries distinct", () => {
    toggleWatchlist(movie(550, "movie"));
    toggleWatchlist(movie(550, "tv"));
    expect(getWatchlist()).toHaveLength(2);

    // Removing the movie must leave the series alone.
    toggleWatchlist(movie(550, "movie"));
    const left = getWatchlist();
    expect(left).toHaveLength(1);
    expect(titleType(left[0])).toBe("tv");
  });

  it("reports when storage refuses to persist, instead of failing silently", () => {
    // iOS Safari private browsing and a full quota make setItem throw. The save
    // appears to succeed in memory, then the next page load shows an empty
    // library. The UI has to learn about it.
    expect(isWatchlistPersistent()).toBe(true);

    // jsdom's localStorage carries its own setItem, so stub the instance rather
    // than Storage.prototype.
    const real = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw Object.assign(new Error("quota"), { name: "QuotaExceededError" });
    });
    try {
      toggleWatchlist(movie(1));
      expect(isWatchlistPersistent()).toBe(false);
    } finally {
      vi.mocked(localStorage.setItem).mockRestore();
    }

    toggleWatchlist(movie(1));
    expect(isWatchlistPersistent()).toBe(true);
  });

  it("notifies persistence subscribers when a write fails", () => {
    let calls = 0;
    const off = subscribeWatchlistPersistence(() => calls++);

    const real = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw Object.assign(new Error("quota"), { name: "QuotaExceededError" });
    });
    try {
      toggleWatchlist(movie(1));
    } finally {
      vi.mocked(localStorage.setItem).mockRestore();
    }
    off();
    void real;

    expect(calls).toBe(1);
  });

  it("persists what it reports, so a reload shows the same titles", () => {
    toggleWatchlist(movie(7));
    resetSyncedCaches();

    const afterReload = getWatchlist();
    expect(afterReload).toHaveLength(1);
    expect(afterReload[0].id).toBe(7);
  });
});