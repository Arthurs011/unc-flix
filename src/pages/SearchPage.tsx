import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, ChevronRight, Film, Search, X } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import PageShell from "@/components/PageShell";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchResults } from "@/hooks/useSearchResults";
import {
  type TitleType,
  filterByType,
  isSearchable,
  readSearchParams,
  searchResultKey,
  searchUrl,
} from "@/lib/search";
import { cn } from "@/lib/utils";
import { revealNow, revealStagger } from "@/lib/anim";
import "@/styles/browse.css";

const FILTERS: { value: TitleType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { query: urlQuery, page } = readSearchParams(params);
  const [type, setType] = useState<TitleType | "all">("all");

  // The field is editable here. Previously this page had no input at all, so
  // refining a search meant going back to the nav bar.
  const [draft, setDraft] = useState(urlQuery);
  const debouncedDraft = useDebouncedValue(draft, 400);

  const headerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep the field in step when the URL changes from elsewhere, such as the nav.
  useEffect(() => {
    setDraft(urlQuery);
  }, [urlQuery]);

  // Reflect the settled text in the URL. Typing does not push history entries;
  // replace keeps the back button meaningful.
  useEffect(() => {
    if (debouncedDraft === urlQuery) return;
    setParams(isSearchable(debouncedDraft) ? { q: debouncedDraft.trim() } : {}, { replace: true });
  }, [debouncedDraft, urlQuery, setParams]);

  usePageTitle(isSearchable(urlQuery) ? `"${urlQuery}" - Search` : "Search");

  const { results, isLoading, isFetching, isError, hasSearched, debouncedQuery, totalPages } =
    useSearchResults(urlQuery, { page });

  const visible = filterByType(results, type);
  const trimmed = urlQuery.trim();

  // Header entrance on mount.
  useEffect(() => revealNow(headerRef.current, { y: 18, duration: 500 }), []);

  // Stagger the result cards whenever a fresh set of results lands (new
  // query, new page, new filter, or the first load finishing). Cards are
  // visible by default; the stagger only dips them if it actually runs.
  useEffect(() => {
    if (isLoading || visible.length === 0 || !gridRef.current) return;
    revealStagger(Array.from(gridRef.current.children), { step: 20, y: 18, duration: 450 });
  }, [isLoading, visible.length, trimmed, type, page]);

  const goToPage = (next: number) => {
    setParams({ q: urlQuery, ...(next > 1 ? { page: String(next) } : {}) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell className="min-vh-100 uf-browse-top" style={{ paddingBottom: "8rem" }}>
      <div className="page-container" style={{ maxWidth: "100rem" }}>
        <header ref={headerRef} className="mb-4">
          <p className="kicker d-flex align-items-center gap-2 mb-2">
            <Search size={14} />
            Search
          </p>
          <h1
            className="fw-black text-white text-truncate mb-0"
            style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)", lineHeight: 1, letterSpacing: "-0.04em" }}
          >
            {isSearchable(urlQuery) ? `“${urlQuery}”` : "Discover Content"}
          </h1>
        </header>

        <div className="uf-search-form mb-4">
          <Search size={20} className="uf-search-icon" />
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search movies and series..."
            aria-label="Search movies and series"
            enterKeyHint="search"
            className="uf-search-input uf-search-sheet"
            style={{ paddingRight: "3.25rem" }}
          />
          {draft && (
            <button
              onClick={() => setDraft("")}
              aria-label="Clear search"
              className="uf-icon-btn position-absolute top-50 end-0 translate-middle-y border-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {!hasSearched && !isLoading && (
          <div className="text-center" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
            {/* Not a spinner: nothing is loading here, and a spinner implies it is. */}
            <Search size={40} style={{ color: "rgba(255,255,255,0.1)" }} className="mx-auto mb-4" />
            <h2
              className="fw-extrabold mb-2"
              style={{ fontSize: "1.125rem", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.3)" }}
            >
              Start your search
            </h2>
            <p
              className="text-uppercase fw-bold mb-0"
              style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)" }}
            >
              Find your favorite movies and shows
            </p>
          </div>
        )}

        {isError && hasSearched && (
          <div
            role="status"
            className="d-flex align-items-center gap-3 rounded-4 px-4 py-3"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "rgba(254,243,199,0.9)",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={20} style={{ color: "#fbbf24" }} className="flex-shrink-0" />
            Could not reach the search service. Check your connection and try again.
          </div>
        )}

        {hasSearched && !isError && isLoading && <GridSkeleton count={12} />}

        {hasSearched && !isError && !isLoading && visible.length === 0 && (
          <div
            className="rounded-4 text-center"
            style={{ padding: "7rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
          >
            <Film size={56} style={{ color: "rgba(255,255,255,0.15)" }} className="mx-auto mb-4" />
            <h2
              className="fw-extrabold mb-2"
              style={{ fontSize: "1.25rem", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.4)" }}
            >
              No matches found
            </h2>
            <p
              className="text-uppercase fw-bold mb-0"
              style={{ fontSize: "10px", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}
            >
              Try a different title or search for a series instead
            </p>
          </div>
        )}

        {visible.length > 0 && (
          <>
            <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setType(f.value)}
                    aria-pressed={type === f.value}
                    className={cn("uf-chip uf-chip-sm", type === f.value && "active")}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="mb-0 small fw-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                {visible.length} result{visible.length === 1 ? "" : "s"}
                {isFetching && <span className="ms-2" style={{ color: "rgba(255,255,255,0.25)" }}>updating...</span>}
                {debouncedQuery !== trimmed && <span className="ms-2" style={{ color: "rgba(255,255,255,0.25)" }}>typing...</span>}
              </p>
            </div>

            <div
              ref={gridRef}
              className="row g-3 g-sm-4 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6"
            >
              {visible.map((m) => (
                // Keyed by type and id: TMDB ids repeat across media types, so a
                // bare id collided and React dropped cells.
                <div className="col" key={searchResultKey(m)}>
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Search result pages"
                className="mt-5 d-flex align-items-center justify-content-center gap-3"
              >
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className="uf-btn uf-btn-ghost rounded-pill"
                  style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="fw-semibold" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className="uf-btn uf-btn-ghost rounded-pill"
                  style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
