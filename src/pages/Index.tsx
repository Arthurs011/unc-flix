import { useEffect, useState } from "react";
import { Movie, tmdb } from "@/lib/tmdb";
import { getRecentlyViewed } from "@/lib/storage";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContinueRow from "@/components/ContinueRow";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function Index() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [recent, setRecent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      tmdb.trending(),
      tmdb.topRated(),
      tmdb.popular(),
      tmdb.tvPopular(),
      tmdb.upcoming(),
    ])
      .then(([t, tr, p, tv, u]) => {
        setTrending(t.results);
        setTopRated(tr.results);
        setPopular(p.results);
        setTvShows(tv.results);
        setUpcoming(u.results);
        setRecent(getRecentlyViewed());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Failed to load content. Please try again.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-primary-foreground rounded-full">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-[120px] md:pt-16">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
      transition={{ duration: 0.5 }}
    >
      <HeroBanner movies={trending} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <ContinueRow />
        <ContentRow title="Trending This Week" movies={trending} showRank />
        <ContentRow title="Top Rated" movies={topRated} />
        <ContentRow title="Popular TV Shows" movies={tvShows} type="tv" />
        <ContentRow title="Upcoming Movies" movies={upcoming} />
        <ContentRow title="Popular Movies" movies={popular} />
        {recent.length > 0 && <ContentRow title="Recently Viewed" movies={recent} />}
      </div>
    </motion.div>
  );
}
