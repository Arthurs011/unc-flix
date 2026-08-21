import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Movie, Genre, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerFast, scaleIn } from "@/lib/motion";
import { SlidersHorizontal, Check, Clapperboard, Loader2 } from "lucide-react";

export default function MoviesPage() {
  usePageTitle("Movies");
  const [searchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    genreIdParam ? Number(genreIdParam) : null
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tmdb.movieGenres()
      .then((d) => setGenres(d.genres ?? []))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    setSelectedGenre(genreIdParam ? Number(genreIdParam) : null);
  }, [genreIdParam]);

  const fetchMovies = useCallback(async (p: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await tmdb.popular(p, selectedGenre ?? undefined);

      setMovies((prev) => (reset ? res.results ?? [] : [...prev, ...(res.results ?? [])]));
      setTotalPages(res.total_pages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    setPage(1);
    fetchMovies(1, true);
  }, [selectedGenre, fetchMovies]);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(page, false);
    }
  }, [page, fetchMovies]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "800px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages]);

  return (
    <PageShell className="min-h-screen bg-background pt-28 md:pt-32 pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
              <Clapperboard className="w-3.5 h-3.5" />
              Cinema Hub
            </p>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-3">
              Movies
            </h1>
            <p className="text-white/35 uppercase tracking-[0.25em] text-[10px] font-bold">
              Exploring {selectedGenre ? genres.find((g) => g.id === selectedGenre)?.name ?? "Everything" : "Everything"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase text-[11px] tracking-widest transition-all ring-1",
                showFilters
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-transparent shadow-glow"
                  : "bg-white/[0.04] text-white/60 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </motion.button>
            <div className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08] text-[11px] font-bold uppercase tracking-widest text-white/40">
              {movies.length} Results
            </div>
          </div>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="w-full lg:w-72 shrink-0"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4">Genres</h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
                  {[{ id: null as number | null, name: "All Categories" }, ...genres].map((g) => (
                    <button
                      key={g.name}
                      onClick={() => setSelectedGenre(g.id)}
                      className={cn(
                        "flex items-center justify-between px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all",
                        selectedGenre === g.id
                          ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-glow-sm"
                          : "bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white"
                      )}
                    >
                      {g.name}
                      <Check className={cn("w-4 h-4", selectedGenre === g.id ? "opacity-100" : "opacity-0")} />
                    </button>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <GridSkeleton />
            ) : movies.length === 0 ? (
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="show"
                className="text-center py-28 rounded-3xl bg-white/[0.03] ring-1 ring-dashed ring-white/10"
              >
                <Clapperboard className="w-14 h-14 text-white/15 mx-auto mb-5" />
                <h2 className="text-xl font-extrabold tracking-tight text-white/40 mb-6">No matches found</h2>
                <button
                  onClick={() => setSelectedGenre(null)}
                  className="text-primary font-bold uppercase tracking-widest text-xs hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={selectedGenre ?? "all"}
                variants={staggerFast}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
              >
                {movies.map((m) => (
                  <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                    <MovieCard movie={m} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div ref={observerRef} className="py-16 flex justify-center">
              {loadingMore && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/25">Loading more</span>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}
