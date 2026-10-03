import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchPage from "@/pages/SearchPage";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/search";
import type { Movie } from "@/lib/tmdb";

/**
 * The old page read `q` from the URL once, so a search typed in the page's own
 * input never reached the URL and the results could not be shared or reloaded.
 * These tests pin the URL as the source of truth.
 */

const search = vi.hoisted(() => vi.fn());
vi.mock("@/lib/tmdb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tmdb")>();
  return { ...actual, tmdb: { ...actual.tmdb, search } };
});

const movie = (id: number, title: string): Movie => ({
  id,
  title,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 7,
  vote_count: 1,
  media_type: "movie",
});

const show = (id: number, name: string): Movie => ({
  id,
  name,
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 8,
  vote_count: 1,
  media_type: "tv",
});

const person = (id: number): Movie => ({
  id,
  name: "Actor",
  overview: "",
  poster_path: null,
  backdrop_path: null,
  vote_average: 0,
  vote_count: 0,
  media_type: "person",
});

beforeEach(() => {
  search.mockReset();
  search.mockResolvedValue({
    results: Array.from({ length: PAGE_SIZE }, (_, i) => movie(i + 1, `Result ${i + 1}`)),
    total_pages: 4,
    page: 1,
    total_results: 200,
  });
});

afterEach(() => vi.useRealTimers());

function mount(initial = "/search") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const utils = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return utils;
}

const field = () => screen.getByPlaceholderText("Search movies and series...");

describe("the URL drives the page", () => {
  it("runs a search for q in the address bar", async () => {
    mount("/search?q=dune");
    await waitFor(() => expect(search).toHaveBeenCalledWith("dune", 1, expect.anything()), {
      timeout: 3000,
    });
    expect((field() as HTMLInputElement).value).toBe("dune");
  });

  it("shows a prompt, not a spinner, before anything is searched for", async () => {
    mount("/search");
    expect(search).not.toHaveBeenCalled();
    expect(screen.getByText("Start your search")).toBeTruthy();
    expect(screen.getByText(/Find your favorite movies and shows/i)).toBeTruthy();
  });

  it("keeps the people out of a /search/multi response", async () => {
    search.mockResolvedValue({ results: [movie(1, "Alpha"), person(2), show(3, "Beta")], total_pages: 1, total_results: 3 });
    mount("/search?q=dune");
    await waitFor(() => expect(screen.getByText("Alpha")).toBeTruthy(), { timeout: 3000 });
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.queryByText("Actor")).toBeNull();
  });

  it("says so when a search comes back empty", async () => {
    search.mockResolvedValue({ results: [], total_pages: 0, total_results: 0 });
    mount("/search?q=zzzzz");
    await waitFor(() => expect(screen.getByText("No matches found")).toBeTruthy(), { timeout: 3000 });
  });

  it("reports an unreachable API instead of an empty library", async () => {
    search.mockRejectedValue(new Error("TMDB error: 500"));
    mount("/search?q=dune");
    await waitFor(() => expect(screen.getByText(/Could not reach the search service/)).toBeTruthy(), {
      timeout: 3000,
    });
  });
});

describe("typing in the page updates the URL", () => {
  it("debounces, so a query is not rewritten on every keystroke", async () => {
    mount("/search");
    fireEvent.change(field(), { target: { value: "dune" } });

    fireEvent.change(field(), { target: { value: "dune 2" } });
    fireEvent.change(field(), { target: { value: "dune part two" } });

    await waitFor(
      () => expect(search).toHaveBeenCalledWith("dune part two", 1, expect.anything()),
      { timeout: 4000 },
    );
    // One call, not one per keystroke.
    expect(search).toHaveBeenCalledTimes(1);
  });

  it("drops the query from the URL when the field is cleared", async () => {
    mount("/search?q=dune");
    await waitFor(() => expect((field() as HTMLInputElement).value).toBe("dune"), { timeout: 3000 });
    const before = search.mock.calls.length;
    fireEvent.change(field(), { target: { value: "" } });
    await new Promise((r) => setTimeout(r, SEARCH_DEBOUNCE_MS * 4));
    // No new request, and the old one was not reissued.
    expect(search).toHaveBeenCalledTimes(before);
  });
});

describe("filters narrow the current page", () => {
  it("hides shows when movies are the only thing on show", async () => {
    search.mockResolvedValue({
      results: [movie(1, "Alpha"), show(2, "Beta"), movie(3, "Gamma")],
      total_pages: 1,
      total_results: 3,
    });
    mount("/search?q=dune");
    await waitFor(() => expect(screen.getByText("Beta")).toBeTruthy(), { timeout: 3000 });

    fireEvent.click(screen.getByRole("button", { name: /movies/i }));
    await waitFor(() => expect(screen.queryByText("Beta")).toBeNull());
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Gamma")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /series/i }));
    await waitFor(() => expect(screen.getByText("Beta")).toBeTruthy());
    expect(screen.queryByText("Alpha")).toBeNull();
  });
});

describe("pagination", () => {
  it("offers the pages the API reported", async () => {
    mount("/search?q=dune");
    await waitFor(() => expect(search).toHaveBeenCalled(), { timeout: 3000 });
    expect(screen.getByRole("button", { name: /next/i })).toBeTruthy();
    expect(screen.getByText(/page 1 of 4/i)).toBeTruthy();
  });

  it("asks the API for the page the user picked", async () => {
    mount("/search?q=dune");
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1), { timeout: 3000 });
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => expect(search).toHaveBeenCalledWith("dune", 2, expect.anything()), {
      timeout: 3000,
    });
  });

  it("requests the page named in the URL", async () => {
    mount("/search?q=dune&page=3");
    await waitFor(() => expect(search).toHaveBeenCalledWith("dune", 3, expect.anything()), {
      timeout: 3000,
    });
  });
});

describe("every result has a working link", () => {
  it("sends a show to /tv and a movie to /movie", async () => {
    search.mockResolvedValue({ results: [movie(550, "Fight Club"), show(550, "Twin Peaks")], total_pages: 1, total_results: 2 });
    mount("/search?q=550");
    await waitFor(() => expect(screen.getByText("Fight Club")).toBeTruthy(), { timeout: 3000 });

    // The old grid keyed on id alone, so these two collided into one card.
    expect(screen.getByText("Fight Club").closest("a")?.getAttribute("href")).toBe("/movie/550");
    expect(screen.getByText("Twin Peaks").closest("a")?.getAttribute("href")).toBe("/tv/550");
  });
});