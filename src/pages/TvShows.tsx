import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Movie, Genre, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Check, Tv, Star, Play, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MOOD_PILLS = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
];

export default function TvShowsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");

  const [shows, setShows] = useState<Movie[]>([]);
  const [heroShow, setHeroShow] = useState<Movie | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    genreIdParam ? Number(genreIdParam) : null
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  // Sync state with URL
  useEffect(() => {
    if (genreIdParam) {
      setSelectedGenre(Number(genreIdParam));
    } else {
        setSelectedGenre(null);
    }
  }, [genreIdParam]);

  const fetchShows = useCallback(async (p: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await tmdb.tvPopular(p, selectedGenre ?? undefined);
      
      if (reset && res.results?.length) {
          setHeroShow(res.results[0]);
      }
      
      setShows((prev) => reset ? (res.results ?? []) : [...prev, ...(res.results ?? [])]);
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
    fetchShows(1, true);
  }, [selectedGenre, fetchShows]);

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchShows(page, false);
    }
  }, [page, fetchShows]);

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

  const handleGenreSelect = (id: number | null) => {
      if (id === null) {
          searchParams.delete("genre");
      } else {
          searchParams.set("genre", id.toString());
      }
      setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      
      {/* Dynamic Hero Spotlight */}
      <AnimatePresence mode="wait">
          {heroShow && !genreIdParam && (
              <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden"
              >
                  <img 
                    src={tmdb.imgUrl(heroShow.backdrop_path, "original")} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden sm:block" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 z-10">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="bg-primary px-3 py-1 rounded text-[10px] font-black uppercase italic tracking-widest text-white shadow-glow">Trending Series</div>
                          <span className="flex items-center gap-1.5 text-xs font-black text-white/60">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                              {heroShow.vote_average.toFixed(1)}
                          </span>
                      </div>
                      <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-6 max-w-4xl">
                          {heroShow.name}
                      </h2>
                      <div className="flex gap-4">
                        <Button asChild size="lg" className="h-14 rounded-2xl px-8 gap-3 text-sm font-black uppercase italic tracking-widest bg-primary hover:bg-primary/90">
                            <Link to={`/tv/${heroShow.id}`}>
                                <Play className="w-5 h-5 fill-current" />
                                Start Series
                            </Link>
                        </Button>
                      </div>
                  </div>
              </motion.section>
          )}
      </AnimatePresence>

      <div className={cn("max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8", !genreIdParam ? "mt-12" : "pt-[100px]")}>
        
        {/* Header & Filter System */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <Tv className="w-6 h-6 text-primary" />
                    <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 italic">Series Hub</h1>
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white italic uppercase tracking-tighter">
                    {selectedGenre ? MOOD_PILLS.find(p => p.id === selectedGenre)?.name : "Prime Selection"}
                </h2>
            </div>
          </div>

          {/* Quick-Filter Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            <button
                onClick={() => handleGenreSelect(null)}
                className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all shrink-0 border",
                    selectedGenre === null 
                        ? "bg-primary text-white border-primary shadow-glow" 
                        : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                )}
            >
                All Series
            </button>
            {MOOD_PILLS.map((g) => (
                <button
                    key={g.id}
                    onClick={() => handleGenreSelect(g.id)}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all shrink-0 border",
                        selectedGenre === g.id 
                            ? "bg-primary text-white border-primary shadow-glow" 
                            : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                    )}
                >
                    {g.name}
                </button>
            ))}
          </div>
        </header>

        {/* Main Series Grid */}
        <main>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 animate-shimmer relative overflow-hidden" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
              {shows.map((m) => (
                <MovieCard key={m.id} movie={m} type="tv" />
              ))}
            </div>
          )}

          {/* Load More Trigger */}
          <div ref={observerRef} className="py-20 flex flex-col items-center justify-center gap-4">
            {loadingMore && (
              <>
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Syncing Next Wave</span>
              </>
            )}
            {!loading && page >= totalPages && (
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">End of Library</span>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

function formatNumber(n: number) {
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return n;
}
