import { useEffect, useState } from "react";
import { Movie, tmdb, Genre } from "@/lib/tmdb";
import { getRecentlyViewed, getContinueWatching, ContinueItem } from "@/lib/storage";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContinueRow from "@/components/ContinueRow";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerFast } from "@/lib/motion";

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
  usePageTitle();
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
      .then((res) => setGenreResults(res.results ?? []))
      .catch(() => setGenreResults([]))
      .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Something went wrong</h2>
          <p className="text-muted-foreground mb-8">We couldn't load the content. Please check your internet connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold shadow-glow hover:scale-105 active:scale-95 transition-transform"
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-32">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <PageShell className="bg-background min-h-screen">
      <HeroBanner movies={trending} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-30 pb-32 sm:pb-28">
        {/* Mood pills */}
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="show"
          className="flex gap-2 overflow-x-auto scrollbar-hide py-4 mb-6"
        >
          {[{ id: null as number | null, name: "Everything" }, ...MOOD_PILLS].map((g) => (
            <motion.button
              key={g.name}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGenre(g.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shrink-0 ring-1",
                selectedGenre === g.id
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-transparent shadow-glow"
                  : "bg-white/[0.04] text-white/45 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white"
              )}
            >
              {g.name}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedGenre !== null ? (
            <motion.div
              key="genre-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
            >
              {loadingGenre ? (
                <RowSkeleton />
              ) : (
                <ContentRow
                  title={`${MOOD_PILLS.find((p) => p.id === selectedGenre)?.name} Spotlight`}
                  kicker="Curated for you"
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
              transition={{ duration: 0.3 }}
            >
              {continueList.length > 0 && <ContinueRow />}

              <ContentRow title="Trending This Week" kicker="Top 10" movies={trending} showRank />
              <ContentRow title="Popular Movies" kicker="Everyone is watching" movies={popular} />
              <ContentRow title="Top Rated Movies" kicker="Critically acclaimed" movies={topRated} />
              <ContentRow title="Popular TV Shows" kicker="Binge-worthy" movies={tvShows} type="tv" />
              <ContentRow title="Coming Soon" kicker="Fresh releases" movies={upcoming} />

              {recent.length > 0 && <ContentRow title="Recently Viewed" movies={recent} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
