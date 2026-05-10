import { useEffect, useState } from "react";
import { Movie, tmdb } from "@/lib/tmdb";
import { getRecentlyViewed, getContinueWatching } from "@/lib/storage";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContinueRow from "@/components/ContinueRow";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function Index() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [recent, setRecent] = useState<Movie[]>([]);
  const [continueList, setContinueList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-32 sm:pb-24 space-y-12">
        {continueList.length > 0 && <ContinueRow />}
        
        <ContentRow title="Trending Movies" movies={trending} showRank />
        <ContentRow title="Popular Movies" movies={popular} />
        <ContentRow title="Top Rated Movies" movies={topRated} />
        <ContentRow title="Popular TV Shows" movies={tvShows} type="tv" />
        <ContentRow title="Upcoming Movies" movies={upcoming} />
        
        {recent.length > 0 && <ContentRow title="Recently Viewed" movies={recent} />}
      </div>
    </motion.div>
  );
}
