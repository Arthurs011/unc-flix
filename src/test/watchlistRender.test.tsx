import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { toggleWatchlist, resetSyncedCaches } from "@/lib/storage";

/**
 * A card that stays on a `hidden` variant renders at opacity 0, which shows up
 * as a completely blank page under a correct item count: the data is there and
 * the grid exists, but nothing is painted. It is invisible to type checks and
 * to DOM-assertion tests, so it needs a source-level guard.
 */
const source = readFileSync(resolve(__dirname, "../pages/Watchlist.tsx"), "utf8");

describe("watchlist cards are actually painted", () => {
  it("does not leave cards on a parent-driven hidden variant", () => {
    // The bug: cards declared variants={hidden/show} while the grid declared
    // variants={staggerFast} with initial="hidden", so the hidden state stuck.
    expect(source).not.toMatch(/variants=\{\{\s*hidden:\s*\{\s*opacity:\s*0/);
    expect(source).not.toMatch(/variants=\{\{hidden:\{opacity:0/);
  });

  it("animates cards explicitly instead of inheriting a variant label", () => {
    expect(source).toMatch(/initial=\{\{ opacity: 0, y: 18 \}\}/);
    expect(source).toMatch(/animate=\{\{ opacity: 1, y: 0 \}\}/);
  });

  it("renders one card per saved title", () => {
    expect(source).toMatch(/list\.map\(\(m\) =>/);
  });

  // The grid used to animate off a variant label. When it mounted mid-session
  // (the empty-state branch swapping out for the grid on a client-side route
  // change) it never received that label, so the entire library stayed at
  // opacity 0: a correct item count above a blank screen. Assert the grid no
  // longer depends on a label resolving.
  it("does not drive the grid's visibility off a variant label", () => {
    // Scope to the grid itself; the page header legitimately uses a label.
    const grid = source.slice(source.indexOf("grid-cols-2") - 400, source.indexOf("grid-cols-2") + 200);
    expect(grid).not.toMatch(/variants=\{staggerFast\}/);
    expect(grid).not.toMatch(/initial="hidden"/);
    expect(grid).toMatch(/animate=\{\{ opacity: 1 \}\}/);
  });
});

describe("useWatchlist reports the saved library on the first render", () => {
  const FC = { id: 550, title: "Fight Club", media_type: "movie" as const };
  const GOT = { id: 1399, title: "Game of Thrones", media_type: "tv" as const };

  beforeEach(() => {
    window.localStorage.clear();
    // The store memoises in a module-level cache, so a cleared key alone would
    // leave the previous test's titles visible to the next one.
    resetSyncedCaches();
  });

  it("shows saved titles immediately instead of one frame of empty", () => {
    toggleWatchlist(FC as never);
    toggleWatchlist(GOT as never);

    const renders: number[] = [];
    function Probe() {
      const list = useWatchlist();
      renders.push(list.length);
      return <p data-testid="n">{list.length}</p>;
    }

    render(<Probe />);

    // The first render must already carry the saved titles. If it starts at 0,
    // the library swaps branches mid-session and the grid can mount stranded.
    expect(Number(screen.getByTestId("n").textContent)).toBe(2);
    expect(renders[0]).toBe(2);
  });

  it("still reports an empty library when nothing is saved", () => {
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