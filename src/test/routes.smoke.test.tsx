import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContinueRow from "@/components/ContinueRow";

beforeAll(() => {
  const values = new Map<string, string>();
  const storage: Storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, String(value)),
    removeItem: (key) => void values.delete(key),
    clear: () => values.clear(),
    key: (index) => Array.from(values.keys())[index] ?? null,
    get length() {
      return values.size;
    },
  };
  Object.defineProperty(window, "localStorage", { configurable: true, value: storage });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (q: string) => ({
        matches: false,
        media: q,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
  (window as unknown as { scrollTo: () => void }).scrollTo = () => {};
});

vi.mock("@/lib/tmdb", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tmdb")>();
  const empty = { results: [], total_pages: 1 };
  const noop = () => Promise.resolve(empty);
  return {
    ...actual,
    tmdb: {
      ...actual.tmdb,
      trending: noop,
      popular: noop,
      topRated: noop,
      upcoming: noop,
      tvPopular: noop,
      search: noop,
      movieGenres: () => Promise.resolve({ genres: [] }),
      tvGenres: () => Promise.resolve({ genres: [] }),
      movieDetails: () =>
        Promise.resolve({
          id: 1,
          title: "Test",
          overview: "",
          poster_path: null,
          backdrop_path: null,
          vote_average: 7,
          vote_count: 100,
          genres: [],
          runtime: 120,
        }),
      tvDetails: () =>
        Promise.resolve({
          id: 2,
          name: "Test Show",
          overview: "",
          poster_path: null,
          backdrop_path: null,
          vote_average: 8,
          vote_count: 100,
          number_of_seasons: 2,
          seasons: [
            { season_number: 1, episode_count: 8, name: "Season 1" },
            { season_number: 2, episode_count: 6, name: "Season 2" },
          ],
          genres: [],
        }),
      movieRecommendations: noop,
      tvRecommendations: noop,
      movieReviews: noop,
      tvReviews: noop,
      tvEpisode: () =>
        Promise.resolve({ id: 9, air_date: "", episode_number: 1, season_number: 1, name: "Pilot" }),
      tvSeason: () =>
        Promise.resolve({ id: 5, name: "", overview: "", season_number: 1, episodes: [] }),
    },
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  const Passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return { ...actual, BrowserRouter: Passthrough };
});

const App = (await import("@/App")).default;

const ROUTES = ["/", "/movies", "/tv", "/anime", "/marvel", "/animated", "/movie/1", "/tv/2", "/watch/movie/1", "/watch/tv/2?season=1&episode=1", "/watch/tv/2/2/3", "/search?q=test", "/watchlist", "/nope"];

describe("route smoke tests", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  for (const route of ROUTES) {
    it(`renders ${route} without crashing`, () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const { container, unmount } = render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      );
      expect(container.innerHTML).not.toContain("Something broke the stream");
      unmount();
    });
  }

  it("survives navigation when scrollTo returns a promise like Chrome", async () => {
    const original = window.scrollTo;
    (window as unknown as { scrollTo: unknown }).scrollTo = () => Promise.resolve();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { container, unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    try {
      await waitFor(() => {
        expect(container.querySelector('a[href="/movies"]')).not.toBeNull();
      });
      fireEvent.click(container.querySelector('a[href="/movies"]') as HTMLAnchorElement);
      await waitFor(() => {
        expect(container.textContent).not.toContain("interrupted this page");
      });
    } finally {
      unmount();
      (window as unknown as { scrollTo: unknown }).scrollTo = original;
    }
  });

  it("resumes and removes continue watching items", async () => {
    window.localStorage.setItem(
      "uncflix_continue",
      JSON.stringify([
        {
          id: 42,
          type: "tv",
          title: "Test Series",
          poster_path: null,
          backdrop_path: null,
          progress: 25,
          currentTime: 90,
          duration: 360,
          season: 2,
          episode: 3,
          timestamp: Date.now(),
        },
      ])
    );
    const { container, unmount } = render(
      <MemoryRouter>
        <ContinueRow />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(container.querySelector('a[href="/watch/tv/42?season=2&episode=3&t=90"]')).not.toBeNull();
    });
    const removeButton = container.querySelector('button[aria-label="Remove Test Series from continue watching"]');
    expect(removeButton).not.toBeNull();
    fireEvent.click(removeButton as HTMLButtonElement);
    await waitFor(() => {
      expect(container.querySelector('a[href="/watch/tv/42?season=2&episode=3&t=90"]')).toBeNull();
    });
    expect(JSON.parse(window.localStorage.getItem("uncflix_continue") ?? "[]")).toHaveLength(0);
    unmount();
  });
});
