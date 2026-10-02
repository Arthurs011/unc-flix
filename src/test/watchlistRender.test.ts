import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
});