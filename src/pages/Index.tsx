import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clapperboard, Compass, Sparkles, TrendingUp } from "lucide-react";
import { tmdb, type Movie } from "@/lib/tmdb";
import { getRecentlyViewed, getContinueWatching, type ContinueItem } from "@/lib/storage";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContinueRow from "@/components/ContinueRow";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

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
  const [anime, setAnime] = useState<Movie[]>([]);
  const [marvel, setMarvel] = useState<Movie[]>([]);
  const [animated, setAnimated] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([tmdb.trending(), tmdb.popular(), tmdb.topRated(), tmdb.tvPopular(), tmdb.upcoming()])
      .then(([trendingData, popularData, topRatedData, tvData, upcomingData]) => {
        setTrending(trendingData?.results ?? []);
        setPopular(popularData?.results ?? []);
        setTopRated(topRatedData?.results ?? []);
        setTvShows(tvData?.results ?? []);
        setUpcoming(upcomingData?.results ?? []);
        setRecent(getRecentlyViewed());
        setContinueList(getContinueWatching());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    const timer = window.setTimeout(() => {
      Promise.allSettled([tmdb.animeTv(), tmdb.animeMovies(), tmdb.marvelMovies(), tmdb.marvelTv(), tmdb.animatedMovies(), tmdb.animatedTv()]).then(
        ([animeTv, animeMovies, marvelMovies, marvelTv, animatedMovies, animatedTv]) => {
          const results = <T,>(result: PromiseSettledResult<T>): Movie[] =>
            result.status === "fulfilled" ? ((result.value as { results?: Movie[] })?.results ?? []) : [];
          const tagTv = (items: Movie[]) => items.map((item) => ({ ...item, media_type: "tv" as const }));
          const tagMovie = (items: Movie[]) => items.map((item) => ({ ...item, media_type: "movie" as const }));
          setAnime([...tagTv(results(animeTv)), ...tagMovie(results(animeMovies))].slice(0, 40));
          setMarvel([...tagMovie(results(marvelMovies)), ...tagTv(results(marvelTv))].slice(0, 40));
          setAnimated([...tagMovie(results(animatedMovies)), ...tagTv(results(animatedTv))].slice(0, 40));
        }
      );
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedGenre === null) {
      setGenreResults([]);
      return;
    }
    setLoadingGenre(true);
    tmdb
      .popular(1, selectedGenre)
      .then((response) => setGenreResults(response.results ?? []))
      .catch(() => setGenreResults([]))
      .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  if (error) {
    return (
      <PageShell className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.28em] text-red-200/65">Signal lost</p>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-white">The archive is offline</h1>
          <p className="mt-3 text-sm leading-7 text-white/40">We could not reach the title index. Check your connection and try again.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-7 h-11 rounded-lg bg-white px-5 text-sm font-bold text-[#080a0f] transition-colors hover:bg-sky-100">Retry connection</button>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeroSkeleton />
        <div className="section-shell pb-28 pt-10">
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <PageShell className="min-h-screen bg-background pb-28">
      <HeroBanner movies={trending} />

      <div className="section-shell relative z-20 mt-4 sm:mt-6">
        <section className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-center md:justify-between" aria-labelledby="mood-heading">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <h2 id="mood-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Browse by mood
            </h2>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {[{ id: null as number | null, name: "All" }, ...MOOD_PILLS].map((mood) => (
              <button
                key={mood.name}
                type="button"
                onClick={() => setSelectedGenre(mood.id)}
                aria-pressed={selectedGenre === mood.id}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3.5 text-xs font-medium transition-all",
                  selectedGenre === mood.id
                    ? "bg-white text-[#06070a] shadow-sm font-semibold"
                    : "border border-white/[0.08] bg-white/[0.025] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                {mood.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="relative z-20">
        <AnimatePresence mode="wait">
          {selectedGenre !== null ? (
            <motion.div
              key="genre-results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="pt-2"
            >
              {loadingGenre ? (
                <div className="section-shell">
                  <RowSkeleton />
                </div>
              ) : (
                <ContentRow
                  eyebrow="SPOTLIGHT"
                  title={`${MOOD_PILLS.find((mood) => mood.id === selectedGenre)?.name} collection`}
                  description="Curated films and series matching your chosen atmosphere."
                  results={genreResults}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="home-rows"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              {continueList.length > 0 && <ContinueRow />}
              <ContentRow
                eyebrow="TRENDING"
                title="Trending this week"
                description="The titles setting the pace right now."
                results={trending}
              />
              <ContentRow
                eyebrow="POPULAR"
                title="Popular movies"
                description="What the room is watching."
                results={popular}
              />
              <ContentRow
                eyebrow="CRITICALLY ACCLAIMED"
                title="Top rated"
                description="The films that stay with you."
                results={topRated}
              />
              <ContentRow
                eyebrow="TELEVISION"
                title="Popular series"
                description="Stay for one more episode."
                results={tvShows}
                type="tv"
              />
              <ContentRow
                eyebrow="UPCOMING"
                title="Coming soon"
                description="Fresh stories on the horizon."
                results={upcoming}
              />
              {anime.length > 0 && (
                <ContentRow
                  eyebrow="ANIME"
                  title="Japanese animation"
                  description="Hand-picked and hand-drawn stories."
                  results={anime}
                />
              )}
              {marvel.length > 0 && (
                <ContentRow
                  eyebrow="MARVEL"
                  title="Marvel universe"
                  description="One connected cinematic mythology."
                  results={marvel}
                />
              )}
              {animated.length > 0 && (
                <ContentRow
                  eyebrow="ANIMATION"
                  title="Animated features"
                  description="Big feelings, beautifully animated."
                  results={animated}
                />
              )}
              {recent.length > 0 && (
                <ContentRow
                  eyebrow="RECENT"
                  title="Recently viewed"
                  description="Return to your last discoveries."
                  results={recent}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
