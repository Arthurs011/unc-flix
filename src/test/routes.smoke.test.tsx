import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

beforeAll(() => {
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

const ROUTES = ["/", "/movies", "/tv", "/movie/1", "/tv/2", "/watch/movie/1", "/watch/tv/2/1/1", "/search?q=test", "/watchlist", "/nope"];

describe("route smoke tests", () => {
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
});
