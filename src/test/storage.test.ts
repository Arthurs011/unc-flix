import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLocalUserData,
  getRatingVote,
  setRatingVote,
  getWatchlist,
  toggleWatchlist,
  type Movie,
} from "@/lib/storage";

describe("storage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("handles like and dislike votes correctly", () => {
    expect(getRatingVote(101, "movie")).toBeNull();

    setRatingVote(101, "movie", "like");
    expect(getRatingVote(101, "movie")).toBe("like");

    // Toggle to dislike
    setRatingVote(101, "movie", "dislike");
    expect(getRatingVote(101, "movie")).toBe("dislike");

    // Remove vote
    setRatingVote(101, "movie", null);
    expect(getRatingVote(101, "movie")).toBeNull();
  });

  it("distinguishes between movie and tv votes with the same id", () => {
    setRatingVote(42, "movie", "like");
    setRatingVote(42, "tv", "dislike");

    expect(getRatingVote(42, "movie")).toBe("like");
    expect(getRatingVote(42, "tv")).toBe("dislike");
  });

  it("clearLocalUserData removes votes and watchlist", () => {
    setRatingVote(123, "movie", "like");
    const mockMovie: Movie = {
      id: 123,
      title: "Test Movie",
      vote_average: 8.5,
      poster_path: null,
      backdrop_path: null,
      media_type: "movie",
    };
    toggleWatchlist(mockMovie);

    expect(getRatingVote(123, "movie")).toBe("like");
    expect(getWatchlist()).toHaveLength(1);

    clearLocalUserData();

    expect(getRatingVote(123, "movie")).toBeNull();
    expect(getWatchlist()).toHaveLength(0);
  });
});
