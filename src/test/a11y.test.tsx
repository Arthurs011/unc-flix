import { describe, it, expect, beforeAll, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * The accessibility contract, pinned.
 *
 * These are the regressions that made the app harder to use for keyboard and
 * screen-reader visitors, and they are cheap to break, so they are worth a
 * test each.
 */

beforeAll(() => {
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
          overview: "A test film.",
          poster_path: null,
          backdrop_path: null,
          vote_average: 7,
          vote_count: 100,
          genres: [],
          runtime: 120,
          videos: { results: [{ site: "YouTube", type: "Trailer", key: "abc123" }] },
        }),
      movieRecommendations: noop,
      movieReviews: noop,
    },
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  const Passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return { ...actual, BrowserRouter: Passthrough };
});

const App = (await import("@/App")).default;

function renderApp(route: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const ROUTES = [
  "/",
  "/movies",
  "/tv",
  "/movie/1",
  "/search?q=test",
  "/watchlist",
  "/auth",
  "/account",
  "/nope",
];

describe("the skip link has a target", () => {
  it("links to the main landmark", async () => {
    const { container } = renderApp("/");
    const skip = container.querySelector<HTMLAnchorElement>('a[href="#main-content"]');
    expect(skip).toBeTruthy();
    await waitFor(() => {
      expect(container.querySelector("#main-content")).toBeTruthy();
    });
  });

  for (const route of ROUTES) {
    it(`gives ${route} exactly one focusable main landmark`, async () => {
      const { container } = renderApp(route);
      await waitFor(() => {
        expect(container.querySelectorAll("#main-content").length).toBe(1);
      });
      const landmark = container.querySelector("#main-content");
      expect(landmark?.tagName).toBe("MAIN");
      // The landmark has to be focusable, or the jump goes nowhere.
      expect(landmark?.getAttribute("tabindex")).toBe("-1");
    });
  }
});

describe("the trailer dialog behaves like a dialog", () => {
  it("closes on Escape and hands focus back to the button that opened it", async () => {
    renderApp("/movie/1");

    const trailer = await screen.findByRole("button", { name: /trailer/i });
    trailer.focus();
    fireEvent.click(trailer);

    const dialog = await screen.findByRole("dialog", { name: /trailer/i });
    expect(dialog).toBeTruthy();

    // The close button takes focus, so a keyboard visitor is inside the
    // dialog rather than behind it.
    await waitFor(() => {
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Close trailer");
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /trailer/i })).toBeNull();
    });
    expect(document.activeElement).toBe(trailer);
  });

  it("locks the page behind it while it is open", async () => {
    renderApp("/movie/1");
    const trailer = await screen.findByRole("button", { name: /trailer/i });
    fireEvent.click(trailer);

    await screen.findByRole("dialog", { name: /trailer/i });
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(document.body.style.overflow).not.toBe("hidden");
    });
  });
});
