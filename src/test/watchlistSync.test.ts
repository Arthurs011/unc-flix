import { beforeEach, describe, expect, it, vi } from "vitest";

// Supabase builders are thenable, so every terminal method resolves to a
// result object the sync code destructures.
// A tiny in-memory stand-in for the table so the mock behaves like the real
// thing: writes are readable by the next fetch. Returning a constant empty
// list would make every sync look like a fresh upload and hide real bugs.
const serverRows: Record<string, unknown>[] = [];
const key = (r: Record<string, unknown>) => `${r.user_id}:${r.media_type}:${r.media_id}`;

const upsert = vi.fn((rows: Record<string, unknown>[]) => {
  for (const row of rows) {
    const existing = serverRows.findIndex((r) => key(r) === key(row));
    const stored = { ...row, created_at: new Date().toISOString() };
    if (existing === -1) serverRows.push(stored);
    else serverRows[existing] = stored;
  }
  return Promise.resolve({ data: [], error: null });
});

const del = vi.fn((_q: unknown) => Promise.resolve({ data: [], error: null }));

const selectChain = {
  order: vi.fn(() => selectChain),
  then: (resolve: (v: unknown) => void) =>
    resolve({ data: serverRows.map((r) => ({ ...r })), error: null }),
};

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      select: () => selectChain,
      upsert,
      delete: () => ({
        eq: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
      }),
    }),
  },
}));

import {
  getWatchlist,
  isInWatchlist,
  removeFromWatchlist,
  resetSyncedCaches,
  setRemoteUser,
  subscribeWatchlist,
  syncWatchlistForUser,
  toggleWatchlist,
} from "@/lib/storage";
import {
  rowToMovie,
  movieToRow,
  sameTitle,
  titleType,
  type WatchlistRow,
} from "@/lib/watchlistSync";
import type { Movie } from "@/lib/tmdb";

const movie = (over: Partial<Movie> = {}): Movie => ({
  id: 1,
  title: "A Movie",
  overview: "",
  poster_path: "/p.jpg",
  backdrop_path: "/b.jpg",
  vote_average: 7,
  vote_count: 10,
  ...over,
});

const show = (over: Partial<Movie> = {}): Movie => ({
  id: 1,
  name: "A Show",
  overview: "",
  poster_path: "/s.jpg",
  backdrop_path: null,
  vote_average: 8,
  vote_count: 20,
  ...over,
});

describe("watchlist sync", () => {
  beforeEach(async () => {
    localStorage.clear();
    resetSyncedCaches();
    // Drop the module-level remote user so tests don't leak sign-in state.
    setRemoteUser(null);
    upsert.mockClear();
    del.mockClear();
    serverRows.length = 0;
  });

  it("merges a movie and a show that share a TMDB id", () => {
    // Both have id 1, so an id-only key would drop one of them.
    expect(toggleWatchlist(movie())).toBe(true);
    expect(toggleWatchlist(show())).toBe(true);

    expect(getWatchlist()).toHaveLength(2);
    expect(isInWatchlist(1, "movie")).toBe(true);
    expect(isInWatchlist(1, "tv")).toBe(true);
  });

  it("toggles only the matching media type", () => {
    toggleWatchlist(movie());
    toggleWatchlist(show());

    expect(toggleWatchlist(movie())).toBe(false);
    expect(getWatchlist().map(titleType)).toEqual(["tv"]);
  });

  it("notifies subscribers on toggle and removal", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeWatchlist(listener);

    toggleWatchlist(movie());
    expect(listener).toHaveBeenCalledTimes(1);

    removeFromWatchlist(1, "movie");
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    toggleWatchlist(movie());
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("removes only the requested title", () => {
    toggleWatchlist(movie());
    toggleWatchlist(show());

    removeFromWatchlist(1, "tv");
    expect(getWatchlist().map(titleType)).toEqual(["movie"]);
  });

  it("uploads the account copy without dropping device-only titles", async () => {
    toggleWatchlist(movie({ id: 7, title: "Device Only" }));

    await syncWatchlistForUser("user-1");

    expect(getWatchlist().map((m) => m.id)).toContain(7);
    expect(upsert).toHaveBeenCalledTimes(1);
    const rows = upsert.mock.calls[0][0];
    expect(rows[0]).toMatchObject({ user_id: "user-1", media_id: 7, media_type: "movie" });
  });

  it("is idempotent: syncing twice uploads nothing extra", async () => {
    toggleWatchlist(movie({ id: 7, title: "Device Only" }));

    await syncWatchlistForUser("user-1");
    const first = upsert.mock.calls.length;
    await syncWatchlistForUser("user-1");

    expect(upsert.mock.calls.length).toBe(first);
  });

  it("does not write remotely when signed out", () => {
    setRemoteUser(null);
    toggleWatchlist(movie());

    expect(upsert).not.toHaveBeenCalled();
    expect(getWatchlist()).toHaveLength(1);
  });

  it("writes remotely when signed in", () => {
    setRemoteUser("user-9");
    toggleWatchlist(movie());

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][0][0]).toMatchObject({ user_id: "user-9" });
  });

  it("round-trips a row back to the Movie shape", () => {
    const original = movie({ id: 42, title: "Round Trip" });
    const row: WatchlistRow = {
      id: 1,
      ...movieToRow("u1", original),
      created_at: new Date().toISOString(),
    };
    const back = rowToMovie(row);

    expect(back.id).toBe(42);
    expect(back.media_type).toBe("movie");
    expect(back.poster_path).toBe("/p.jpg");
    expect(sameTitle(back, 42, "movie")).toBe(true);
    expect(sameTitle(back, 42, "tv")).toBe(false);
  });

  it("derives media type from the title field when media_type is absent", () => {
    expect(titleType(movie())).toBe("movie");
    expect(titleType(show())).toBe("tv");
  });

  it("survives a localStorage write failure", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    try {
      expect(toggleWatchlist(movie())).toBe(true);
      // The in-memory copy still works even though persistence failed.
      expect(getWatchlist()).toHaveLength(1);
    } finally {
      spy.mockRestore();
    }
  });
});