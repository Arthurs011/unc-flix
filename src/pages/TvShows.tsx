import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Movie, tmdb, imgUrl } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import ContentRow from "@/components/ContentRow";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerFast } from "@/lib/motion";
import { Star, Play, Tv, Loader2 } from "lucide-react";

const MOOD_PILLS = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
];

export default function TvShowsPage() {
  usePageTitle("Series");
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");

  const [shows, setShows] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<Movie[]>([]);
  const [heroShow, setHeroShow] = useState<Movie | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    genreIdParam ? Number(genreIdParam) : null
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedGenre(genreIdParam ? Number(genreIdParam) : null);
  }, [genreIdParam]);

  useEffect(() => {
    tmdb.tvTrending()
      .then((d) => setTrendingTv((d.results ?? []).slice(0, 10)))
      .catch(() => setTrendingTv([]));
  }, []);

  const fetchShows = useCallback(async (p: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await tmdb.tvPopular(p, selectedGenre ?? undefined);

      if (reset && res.results?.length) {
        setHeroShow(res.results[0]);
      }

      setShows((prev) => (reset ? res.results ?? [] : [...prev, ...(res.results ?? [])]));
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
    fetchShows(1, true);
  }, [selectedGenre, fetchShows]);

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
    <PageShell className="min-h-screen bg-background pb-32">
      {/* Hero spotlight */}
      <AnimatePresence mode="wait">
        {heroShow && !genreIdParam && (
          <motion.section
            key={heroShow.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-[62vh] sm:h-[70vh] overflow-hidden"
          >
            <motion.img
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "linear" }}
              src={imgUrl(heroShow.backdrop_path, "w1280")}
              className="absolute inset-0 w-full h-full object-cover"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden sm:block" />

            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
              className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 z-10 max-w-7xl mx-auto"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-3 mb-4"
              >
                <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-glow-sm">
                  Trending Series
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {heroShow.vote_average.toFixed(1)}
                </span>
              </motion.div>

              <motion.h2
                variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0 } }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] mb-7 max-w-3xl"
              >
                {heroShow.name}
              </motion.h2>

              <motion.div variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2.5 h-13 pl-7 pr-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow-lg"
                >
                  <Link to={`/tv/${heroShow.id}`} className="flex items-center gap-2.5">
                    <Play className="w-5 h-5 fill-current" />
                    Start Series
                  </Link>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className={cn("max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8", genreIdParam ? "pt-28 md:pt-32" : "-mt-4 relative z-10")}>
        <motion.header
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
            <Tv className="w-3.5 h-3.5" />
            Series Hub
          </p>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none mb-8">
            {selectedGenre ? MOOD_PILLS.find((p) => p.id === selectedGenre)?.name ?? "Series" : "TV Shows"}
          </h1>

          {/* Genre pills */}
          <motion.div
            variants={staggerFast}
            initial="hidden"
            animate="show"
            className="flex gap-2 overflow-x-auto scrollbar-hide py-1"
          >
            {[{ id: null as number | null, name: "All Series" }, ...MOOD_PILLS].map((g) => (
              <motion.button
                key={g.name}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenreSelect(g.id)}
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
        </motion.header>

        {!selectedGenre && trendingTv.length > 0 && (
          <ContentRow
            title="Trending Series This Week"
            kicker="Top 10 on TV"
            movies={trendingTv}
            type="tv"
            showRank
            className="mb-12"
          />
        )}

        <main>
          {loading ? (
            <GridSkeleton count={12} />
          ) : (
            <motion.div
              key={selectedGenre ?? "all"}
              variants={staggerFast}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            >
              {shows.map((m) => (
                <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                  <MovieCard movie={m} type="tv" />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div ref={observerRef} className="py-16 flex flex-col items-center justify-center gap-3">
            {loadingMore && (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/25">Loading more</span>
              </>
            )}
            {!loading && page >= totalPages && (
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/20">End of library</span>
            )}
          </div>
        </main>
      </div>
    </PageShell>
  );
}
