import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, ChevronLeft, ChevronRight, Film, Loader2, Search, X } from "lucide-react";
import { motion } from "motion/react";
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
import { springSnappy } from "@/lib/motion";

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

  const goToPage = (next: number) => {
    setParams({ q: urlQuery, ...(next > 1 ? { page: String(next) } : {}) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageShell className="min-h-screen bg-background px-4 pt-28 pb-32 sm:px-6 md:pt-32 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSnappy}
          className="mb-8"
        >
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            <Search className="h-3.5 w-3.5" />
            Search
          </p>
          <h1 className="truncate text-3xl font-black leading-none tracking-tighter text-white sm:text-5xl">
            {isSearchable(urlQuery) ? `“${urlQuery}”` : "Discover Content"}
          </h1>
        </motion.header>

        <div className="relative mb-8">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35"
          />
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search movies and series..."
            aria-label="Search movies and series"
            enterKeyHint="search"
            className="h-14 w-full rounded-2xl bg-white/[0.06] pl-12 pr-12 text-base text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-primary/60"
          />
          {draft && (
            <button
              onClick={() => setDraft("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/40 hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!hasSearched && !isLoading && (
          <div className="py-24 text-center">
            {/* Not a spinner: nothing is loading here, and a spinner implies it is. */}
            <Search className="mx-auto mb-5 h-10 w-10 text-white/10" />
            <h2 className="mb-2 text-lg font-extrabold tracking-tight text-white/30">
              Start your search
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              Find your favorite movies and shows
            </p>
          </div>
        )}

        {isError && hasSearched && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-2xl bg-amber-500/10 px-5 py-4 text-sm text-amber-100/90 ring-1 ring-amber-500/30"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
            Could not reach the search service. Check your connection and try again.
          </div>
        )}

        {hasSearched && !isError && isLoading && <GridSkeleton count={12} />}

        {hasSearched && !isError && !isLoading && visible.length === 0 && (
          <div className="rounded-3xl bg-white/[0.03] py-28 text-center ring-1 ring-dashed ring-white/10">
            <Film className="mx-auto mb-5 h-14 w-14 text-white/15" />
            <h2 className="mb-2 text-xl font-extrabold tracking-tight text-white/40">
              No matches found
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Try a different title or search for a series instead
            </p>
          </div>
        )}

        {visible.length > 0 && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setType(f.value)}
                    aria-pressed={type === f.value}
                    className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      type === f.value
                        ? "bg-primary/15 text-primary ring-1 ring-primary/40"
                        : "bg-white/[0.04] text-white/50 ring-1 ring-white/[0.08] hover:text-white/80"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p aria-live="polite" className="text-xs font-medium text-white/40">
                {visible.length} result{visible.length === 1 ? "" : "s"}
                {isFetching && <span className="ml-2 text-white/25">updating...</span>}
                {debouncedQuery !== trimmed && <span className="ml-2 text-white/25">typing...</span>}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={springSnappy}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              {visible.map((m, i) => (
                // Keyed by type and id: TMDB ids repeat across media types, so a
                // bare id collided and React dropped cells.
                <motion.div
                  key={searchResultKey(m)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springSnappy, delay: Math.min(i * 0.02, 0.3) }}
                >
                  <MovieCard movie={m} />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <nav
                aria-label="Search result pages"
                className="mt-12 flex items-center justify-center gap-3"
              >
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous page"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-xs font-semibold text-white/50">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/70 ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}