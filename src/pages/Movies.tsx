import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Movie, Genre, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Filter, SlidersHorizontal, Check } from "lucide-react";

export default function MoviesPage() {
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
    if (genreIdParam) {
      setSelectedGenre(Number(genreIdParam));
    } else {
        setSelectedGenre(null);
    }
  }, [genreIdParam]);

  const fetchMovies = useCallback(async (p: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await tmdb.popular(p, selectedGenre ?? undefined);
      
      setMovies((prev) => reset ? (res.results ?? []) : [...prev, ...(res.results ?? [])]);
      setTotalPages(res.total_pages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre]);

  // Initial fetch on genre change
  useEffect(() => {
    setPage(1);
    fetchMovies(1, true);
  }, [selectedGenre, fetchMovies]);

  // Fetch more when page changes
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
    <div className="min-h-screen bg-background pt-[100px] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
               Cinema Hub
               <div className="h-1.5 w-24 bg-primary mt-2 rounded-full shadow-glow" />
            </h1>
            <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-black">
                Explore {selectedGenre ? genres.find(g => g.id === selectedGenre)?.name : "Unlimited"} Movies
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all",
                    showFilters ? "bg-primary text-white" : "bg-secondary hover:bg-secondary/80 text-foreground border border-white/5"
                )}
             >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
             </button>
             <div className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-full bg-secondary/30 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                <span>Total: {formatNumber(movies.length)} Results</span>
             </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Advanced Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full lg:w-80 shrink-0 space-y-10"
              >
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic mb-6">Genre Hub</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        <button
                            onClick={() => setSelectedGenre(null)}
                            className={cn(
                                "flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition-all group",
                                selectedGenre === null ? "bg-primary text-white" : "bg-white/5 hover:bg-white/10 text-white/60"
                            )}
                        >
                            All Categories
                            <Check className={cn("w-4 h-4", selectedGenre === null ? "opacity-100" : "opacity-0")} />
                        </button>
                        {genres.map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setSelectedGenre(g.id)}
                                className={cn(
                                    "flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition-all",
                                    selectedGenre === g.id ? "bg-primary text-white shadow-lg" : "bg-white/5 hover:bg-white/10 text-white/60"
                                )}
                            >
                                {g.name}
                                <Check className={cn("w-4 h-4", selectedGenre === g.id ? "opacity-100" : "opacity-0")} />
                            </button>
                        ))}
                    </div>
                </section>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 animate-shimmer relative overflow-hidden" />
                ))}
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <Filter className="w-16 h-16 text-white/20 mx-auto mb-6" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/40">No Matches Found</h2>
                <button onClick={() => setSelectedGenre(null)} className="mt-8 text-primary font-black uppercase italic tracking-widest text-xs hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-8">
                {movies.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            )}

            <div ref={observerRef} className="py-20 flex justify-center">
              {loadingMore && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Loading Next Wave</span>
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number) {
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return n;
}
