import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Compass, Play, Sparkles, Star } from "lucide-react";
import { tmdb, getTitle, getYear, imgUrl, type Movie } from "@/lib/tmdb";
import PageShell from "@/components/PageShell";
import ContentRow from "@/components/ContentRow";
import { RowSkeleton } from "@/components/LoadingSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ANIME_GENRES = [
  { id: null as number | null, name: "All" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 878, name: "Sci-Fi" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
];

export default function AnimeHub() {
  usePageTitle("Anime · UNCFLIX");
  const [animeTv, setAnimeTv] = useState<Movie[]>([]);
  const [animeMovies, setAnimeMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);

  useEffect(() => {
    Promise.allSettled([tmdb.animeTv(), tmdb.animeMovies()])
      .then(([tvResult, movieResult]) => {
        const getResults = <T,>(result: PromiseSettledResult<T>): Movie[] => result.status === "fulfilled" ? ((result.value as { results?: Movie[] })?.results ?? []) : [];
        setAnimeTv(getResults(tvResult).map((item) => ({ ...item, media_type: "tv" as const })));
        setAnimeMovies(getResults(movieResult).map((item) => ({ ...item, media_type: "movie" as const })));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGenre === null) {
      setGenreResults([]);
      return;
    }
    setLoadingGenre(true);
    tmdb.animeTv(1, selectedGenre)
      .then((response) => setGenreResults((response.results ?? []).map((item) => ({ ...item, media_type: "tv" as const }))))
      .catch(() => setGenreResults([]))
      .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  const featured = animeTv[0] ?? null;

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
              <div className="mb-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.24em] text-white/40"><span className="text-[#f0a4c8]">Anime spotlight</span><span className="h-1 w-1 rounded-full bg-white/20" /><span className="inline-flex items-center gap-1.5 text-amber-200/75"><Star className="h-3 w-3 fill-current" />{featured.vote_average.toFixed(1)}</span></div>
              <h1 className="text-balance text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">{getTitle(featured)}</h1>
              <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-white/50">{featured.overview}</p>
              <Link to={`/tv/${featured.id}`} className="mt-7 inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-5 text-sm font-bold text-[#080a0f] transition-colors hover:bg-[#f0a4c8]"><Play className="h-[18px] w-[18px] fill-current" />Explore series</Link>
            </motion.div>
          </div>
        </section>
      )}

      <div className="section-shell relative z-20 -mt-5 sm:-mt-8">
        <div className="flex flex-col gap-4 border-y border-white/[0.07] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#f0a4c8]/20 bg-[#f0a4c8]/[0.07] text-[#f0a4c8]"><Sparkles className="h-4 w-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#f0a4c8]">Animation archive</p><p className="mt-1 text-sm font-semibold text-white/78">Stories beyond the frame</p></div></div>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {ANIME_GENRES.map((genre) => <button key={genre.name} type="button" onClick={() => setSelectedGenre(genre.id)} aria-pressed={selectedGenre === genre.id} className={cn("h-9 shrink-0 rounded-lg border px-3.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors", selectedGenre === genre.id ? "border-[#f0a4c8]/40 bg-[#f0a4c8] text-[#1b0d17]" : "border-white/[0.08] bg-white/[0.025] text-white/42 hover:bg-white/[0.06] hover:text-white/80")}>{genre.name}</button>)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedGenre !== null ? (
            <motion.div key="anime-filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="pt-8">
              {loadingGenre ? <RowSkeleton /> : <div className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12"><ContentRow title={`${ANIME_GENRES.find((genre) => genre.id === selectedGenre)?.name} anime`} description="A focused shelf from the anime archive." results={genreResults} type="tv" /></div>}
            </motion.div>
          ) : (
            <motion.div key="anime-all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="-mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12">
              <ContentRow title="Series in motion" description="Long-form stories with a world of their own." results={animeTv} type="tv" />
              <ContentRow title="Anime films" description="One reel, fully committed." results={animeMovies} type="movie" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/22"><Compass className="h-3.5 w-3.5 text-[#f0a4c8]" />Curated from Japanese animation</div>
      </div>
    </PageShell>
  );
}
