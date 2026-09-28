import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2, Play, Star, Tv } from "lucide-react";
import { imgUrl, tmdb, type Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import ContentRow from "@/components/ContentRow";
import PageShell from "@/components/PageShell";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MOOD_PILLS = [
  { id: 10759, name: "Action" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Sci-Fi" },
];

export default function TvShowsPage() {
  usePageTitle("Series");
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");
  const [shows, setShows] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<Movie[]>([]);
  const [heroShow, setHeroShow] = useState<Movie | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(genreIdParam ? Number(genreIdParam) : null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedGenre(genreIdParam ? Number(genreIdParam) : null);
  }, [genreIdParam]);

  useEffect(() => {
    tmdb.tvTrending().then((data) => setTrendingTv((data.results ?? []).slice(0, 10))).catch(() => setTrendingTv([]));
  }, []);

  const fetchShows = useCallback(async (nextPage: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const response = await tmdb.tvPopular(nextPage, selectedGenre ?? undefined);
      if (reset && response.results?.length) setHeroShow(response.results[0]);
      setShows((current) => (reset ? response.results ?? [] : [...current, ...(response.results ?? [])]));
      setTotalPages(response.total_pages ?? 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    setPage(1);
    void fetchShows(1, true);
  }, [fetchShows]);

  useEffect(() => {
    if (page > 1) void fetchShows(page);
  }, [fetchShows, page]);

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

  const selectGenre = (id: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (id === null) next.delete("genre");
    else next.set("genre", String(id));
    setSearchParams(next);
  };

  const activeGenre = MOOD_PILLS.find((genre) => genre.id === selectedGenre)?.name;

  return (
    <PageShell className="min-h-screen bg-background pb-32">
      <AnimatePresence mode="wait">
        {heroShow && !selectedGenre && (
          <motion.section
            key={heroShow.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative h-[64svh] min-h-[36rem] max-h-[48rem] overflow-hidden"
          >
            {heroShow.backdrop_path && <img src={imgUrl(heroShow.backdrop_path, "w1280")} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_22%]" loading="eager" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,10,0.96),rgba(5,6,10,0.62)_45%,rgba(5,6,10,0.2))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-black/25" />
            <div className="cinema-vignette absolute inset-0" />
            <div className="section-shell relative z-10 flex h-full items-end pb-14 sm:pb-20 lg:pb-24">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="max-w-2xl">
                <div className="mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40">
                  <span className="text-primary">Series spotlight</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="inline-flex items-center gap-1.5 text-amber-200/75"><Star className="h-3 w-3 fill-current" />{heroShow.vote_average.toFixed(1)}</span>
                </div>
                <h1 className="text-balance text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">{heroShow.name ?? heroShow.title}</h1>
                <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-white/48">{heroShow.overview}</p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link to={`/tv/${heroShow.id}`} className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-5 text-sm font-bold text-[#080a0f] transition-colors hover:bg-sky-100"><Play className="h-[18px] w-[18px] fill-current" />View series</Link>
                  <Link to={`/tv/${heroShow.id}`} className="group inline-flex items-center gap-2 text-xs font-semibold text-white/55 transition-colors hover:text-white">Explore episodes<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                </div>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div className={cn("section-shell", genreIdParam ? "pt-24 sm:pt-28 md:pt-32" : "relative z-20 -mt-6 sm:-mt-8")}>
        <header className="mb-7 border-b border-white/[0.07] pb-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.28em] text-primary"><Tv className="h-3.5 w-3.5" />Series archive</p>
              <h1 className="text-3xl font-black leading-none tracking-[-0.055em] text-white sm:text-5xl">{activeGenre ?? "TV shows"}</h1>
            </div>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25 sm:block">Binge responsibly</span>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {[{ id: null as number | null, name: "All series" }, ...MOOD_PILLS].map((genre) => (
              <button
                key={genre.name}
                type="button"
                onClick={() => selectGenre(genre.id)}
                aria-pressed={selectedGenre === genre.id}
                className={cn(
                  "h-9 shrink-0 rounded-lg border px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                  selectedGenre === genre.id ? "border-primary/40 bg-primary text-[#071019]" : "border-white/[0.08] bg-white/[0.025] text-white/42 hover:bg-white/[0.06] hover:text-white/80"
                )}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </header>

        {!selectedGenre && trendingTv.length > 0 && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
            <ContentRow title="Trending series" description="The shows everyone is talking about." results={trendingTv} type="tv" />
          </div>
        )}

        <main aria-label="Series results">
          {loading ? (
            <GridSkeleton count={12} />
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {shows.map((show) => <MovieCard key={show.id} movie={{ ...show, media_type: "tv" }} type="tv" />)}
            </motion.div>
          )}
          <div ref={observerRef} className="flex min-h-28 items-center justify-center py-10">
            {loadingMore ? (
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/28"><Loader2 className="h-4 w-4 animate-spin text-primary" />Loading more</div>
            ) : !loading && page >= totalPages && shows.length > 0 ? (
              <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/18">End of collection</span>
            ) : null}
          </div>
        </main>
      </div>
    </PageShell>
  );
}
