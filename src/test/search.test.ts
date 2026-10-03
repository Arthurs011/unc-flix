import { describe, expect, it } from "vitest";
import {
  filterByType,
  isSearchable,
  isTitle,
  readSearchParams,
  searchResultKey,
  searchUrl,
  titlePath,
  toTitles,
} from "@/lib/search";
import type { Movie } from "@/lib/tmdb";

const movie = (id: number, title = `Movie ${id}`): Movie => ({
  id,
  title,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  vote_count: 1,
  media_type: "movie",
});

const show = (id: number, name = `Show ${id}`): Movie => ({
  id,
  name,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  vote_count: 1,
  media_type: "tv",
});

const person = (id: number): Movie => ({
  id,
  name: "Some Actor",
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 0,
  vote_count: 0,
  media_type: "person",
});

describe("search result keys", () => {
  /**
   * TMDB ids are unique per media type. The old grid keyed on `m.id` alone, so
   * movie 550 and tv 550 in the same result set collided and React silently
   * dropped one of the cells.
   */
  it("distinguishes a movie and a show that share an id", () => {
    expect(searchResultKey(movie(550))).toBe("movie:550");
    expect(searchResultKey(show(550))).toBe("tv:550");
    expect(searchResultKey(movie(550))).not.toBe(searchResultKey(show(550)));
  });

  it("produces as many distinct keys as there are distinct titles", () => {
    const keys = [movie(1), show(1), movie(2), show(2)].map(searchResultKey);
    expect(new Set(keys).size).toBe(4);
  });
});

describe("toTitles", () => {
  it("drops people, which /search/multi also returns", () => {
    expect(toTitles([movie(1), person(2), show(3)])).toHaveLength(2);
  });

  it("drops titles with no name to display", () => {
    const nameless = { ...movie(9), title: undefined };
    expect(toTitles([nameless])).toHaveLength(0);
  });

  it("collapses duplicate titles from the same page", () => {
    expect(toTitles([movie(1), movie(1), show(1)])).toHaveLength(2);
  });

  it("keeps a movie and a show that share an id", () => {
    expect(toTitles([movie(550), show(550)])).toHaveLength(2);
  });

  it("survives a malformed response instead of throwing", () => {
    expect(toTitles(undefined)).toEqual([]);
    expect(toTitles(null)).toEqual([]);
    expect(toTitles([] as unknown as Movie[])).toEqual([]);
  });
});

describe("filterByType", () => {
  const titles = [movie(1), show(2), movie(3), show(4)];

  it("passes everything through for all", () => {
    expect(filterByType(titles, "all")).toHaveLength(4);
  });

  it("narrows to movies", () => {
    expect(filterByType(titles, "movie").map((t) => t.id)).toEqual([1, 3]);
  });

  it("narrows to shows", () => {
    expect(filterByType(titles, "tv").map((t) => t.id)).toEqual([2, 4]);
  });
});

describe("titlePath", () => {
  it("links a show to the tv route and a movie to the movie route", () => {
    expect(titlePath(movie(550))).toBe("/movie/550");
    expect(titlePath(show(1399))).toBe("/tv/1399");
  });
});

describe("search URLs", () => {
  it("round-trips a query", () => {
    const url = searchUrl("dune");
    const params = new URLSearchParams(url.split("?")[1]);
    expect(readSearchParams(params)).toEqual({ query: "dune", page: 1 });
  });

  it("trims the query, unlike the old page which sent it raw", () => {
    expect(new URLSearchParams(searchUrl("  dune  ").split("?")[1]).get("q")).toBe("dune");
  });

  it("only puts page in the URL past the first", () => {
    expect(searchUrl("dune")).not.toContain("page");
    expect(new URLSearchParams(searchUrl("dune", 3).split("?")[1]).get("page")).toBe("3");
  });

  it("survives a nonsense page param rather than paging to NaN", () => {
    expect(readSearchParams(new URLSearchParams("q=dune&page=abc")).page).toBe(1);
    expect(readSearchParams(new URLSearchParams("q=dune&page=-3")).page).toBe(1);
    expect(readSearchParams(new URLSearchParams("q=dune&page=2")).page).toBe(2);
  });

  it("encodes characters that would otherwise break the query string", () => {
    expect(searchUrl("a&b=c")).toContain("a%26b%3Dc");
  });

  it("reports an empty query as empty rather than undefined", () => {
    expect(readSearchParams(new URLSearchParams("")).query).toBe("");
  });
});

describe("query threshold", () => {
  it("needs two characters, so a single keystroke costs nothing", () => {
    expect(isSearchable("a")).toBe(false);
    expect(isSearchable("")).toBe(false);
    expect(isSearchable("  ")).toBe(false);
    expect(isSearchable("du")).toBe(true);
  });

  it("counts the trimmed length", () => {
    expect(isSearchable("  a  ")).toBe(false);
  });
});

describe("isTitle", () => {
  it("accepts movies and shows only", () => {
    expect(isTitle(movie(1))).toBe(true);
    expect(isTitle(show(1))).toBe(true);
    expect(isTitle(person(1))).toBe(false);
  });

  it("excludes a result with no media_type rather than guessing it is a movie", () => {
    // /search/multi labels everything it returns, so an unlabelled entry is not
    // something to link to. Guessing "movie" would route it somewhere wrong.
    expect(isTitle({ ...movie(1), media_type: undefined })).toBe(false);
  });
});