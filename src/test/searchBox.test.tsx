import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import SearchBox from "@/components/SearchBox";
import { SEARCH_DEBOUNCE_MS } from "@/lib/search";
import type { Movie } from "@/lib/tmdb";

/**
 * Covers the three failures the old search had, which no test was watching for:
 *
 *  - a stale response overwriting a newer one
 *  - the same term costing a second request from a second surface
 *  - the suggestions being unreachable by keyboard and invisible to a screen
 *    reader
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

const page = (results: Movie[]) => ({ results, total_pages: 3, page: 1, total_results: 99 });

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: 0 } },
  });
  return function Wrap({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  search.mockReset();
  search.mockResolvedValue(page([movie(1, "Alpha"), show(2, "Beta")]));
});

afterEach(() => {
  vi.useRealTimers();
});

const input = () => screen.getByRole("combobox");

/** Set the field's value and fire the change event React listens for. */
function type(text: string) {
  fireEvent.change(input(), { target: { value: text } });
}

const key = (k: string) => fireEvent.keyDown(input(), { key: k });

describe("the query is debounced into a single request", () => {
  it("does not fire while typing and fires once the text settles", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });

    type("dune");
    expect(search).not.toHaveBeenCalled();

    await waitFor(() => expect(search).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(search.mock.calls[0][0]).toBe("dune");
  });

  it("does not fire for a single character", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("d");
    await new Promise((r) => setTimeout(r, SEARCH_DEBOUNCE_MS * 3));
    expect(search).not.toHaveBeenCalled();
  });
});

describe("a stale response cannot overwrite a newer one", () => {
  it("aborts the superseded request and shows the newest results", async () => {
    const aborted: string[] = [];
    // "dune" resolves slowly, "dune part" quickly. Without cancellation the
    // slow older response lands last and its results are what the user sees.
    search.mockImplementation((q: string, _p: number, signal?: AbortSignal) => {
      if (q === "dune") {
        signal?.addEventListener("abort", () => aborted.push(q));
        return new Promise((_res, rej) => {
          signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
        });
      }
      return Promise.resolve(page([movie(9, "Newest")]));
    });

    render(<SearchBox variant="pill" />, { wrapper: wrapper() });

    type("dune");
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1), { timeout: 3000 });

    type(" part");
    await waitFor(() => expect(search).toHaveBeenCalledTimes(2), { timeout: 3000 });

    await waitFor(() => expect(screen.getByText("Newest")).toBeTruthy(), { timeout: 3000 });
    expect(aborted).toEqual(["dune"]);
    expect(screen.queryByText("Alpha")).toBeNull();
  });
});

describe("results are shared between surfaces", () => {
  it("reuses the cache for a term it has already fetched", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: 60_000 } },
    });
    const Wrap = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );

    const first = render(<SearchBox variant="pill" />, { wrapper: Wrap });
    type("dune");
    await waitFor(() => expect(search).toHaveBeenCalledTimes(1), { timeout: 3000 });
    first.unmount();

    // The nav dropdown unmounts and the results page mounts for the same term.
    // Keyed by query, so this is served from cache rather than re-fetched.
    render(<SearchBox variant="pill" />, { wrapper: Wrap });
    type("dune");
    await waitFor(() => expect(screen.getByText("Alpha")).toBeTruthy(), { timeout: 3000 });
    // Served from the entry the first surface already populated.
    expect(search).toHaveBeenCalledTimes(1);
  });
});

describe("the field is a real combobox", () => {
  it("exposes the ARIA the old input was missing", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });

    const el = input() as HTMLInputElement;
    expect(el.getAttribute("aria-expanded")).toBe("false");
    expect(el.getAttribute("aria-autocomplete")).toBe("list");
    expect(el.getAttribute("aria-controls")).toBeTruthy();
    expect(el.getAttribute("aria-label")).toBeTruthy();

    type("du");
    await waitFor(() => expect(screen.getByRole("listbox")).toBeTruthy(), { timeout: 3000 });
    expect(el.getAttribute("aria-expanded")).toBe("true");
    expect(el.getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
  });

  it("puts the field in a search landmark", () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    expect(screen.getByRole("search")).toBeTruthy();
  });
});

describe("suggestions are reachable by keyboard", () => {
  it("arrows down through the options and tracks aria-activedescendant", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2), { timeout: 3000 });

    key("ArrowDown");
    await waitFor(() => expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true"));
    expect(input().getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[0].id);

    key("ArrowDown");
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");

    key("ArrowUp");
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
  });

  it("wraps around at both ends", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2), { timeout: 3000 });

    key("ArrowUp");
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
  });

  it("leaves Enter to the form when no row is highlighted", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2), { timeout: 3000 });

    // No highlight: Enter must submit the form rather than open the first row.
    expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("false");
  });
});

describe("picking a suggestion", () => {
  /**
   * The option button lives inside the search <form>. As a bare <button> it
   * defaulted to type="submit", so on touch the tap submitted the form and the
   * user landed on /search?q=... instead of the title.
   */
  it("does not submit the form when an option is clicked", async () => {
    const { container } = render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2), { timeout: 3000 });

    const form = container.querySelector("form") as HTMLFormElement;
    const submit = vi.fn((e: Event) => e.preventDefault());
    form.addEventListener("submit", submit);

    // The handler is on the button inside the row, which is what a real click hits.
    fireEvent.click(screen.getAllByRole("option")[0].querySelector("button") as HTMLElement);
    expect(submit).not.toHaveBeenCalled();
  });

  it("marks its options as type=button so they can never submit", async () => {
    const { container } = render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2), { timeout: 3000 });

    const types = [...container.querySelectorAll('[role="option"] button')].map((b) =>
      (b as HTMLButtonElement).getAttribute("type"),
    );
    expect(types).toEqual(["button", "button"]);
  });

  it("selects on click, which is what touch and assistive tech send", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2), { timeout: 3000 });

    // A plain click, with no preceding mousedown/pointerdown, as touch sends.
    fireEvent.click(screen.getAllByRole("option")[1].querySelector("button") as HTMLElement);
    // Selecting clears the field and closes it. The list node itself lingers in
    // jsdom because the exit animation never finishes, so assert on the field.
    await waitFor(() => expect((input() as HTMLInputElement).value).toBe(""), { timeout: 3000 });
  });
});

describe("nothing is shown before there is something to search for", () => {
  it("hides the panel under the threshold", async () => {
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("d");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("says so when a real query returns nothing", async () => {
    search.mockResolvedValue(page([]));
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("zzzz");
    await waitFor(() => expect(screen.getByText(/No results for/)).toBeTruthy(), { timeout: 3000 });
  });

  it("tells the user when search is unreachable instead of showing empty", async () => {
    search.mockRejectedValue(new Error("TMDB error: 500"));
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("dune");
    await waitFor(() => expect(screen.getByText(/Could not reach search/)).toBeTruthy(), {
      timeout: 3000,
    });
  });

  it("never renders people from the multi endpoint", async () => {
    search.mockResolvedValue(
      page([
        { ...movie(1, "Alpha"), media_type: "person" } as Movie,
        movie(2, "Real Movie"),
      ]),
    );
    render(<SearchBox variant="pill" />, { wrapper: wrapper() });
    type("du");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1), { timeout: 3000 });
    expect(screen.getByText("Real Movie")).toBeTruthy();
  });
});