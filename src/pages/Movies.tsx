import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clapperboard, Film, Loader2, SlidersHorizontal } from "lucide-react";
import { tmdb, type Genre, type Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import ContentRow from "@/components/ContentRow";
import PageShell from "@/components/PageShell";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function MoviesPage() {
  usePageTitle("Movies");
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(genreIdParam ? Number(genreIdParam) : null);

  const handleSelectGenre = (genreId: number | null) => {
    setSelectedGenre(genreId);
    const next = new URLSearchParams(searchParams);
    if (genreId === null) next.delete("genre");
    else next.set("genre", String(genreId));
    setSearchParams(next);
  };
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tmdb.movieGenres().then((data) => setGenres(data.genres ?? [])).catch(() => setGenres([]));
    tmdb.trending().then((data) => setTrending((data.results ?? []).slice(0, 10))).catch(() => setTrending([]));
  }, []);

  useEffect(() => {
    setSelectedGenre(genreIdParam ? Number(genreIdParam) : null);
  }, [genreIdParam]);

  const fetchMovies = useCallback(async (nextPage: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const response = await tmdb.popular(nextPage, selectedGenre ?? undefined);
      setMovies((current) => (reset ? response.results ?? [] : [...current, ...(response.results ?? [])]));
      setTotalPages(response.total_pages ?? 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    setPage(1);
    void fetchMovies(1, true);
  }, [fetchMovies]);

  useEffect(() => {
    if (page > 1) void fetchMovies(page);
  }, [fetchMovies, page]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !loadingMore && page < totalPages) setPage((current) => current + 1);
      },
      { rootMargin: "800px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages]);

  const activeGenreName = genres.find((genre) => genre.id === selectedGenre)?.name;

  return (
    <PageShell className="min-h-screen bg-background pb-32 pt-24 sm:pt-28 md:pt-32">
      <div className="section-shell">
        <header className="mb-8 flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 md:mb-10 md:flex-row md:items-end md:pb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
            <p className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.28em] text-primary">
              <Clapperboard className="h-3.5 w-3.5" />
              Cinema archive
            </p>
            <h1 className="text-4xl font-black leading-none tracking-[-0.06em] text-white sm:text-6xl">Movies</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/38">
              Feature films selected for a quieter, more deliberate kind of movie night.
            </p>
          </motion.div>
          <div className="flex items-center gap-2.5">
            <span className="hidden h-10 items-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35 sm:inline-flex">
              {movies.length} {movies.length === 1 ? "title" : "titles"}
            </span>
            <button
              type="button"
              onClick={() => setShowFilters((visible) => !visible)}
              aria-expanded={showFilters}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors",
                showFilters ? "border-primary/30 bg-primary/[0.09] text-primary" : "border-white/[0.09] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </header>

        {!selectedGenre && trending.length > 0 && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
            <ContentRow title="Trending in cinema" description="The films making the most noise this week." results={trending} />
          </div>
        )}

        <div className={cn("grid gap-8", showFilters && "lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10")}>
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="self-start rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 lg:sticky lg:top-24"
              >
                <div className="mb-3 flex items-center justify-between px-2 pt-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">Genre</h2>
                  {selectedGenre && (
                    <button type="button" onClick={() => handleSelectGenre(null)} className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary hover:text-sky-200">Reset</button>
                  )}
                </div>
                <div className="grid max-h-[60vh] grid-cols-2 gap-1 overflow-y-auto lg:grid-cols-1">
                  {[{ id: null as number | null, name: "All films" }, ...genres].map((genre) => (
                    <button
                      key={genre.name}
                      type="button"
                      onClick={() => handleSelectGenre(genre.id)}
                      className={cn(
                        "flex min-h-10 items-center justify-between rounded-lg px-3 text-left text-xs font-medium transition-colors",
                        selectedGenre === genre.id ? "bg-primary text-[#071019]" : "text-white/45 hover:bg-white/[0.05] hover:text-white/85"
                      )}
                    >
                      {genre.name}
                      <Check className={cn("h-3.5 w-3.5", selectedGenre === genre.id ? "opacity-100" : "opacity-0")} />
                    </button>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <main className="min-w-0" aria-label="Movie results">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/28">
                {activeGenreName ?? "All films"}
              </p>
              <span className="h-px flex-1 bg-white/[0.06]" />
            </div>
            {loading ? (
              <GridSkeleton />
            ) : movies.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.12] text-center">
                <Film className="mb-4 h-8 w-8 text-white/18" />
                <h2 className="text-lg font-semibold tracking-tight text-white/65">No films in this cut</h2>
                <button type="button" onClick={() => handleSelectGenre(null)} className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary hover:text-sky-200">Clear filter</button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
              </motion.div>
            )}
            <div ref={observerRef} className="flex min-h-24 items-center justify-center py-10">
              {loadingMore && (
                <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/28">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading more
                </div>
              )}
              {!loading && !loadingMore && page >= totalPages && movies.length > 0 && <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/18">End of collection</span>}
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}
