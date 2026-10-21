import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { toggleWatchlist, resetSyncedCaches } from "@/lib/storage";

const page = readFileSync(resolve(__dirname, "../pages/Watchlist.tsx"), "utf8");
const card = readFileSync(resolve(__dirname, "../components/WatchlistCard.tsx"), "utf8");

/**
 * The library spent three releases going blank under a correct item count.
 * The data was loaded and the DOM was right; nothing was painted.
 *
 * The original cause was always the same shape: the grid and its cards took
 * their visible values from a motion variant label, and that label only
 * resolved on some mounts. Loading the page fresh resolved it. Arriving from
 * a client-side route change did not, so the whole grid stayed at opacity 0
 * until a reload.
 *
 * The rebuild moved to anime.js + CSS. The equivalent failure is an entrance
 * that only exists as a JS animation and hides the element first: if the
 * animation never runs, the content stays invisible. These are source-level
 * guards for that, because neither type checking nor a DOM assertion can see
 * it — the elements exist, the count is right, and the props type-check.
 */
describe("library is painted rather than left on an unresolved entrance", () => {
  it("does not drive the grid off a variant label or a hide-first wrapper", () => {
    expect(page).not.toMatch(/variants=/);
    expect(page).not.toMatch(/initial="hidden"/);
    expect(page).not.toMatch(/animate="show"/);
    expect(page).not.toMatch(/staggerChildren/);
    // The grid wrapper must not hide its children before JS runs.
    expect(page).not.toMatch(/pre-reveal/);
  });

  it("does not drive cards off a variant label", () => {
    expect(card).not.toMatch(/variants=/);
    expect(card).not.toMatch(/initial="hidden"/);
    // The card entrance is a CSS animation: CSS animations always run and
    // always complete, so a card cannot be stranded at opacity 0.
    expect(card).toMatch(/animation: "route-fade-in/);
    expect(card).toMatch(/animationDelay/);
  });

  it("staggers cards by index", () => {
    expect(card).toMatch(/index \* 0\.04/);
  });

  it("renders one card per saved title", () => {
    expect(page).toMatch(/list\.map\(\(m, i\) =>/);
  });

  it("imports the image fallback its error handler calls", () => {
    // The handler referenced posterFallback with no import, which threw a
    // ReferenceError the type checker never saw.
    expect(card).toMatch(/import .*posterFallback.* from "@\/lib\/tmdb"/);
  });

  it("forwards its ref, because the grid measures cards", () => {
    expect(card).toMatch(/forwardRef<HTMLDivElement, Props>/);
    expect(card).toMatch(/ref=\{ref\}/);
  });
});

describe("useWatchlist reports the saved library on the first render", () => {
  const FC = { id: 550, title: "Fight Club", media_type: "movie" as const };
  const GOT = { id: 1399, title: "Game of Thrones", media_type: "tv" as const };

  beforeEach(() => {
    window.localStorage.clear();
    // The store memoises in a module-level cache, so clearing the key alone
    // would leave the previous test's titles visible to the next one.
    resetSyncedCaches();
  });

  it("shows saved titles on the very first render, not one frame of empty", () => {
    toggleWatchlist(FC as never);
    toggleWatchlist(GOT as never);

    const renders: number[] = [];
    function Probe() {
      const list = useWatchlist();
      renders.push(list.length);
      return <p data-testid="n">{list.length}</p>;
    }

    render(<Probe />);

    expect(Number(screen.getByTestId("n").textContent)).toBe(2);
    expect(renders[0]).toBe(2);
  });

  it("reports an empty library when nothing is saved", () => {
    function Probe() {
      return <p data-testid="n">{useWatchlist().length}</p>;
    }
    render(<Probe />);
    expect(Number(screen.getByTestId("n").textContent)).toBe(0);
  });

  it("reflects a save that happens while the page is open", () => {
    function Probe() {
      return <p data-testid="n">{useWatchlist().length}</p>;
    }
    const { rerender } = render(<Probe />);
    expect(Number(screen.getByTestId("n").textContent)).toBe(0);
    toggleWatchlist(FC as never);
    rerender(<Probe />);
    expect(Number(screen.getByTestId("n").textContent)).toBe(1);
  });
});
