import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The service worker is plain JS that runs outside the app, so a routing
 * mistake here ships stale code to every returning visitor with no test
 * catching it. These assertions lock in the behaviour that mattered:
 * documents are network-first on any path, and the worker never caches itself.
 */
const source = readFileSync(resolve(__dirname, "../../public/sw.js"), "utf8");

describe("service worker caching policy", () => {
  it("treats any document request as network-first, not just /", () => {
    // The old bug: only "/" was network-first, so /watchlist and /account were
    // served from cache and mobile kept running the previous build.
    expect(source).toMatch(/mode === "navigate"/);
    expect(source).toMatch(/destination === "document"/);
    expect(source).not.toMatch(/url\.pathname === "\/"\s*\|\|/);
  });

  it("never caches the worker script or the manifest", () => {
    // Caching /sw.js pins the worker itself, so updates never reach clients.
    expect(source).toMatch(/url\.pathname === "\/sw\.js"/);
    const workerGuard = source.indexOf('/sw.js');
    const fetchHandler = source.indexOf('addEventListener("fetch"');
    expect(workerGuard).toBeGreaterThan(fetchHandler);
  });

  it("keeps hashed build assets cache-first", () => {
    expect(source).toMatch(/pathname\.startsWith\("\/assets\/"\)/);
  });

  it("bumps the cache version so old caches are dropped on activate", () => {
    expect(source).toMatch(/const CACHE = "aplmov-v4"/);
    expect(source).toMatch(/k !== CACHE/);
  });

  it("leaves cross-origin requests to the browser", () => {
    expect(source).toMatch(/hostname !== self\.location\.hostname/);
  });
});