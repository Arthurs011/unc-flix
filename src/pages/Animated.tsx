import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Palette, Play, Sparkles, Star } from "lucide-react";
import { tmdb, getTitle, getYear, imgUrl, type Movie } from "@/lib/tmdb";
import PageShell from "@/components/PageShell";
import ContentRow from "@/components/ContentRow";
import MovieCard from "@/components/MovieCard";
import { RowSkeleton } from "@/components/LoadingSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ANIMATED_GENRES = [
  { id: null as number | null, name: "All" },
  { id: 10751, name: "Family" },
  { id: 12, name: "Adventure" },
  { id: 35, name: "Comedy" },
  { id: 14, name: "Fantasy" },
  { id: 878, name: "Sci-Fi" },
  { id: 16, name: "Animation" },
];

export default function AnimatedHub() {
  usePageTitle("Animated · UNCFLIX");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);

  useEffect(() => {
    Promise.allSettled([tmdb.animatedMovies(), tmdb.animatedTv()])
      .then(([movieResult, tvResult]) => {
        const getResults = <T,>(result: PromiseSettledResult<T>): Movie[] => result.status === "fulfilled" ? ((result.value as { results?: Movie[] })?.results ?? []) : [];
        setMovies(getResults(movieResult));
        setShows(getResults(tvResult).map((item) => ({ ...item, media_type: "tv" as const })));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGenre === null) {
      setGenreResults([]);
      return;
    }
    setLoadingGenre(true);
    tmdb.animatedMovies(1, selectedGenre)
      .then((response) => setGenreResults((response.results ?? []).map((item) => ({ ...item, media_type: "movie" as const }))))
      .catch(() => setGenreResults([]))
      .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  const featured = movies[0] ?? null;

  if (loading) {
    return <div className="min-h-screen bg-background"><div className="h-[52svh] animate-pulse bg-white/[0.035]" /><div className="section-shell pb-28 pt-10"><RowSkeleton /><RowSkeleton /></div></div>;
  }

  return (
    <PageShell className="min-h-screen bg-background pb-28">
      {featured && (
        <section className="relative h-[54svh] min-h-[34rem] max-h-[46rem] overflow-hidden">
          {featured.backdrop_path && <img src={imgUrl(featured.backdrop_path, "w1280")} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_22%]" loading="eager" />}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,10,0.97),rgba(5,6,10,0.62)_48%,rgba(5,6,10,0.18))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-black/25" />
          <div className="cinema-vignette absolute inset-0" />
          <div className="section-shell relative z-10 flex h-full items-end pb-14 sm:pb-20 lg:pb-24">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40"><span className="text-teal-200/80">Animation spotlight</span><span className="h-1 w-1 rounded-full bg-white/20" /><span className="inline-flex items-center gap-1.5 text-amber-200/75"><Star className="h-3 w-3 fill-current" />{featured.vote_average.toFixed(1)}</span></div>
              <h1 className="text-balance text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">{getTitle(featured)}</h1>
              <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-white/50">{featured.overview}</p>
              <Link to={`/movie/${featured.id}`} className="mt-7 inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-5 text-sm font-bold text-[#080a0f] transition-colors hover:bg-teal-100"><Play className="h-[18px] w-[18px] fill-current" />Explore film</Link>
            </motion.div>
          </div>
        </section>
      )}

      <div className="section-shell relative z-20 -mt-5 sm:-mt-8">
        <div className="flex flex-col gap-4 border-y border-white/[0.07] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-200/20 bg-teal-200/[0.06] text-teal-200"><Palette className="h-4 w-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.24em] text-teal-200/75">The animated archive</p><p className="mt-1 text-sm font-semibold text-white/78">Every frame has a feeling</p></div></div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {ANIMATED_GENRES.map((genre) => <button key={genre.name} type="button" onClick={() => setSelectedGenre(genre.id)} aria-pressed={selectedGenre === genre.id} className={cn("h-9 shrink-0 rounded-lg border px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors", selectedGenre === genre.id ? "border-teal-200/35 bg-teal-200 text-[#061413]" : "border-white/[0.08] bg-white/[0.025] text-white/42 hover:bg-white/[0.06] hover:text-white/80")}>{genre.name}</button>)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedGenre !== null ? (
            <motion.div key="animated-filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="pt-8">
              {loadingGenre ? <RowSkeleton /> : <div className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12"><ContentRow title={`${ANIMATED_GENRES.find((genre) => genre.id === selectedGenre)?.name} stories`} description="A focused collection from the animated archive." results={genreResults} type="movie" /></div>}
            </motion.div>
          ) : (
            <motion.div key="animated-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <section className="pt-8" aria-labelledby="animated-movies-heading">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-teal-200/70">Imagination, animated</p>
                    <h2 id="animated-movies-heading" className="text-xl font-bold tracking-tight text-white sm:text-2xl">Animated movies</h2>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Big feelings</span>
                </div>
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {movies.filter((item) => item.poster_path).slice(0, 18).map((item) => <MovieCard key={item.id} movie={item} type="movie" />)}
                </div>
              </section>
              <div className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
                <ContentRow title="Animated series" description="Long stories, one frame at a time." results={shows} type="tv" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/22"><Sparkles className="h-3.5 w-3.5 text-teal-200/70" />From hand-drawn to fully imagined</div>
      </div>
    </PageShell>
  );
}
