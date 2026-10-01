import { describe, expect, it } from "vitest";
import { imgUrl, posterFallback, posterUrl } from "@/lib/tmdb";
import { Movie } from "@/lib/tmdb";

const show = (over: Partial<Movie> = {}): Movie => ({
  id: 1,
  title: "Dune",
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  vote_count: 1,
  ...over,
});

// These are percent-encoded data URIs, so decode before matching attributes.
const decode = (src: string) => decodeURIComponent(src);

const dims = (src: string) => {
  const m = decode(src).match(/width='(\d+)' height='(\d+)'/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
};

describe("image fallbacks", () => {
  it("never returns the 150x39 logo banner as artwork", () => {
    // The bug: a missing poster fell back to /placeholder.svg, which is a
    // 150x39 logo. It loaded successfully, so onError never fired and the
    // poster card rendered blank.
    expect(imgUrl(null)).not.toContain("placeholder.svg");
    expect(imgUrl(null, "w1280")).not.toContain("placeholder.svg");
  });

  it("uses a portrait blank for poster-sized art", () => {
    const d = dims(imgUrl(null, "w342"));
    expect(d).toEqual({ w: 342, h: 513 });
  });

  it("uses a wide blank for backdrops", () => {
    const d = dims(imgUrl(null, "w1280", true));
    expect(d).toEqual({ w: 1280, h: 720 });
  });

  it("returns the real TMDB url when a path exists", () => {
    expect(imgUrl("/abc.jpg", "w342")).toBe(
      "https://image.tmdb.org/t/p/w342/abc.jpg",
    );
  });

  it("posterUrl falls back to a title initial, so a card is recognisable", () => {
    const src = posterUrl(show({ poster_path: null }), "w500");
    expect(src.startsWith("data:image/svg+xml,")).toBe(true);
    expect(src).toBe(posterFallback("Dune"));
    // Only the initial is drawn, which is what makes the card recognisable.
    expect(decode(src)).toContain(">D<");
  });

  it("posterUrl prefers a real poster when present", () => {
    expect(posterUrl(show({ poster_path: "/p.jpg" }), "w500")).toBe(
      "https://image.tmdb.org/t/p/w500/p.jpg",
    );
  });

  it("posterUrl uses the series name when there is no title", () => {
    const series = { ...show({ poster_path: null }), title: undefined, name: "Severance" } as Movie;
    expect(decode(posterUrl(series))).toContain(">S<");
  });

  it("does not depend on a network request for placeholders", () => {
    // Inline data URIs keep a blank card from depending on a file that may
    // itself be missing.
    expect(imgUrl(null).startsWith("data:image/svg+xml,")).toBe(true);
  });
});