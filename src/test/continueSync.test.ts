import { describe, it, expect, beforeEach, vi } from "vitest";

type RemoteRow = {
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
};

const remoteRow = (over: Partial<RemoteRow> = {}): RemoteRow => ({
  id: 1,
  user_id: "user-1",
  media_type: "tv",
  media_id: 108978,
  title: "Reacher",
  poster_path: null,
  backdrop_path: null,
  progress: 5,
  season: 1,
  episode: 1,
  updated_at: new Date(1_600_000_000_000).toISOString(),
  ...over,
});

const h = vi.hoisted(() => ({
  upsert: vi.fn().mockResolvedValue({ error: null }),
  del: vi.fn().mockResolvedValue({ error: null }),
  upsertOne: vi.fn().mockResolvedValue(undefined),
  remote: [] as { id: number; user_id: string; media_type: "movie" | "tv"; media_id: number; title: string; poster_path: string | null; backdrop_path: string | null; progress: number; season: number | null; episode: number | null; updated_at: string }[],
}));

vi.mock("@/lib/continueSync", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/continueSync")>();
  return {
    ...actual,
    // Stub the network only - let the real row mapping run.
    fetchRemoteContinue: async () => h.remote.map(actual.rowToItem),
    upsertRemoteContinue: h.upsertOne,
    upsertRemoteContinueBatch: h.upsert,
    deleteRemoteContinue: h.del,
  };
});

import {
  getContinueWatching,
  updateContinueWatching,
  removeContinueWatching,
  subscribeContinueWatching,
  syncContinueWatchingForUser,
  setRemoteUser,
  clearLocalUserData,
} from "@/lib/storage";
import { itemToRow, rowToItem } from "@/lib/continueSync";

const item = (over: Partial<Parameters<typeof updateContinueWatching>[0]> = {}) => ({
  id: 108978,
  type: "tv" as const,
  title: "Reacher",
  poster_path: "/p.jpg",
  backdrop_path: "/b.jpg",
  progress: 40,
  season: 2,
  episode: 5,
  timestamp: 1_700_000_000_000,
  ...over,
});

beforeEach(() => {
  clearLocalUserData();
  h.remote = [];
  h.upsert.mockClear();
  h.del.mockClear();
  h.upsertOne.mockClear();
  setRemoteUser(null);
});

describe("continue-watching store", () => {
  it("keeps local storage working with no account", () => {
    updateContinueWatching(item());
    expect(getContinueWatching()).toHaveLength(1);
    expect(getContinueWatching()[0].progress).toBe(40);
  });

  it("does not let a movie and a show with the same TMDB id clobber each other", () => {
    updateContinueWatching(item({ id: 550, type: "movie", season: undefined, episode: undefined }));
    updateContinueWatching(item({ id: 550, type: "tv" }));
    const list = getContinueWatching();
    expect(list).toHaveLength(2);
    expect(list.map((i) => i.type).sort()).toEqual(["movie", "tv"]);
  });

  it("replaces rather than duplicates the same media", () => {
    updateContinueWatching(item());
    updateContinueWatching(item({ progress: 90 }));
    const list = getContinueWatching();
    expect(list).toHaveLength(1);
    expect(list[0].progress).toBe(90);
  });

  it("notifies subscribers on change", () => {
    const seen: number[] = [];
    const off = subscribeContinueWatching(() => seen.push(getContinueWatching().length));
    updateContinueWatching(item());
    updateContinueWatching(item({ id: 2 }));
    off();
    updateContinueWatching(item({ id: 3 }));
    expect(seen).toEqual([1, 2]);
  });

  it("preserves an explicit timestamp passed by the caller", () => {
    updateContinueWatching(item({ timestamp: 1_600_000_000_000 }));
    expect(getContinueWatching()[0].timestamp).toBe(1_600_000_000_000);
  });
});

