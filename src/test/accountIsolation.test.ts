import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Movie } from "@/lib/tmdb";

/**
 * Account isolation.
 *
 * The local library is shared by every account that signs in on a browser,
 * because it is local-first. That is fine for one person and a data leak for
 * two: sign out of A, sign in as B, and the additive merge used to hand A's
 * titles to B.
 *
 * The library now records which account owns it. A library that belongs to
 * somebody else is replaced by the account's own copy instead of being
 * merged into it; a library with no owner was built while signed out and is
 * still merged, because that is the point of local-first.
 */

const h = vi.hoisted(() => ({
  currentUser: null as string | null,
  watchlist: {} as Record<string, Movie[]>,
  uploads: [] as { userId: string; count: number }[],
}));

vi.mock("@/lib/watchlistSync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/watchlistSync")>();
  return {
    ...actual,
    fetchRemoteWatchlist: async () => (h.currentUser ? (h.watchlist[h.currentUser] ?? []) : []),
    upsertRemoteWatchlistBatch: async (userId: string, items: Movie[]) => {
      h.uploads.push({ userId, count: items.length });
      h.watchlist[userId] = [...(h.watchlist[userId] ?? []), ...items];
    },
    upsertRemoteWatchlist: async (userId: string, item: Movie) => {
      h.watchlist[userId] = [...(h.watchlist[userId] ?? []), item];
    },
    deleteRemoteWatchlist: async () => {},
  };
});

import {
  clearLocalLibrary,
  getLibraryOwner,
  getWatchlist,
  resetSyncedCaches,
  setRemoteUser,
  syncWatchlistForUser,
  toggleWatchlist,
} from "@/lib/storage";

const movie = (id: number, title = `Title ${id}`): Movie => ({
  id,
  title,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  vote_count: 10,
  media_type: "movie",
});

beforeEach(() => {
  localStorage.clear();
  resetSyncedCaches();
  setRemoteUser(null);
  h.currentUser = null;
  h.watchlist = {};
  h.uploads = [];
});

describe("account isolation", () => {
  it("merges a library that was built while signed out", async () => {
    toggleWatchlist(movie(7));
    h.currentUser = "user-1";

    await syncWatchlistForUser("user-1");

    expect(getWatchlist()).toHaveLength(1);
    expect(h.uploads).toContainEqual({ userId: "user-1", count: 1 });
  });

  it("does not hand one account's library to another account", async () => {
    toggleWatchlist(movie(7));
    h.currentUser = "user-1";
    await syncWatchlistForUser("user-1");
    expect(getWatchlist()).toHaveLength(1);

    // A different person signs in on the same browser.
    h.currentUser = "user-2";
    await syncWatchlistForUser("user-2");

    expect(getWatchlist()).toHaveLength(0);
    expect(h.uploads.filter((u) => u.userId === "user-2")).toHaveLength(0);
  });

  it("gives the account its own copy back after the other one signed out", async () => {
    h.currentUser = "user-1";
    h.watchlist["user-1"] = [movie(7)];
    await syncWatchlistForUser("user-1");
    expect(getWatchlist()).toHaveLength(1);

    // Sign out: the local copy goes, the account's copy stays on the server.
    clearLocalLibrary();
    expect(getWatchlist()).toHaveLength(0);

    h.currentUser = "user-1";
    await syncWatchlistForUser("user-1");
    expect(getWatchlist()).toHaveLength(1);
  });

  it("records which account owns the local library", async () => {
    expect(getLibraryOwner()).toBeNull();
    h.currentUser = "user-1";
    await syncWatchlistForUser("user-1");
    expect(getLibraryOwner()).toBe("user-1");
  });

  it("empties the local library when the session ends", () => {
    toggleWatchlist(movie(7));
    expect(getWatchlist()).toHaveLength(1);

    clearLocalLibrary();

    expect(getWatchlist()).toHaveLength(0);
    expect(localStorage.getItem("uncflix_watchlist")).toBeNull();
  });
});
