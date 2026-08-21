import { useEffect, useState, useCallback } from "react";
import { Movie, tmdb, Genre } from "@/lib/tmdb";
import { getRecentlyViewed, getContinueWatching, ContinueItem } from "@/lib/storage";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContinueRow from "@/components/ContinueRow";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const MOOD_PILLS = [
  { id: 28, name: "Action" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export default function Index() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [recent, setRecent] = useState<Movie[]>([]);
  const [continueList, setContinueList] = useState<ContinueItem[]>([]);
  
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<Movie[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      tmdb.trending(),
      tmdb.popular(),
      tmdb.topRated(),
      tmdb.tvPopular(),
      tmdb.upcoming(),
    ])
      .then(([t, p, tr, tv, u]) => {
        setTrending(t?.results ?? []);
        setPopular(p?.results ?? []);
        setTopRated(tr?.results ?? []);
        setTvShows(tv?.results ?? []);
        setUpcoming(u?.results ?? []);
        setRecent(getRecentlyViewed() || []);
        setContinueList(getContinueWatching() || []);
      })
      .catch((err) => {
        console.error("TMDB Fetch Error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGenre === null) {
        setGenreResults([]);
        return;
    }
    setLoadingGenre(true);
    tmdb.popular(1, selectedGenre)
        .then(res => setGenreResults(res.results ?? []))
        .catch(() => setGenreResults([]))
        .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-8">We couldn't load the content. Please check your internet connection.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-black uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12 pb-32">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-background min-h-screen"
    >
      <HeroBanner movies={trending} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-30 pb-32 sm:pb-24">
        
        {/* Genre Quick-Filters (Mood Pills) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 mb-8">
            <button
                onClick={() => setSelectedGenre(null)}
                className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all shrink-0 border",
                    selectedGenre === null 
                        ? "bg-primary text-white border-primary shadow-glow" 
                        : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
                )}
            >
                Everything
            </button>
            {MOOD_PILLS.map((g) => (
                <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-[10px] font-black uppercase italic tracking-widest transition-all shrink-0 border",
                        selectedGenre === g.id 
                            ? "bg-primary text-white border-primary shadow-glow" 
                            : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
                    )}
                >
                    {g.name}
                </button>
            ))}
        </div>

        <AnimatePresence mode="wait">
            {selectedGenre !== null ? (
                <motion.div
                    key="genre-results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    {loadingGenre ? (
                        <RowSkeleton />
                    ) : (
                        <ContentRow 
                            title={`${MOOD_PILLS.find(p => p.id === selectedGenre)?.name} Spotlight`} 
                            movies={genreResults} 
                        />
                    )}
                </motion.div>
            ) : (
                <motion.div
                    key="standard-home"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-12"
                >
                    {continueList.length > 0 && <ContinueRow />}
                    
                    <ContentRow title="Trending Movies" movies={trending} showRank />
                    <ContentRow title="Popular Movies" movies={popular} />
                    <ContentRow title="Top Rated Movies" movies={topRated} />
                    <ContentRow title="Popular TV Shows" movies={tvShows} type="tv" />
                    <ContentRow title="Upcoming Movies" movies={upcoming} />
                    
                    {recent.length > 0 && <ContentRow title="Recently Viewed" movies={recent} />}
                </motion.div>
            )}
        </AnimatePresence>
        
      </div>
    </motion.div>
  );
}