describe("account sync", () => {
  it("uploads this device's history on first sign-in", async () => {
    updateContinueWatching(item());
    await syncContinueWatchingForUser("user-1");

    expect(h.upsert).toHaveBeenCalledTimes(1);
    const rows = h.upsert.mock.calls[0][1];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 108978, type: "tv", progress: 40, season: 2, episode: 5 });
  });

  it("sends nothing when the account already has everything newer", async () => {
    h.remote = [
      remoteRow({ progress: 95, season: 4, episode: 2, updated_at: new Date(1_800_000_000_000).toISOString() }),
    ];
    updateContinueWatching(item({ timestamp: 1_700_000_000_000 }));

    await syncContinueWatchingForUser("user-1");

    expect(h.upsert).not.toHaveBeenCalled();
    expect(getContinueWatching()[0].progress).toBe(95);
  });

  it("scopes uploads to the account being synced", async () => {
    updateContinueWatching(item());
    await syncContinueWatchingForUser("user-1");
    h.upsert.mockClear();

    updateContinueWatching(item({ id: 999, title: "New" }));
    await syncContinueWatchingForUser("user-2");

    expect(h.upsert).toHaveBeenCalledTimes(1);
    expect(h.upsert.mock.calls[0][0]).toBe("user-2");
  });

  it("keeps the account's copy when it is newer than the local one", async () => {
    h.remote = [
      remoteRow({ progress: 95, season: 4, episode: 2, updated_at: new Date(1_800_000_000_000).toISOString() }),
    ];
    updateContinueWatching(item({ progress: 10, timestamp: 1_700_000_000_000 }));

    await syncContinueWatchingForUser("user-1");

    expect(getContinueWatching()).toHaveLength(1);
    expect(getContinueWatching()[0].progress).toBe(95);
    expect(getContinueWatching()[0].season).toBe(4);
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it("pushes the local copy when this device is newer", async () => {
    h.remote = [
      remoteRow({ progress: 5, season: 1, episode: 1, updated_at: new Date(1_600_000_000_000).toISOString() }),
    ];
    updateContinueWatching(item({ progress: 80, timestamp: 1_800_000_000_000 }));

    await syncContinueWatchingForUser("user-1");

    expect(h.upsert).toHaveBeenCalledTimes(1);
    expect(h.upsert.mock.calls[0][1][0].progress).toBe(80);
  });

  it("merges both sides and sorts newest first", async () => {
    h.remote = [
      remoteRow({ media_type: "movie", media_id: 550, title: "Fight Club", progress: 30, season: null, episode: null, updated_at: new Date(1_800_000_000_000).toISOString() }),
    ];
    updateContinueWatching(item({ timestamp: 1_700_000_000_000 }));

    await syncContinueWatchingForUser("user-1");

    const list = getContinueWatching();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(550);
    expect(list[1].id).toBe(108978);
  });

  it("stops writing to the account after sign-out", async () => {
    updateContinueWatching(item());
    await syncContinueWatchingForUser("user-1");
    setRemoteUser("user-1");
    setRemoteUser(null);

    const { upsertRemoteContinue } = await import("@/lib/continueSync");
    updateContinueWatching(item({ id: 777 }));
    expect(upsertRemoteContinue).not.toHaveBeenCalled();
  });

  it("deletes the matching row on the account", async () => {
    updateContinueWatching(item());
    await syncContinueWatchingForUser("user-1");
    setRemoteUser("user-1");
    h.del.mockClear();

    removeContinueWatching(108978, "tv");

    expect(h.del).toHaveBeenCalledWith("user-1", "tv", 108978);
    expect(getContinueWatching()).toHaveLength(0);
  });
});

describe("database row mapping", () => {
  it("maps an app item onto the table's columns", () => {
    expect(itemToRow("user-1", item())).toEqual({
      user_id: "user-1",
      media_type: "tv",
      media_id: 108978,
      title: "Reacher",
      poster_path: "/p.jpg",
      backdrop_path: "/b.jpg",
      progress: 40,
      season: 2,
      episode: 5,
      updated_at: new Date(1_700_000_000_000).toISOString(),
    });
  });

  it("round-trips without losing anything", () => {
    expect(rowToItem({ id: 1, ...itemToRow("user-1", item()) })).toEqual(item());
  });

  it("stores a movie's missing season and episode as null", () => {
    const row = itemToRow("user-1", item({ type: "movie", season: undefined, episode: undefined }));
    expect(row.season).toBeNull();
    expect(row.episode).toBeNull();
  });

  it("reads null season and episode back as undefined", () => {
    const back = rowToItem(remoteRow({ media_type: "movie", media_id: 550, title: "Fight Club", season: null, episode: null }));
    expect(back.season).toBeUndefined();
    expect(back.episode).toBeUndefined();
  });
});
