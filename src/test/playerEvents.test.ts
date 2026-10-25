import { describe, it, expect } from "vitest";
import { parsePlayerMessage } from "@/lib/playerEvents";

describe("parsePlayerMessage", () => {
  it("reads a FilmU episode time update", () => {
    expect(
      parsePlayerMessage({
        type: "VIDLY_PLAYER_EVENT",
        data: {
          event: "timeupdate",
          currentTime: 120,
          duration: 2700,
          season: 2,
          episode: 4,
        },
      }),
    ).toEqual({
      event: "timeupdate",
      currentTime: 120,
      duration: 2700,
      season: 2,
      episode: 4,
    });
  });

  it("leaves season and episode undefined for a movie", () => {
    const parsed = parsePlayerMessage({
      type: "VIDLY_PLAYER_EVENT",
      data: { event: "timeupdate", currentTime: 30, duration: 7200, season: null, episode: null },
    });
    expect(parsed?.season).toBeUndefined();
    expect(parsed?.episode).toBeUndefined();
  });

  it("still understands the legacy flat timeupdate shape", () => {
    expect(parsePlayerMessage({ type: "timeupdate", currentTime: 10, duration: 100 })).toMatchObject({
      event: "timeupdate",
      currentTime: 10,
      duration: 100,
    });
  });

  it("ignores unrelated or malformed messages", () => {
    expect(parsePlayerMessage(null)).toBeNull();
    expect(parsePlayerMessage({ type: "SYNC_HISTORY", data: {} })).toBeNull();
    expect(
      parsePlayerMessage({ type: "VIDLY_PLAYER_EVENT", data: { currentTime: "x", duration: 100 } }),
    ).toBeNull();
  });
});
