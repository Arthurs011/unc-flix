import { useEffect, useState } from "react";
import { Movie, tmdb, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import PageShell from "@/components/PageShell";
import ContentRow from "@/components/ContentRow";
import { usePageTitle } from "@/hooks/usePageTitle";
import { RowSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerFast } from "@/lib/motion";
import { Link } from "react-router-dom";
import { Play, ChevronLeft, ChevronRight, Star } from "lucide-react";

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
  const [marvelTv, setMarvelTv] = useState<Movie[]>([]);
  const [marvelMovies, setMarvelMovies] = useState<Movie[]>([]);
  const [animatedTv, setAnimatedTv] = useState<Movie[]>([]);
  const [animatedMovies, setAnimatedMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      tmdb.animeTv(),
      tmdb.animeMovies(),
      tmdb.marvelTv(),
      tmdb.marvelMovies(),
      tmdb.animatedTv(),
      tmdb.animatedMovies(),
    ])
      .then(([aTv, aM, mTv, mM, anTv, anM]) => {
        const ok = <T,>(r: PromiseSettledResult<T>): T[] =>
          r.status === "fulfilled" ? (r.value as { results?: Movie[] })?.results ?? [] : [];
        setAnimeTv(ok(aTv));
        setAnimeMovies(ok(aM));
        setMarvelTv(ok(mTv));
        setMarvelMovies(ok(mM));
        setAnimatedTv(ok(anTv));
        setAnimatedMovies(ok(anM));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGenre === null) { setGenreResults([]); return; }
    setLoadingGenre(true);
    tmdb.animeTv(1)
      .then((res) => {
        const filtered = (res.results ?? []).filter((m) =>
          m.genre_ids?.includes(selectedGenre!)
        );
        setGenreResults(filtered);
      })
      .catch(() => setGenreResults([]))
      .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  const featured = animeTv[0] ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-[50vh] bg-white/[0.03] animate-pulse" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-32">
          <RowSkeleton /><RowSkeleton /><RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <PageShell className="bg-background min-h-screen">
      {/* Compact hero — anime spotlight */}
      {featured && (
        <div className="relative w-full h-[45vh] sm:h-[55vh] overflow-hidden">
          <img
            src={imgUrl(featured.backdrop_path, "w1280")}
            alt={getTitle(featured)}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent hidden sm:block" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 z-10 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-glow-sm">
                  Anime Spotlight
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-white/80">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {featured.vote_average.toFixed(1)}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/25" />
                <span className="text-xs font-semibold tracking-wider text-white/50 uppercase">
                  {getYear(featured)}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tighter leading-[0.95] drop-shadow-2xl">
                {getTitle(featured)}
              </h1>
              <p className="text-sm sm:text-base text-white/60 max-w-xl mb-6 line-clamp-3 leading-relaxed">
                {featured.overview}
              </p>
              <Link
                to={`/watch/tv/${featured.id}/1/1`}
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm shadow-glow-lg hover:shadow-glow hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-30 pb-32 sm:pb-28">
        {/* Genre filter chips */}
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="show"
          className="flex gap-2 overflow-x-auto scrollbar-hide py-4 mb-6"
        >
          {ANIME_GENRES.map((g) => (
            <motion.button
              key={g.name}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGenre(g.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shrink-0 ring-1",
                selectedGenre === g.id
                  ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white ring-transparent shadow-glow"
                  : "bg-background/70 backdrop-blur-md text-white/45 ring-white/[0.08] hover:bg-white/[0.12] hover:text-white"
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
                  title={`${ANIME_GENRES.find((g) => g.id === selectedGenre)?.name} Anime`}
                  kicker="Filtered results"
                  movies={genreResults}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all-sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ContentRow
                title="Top Anime Series"
                kicker="Trending now"
                movies={animeTv}
                type="tv"
              />
              <ContentRow
                title="Anime Movies"
                kicker="Theatrical releases"
                movies={animeMovies}
              />

              {/* Marvel block */}
              <div className="mt-6 mb-4">
                <div className="flex items-end justify-between mb-5 px-4 sm:px-0">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 mb-1.5">
                      Marvel Studios
                    </p>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Marvel Universe
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {[...marvelMovies.slice(0, 6), ...marvelTv.slice(0, 6)]
                    .filter((m) => m.poster_path)
                    .slice(0, 12)
                    .map((m, i) => (
                      <Link
                        key={`${m.id}-${i}`}
                        to={m.media_type === "tv" ? `/tv/${m.id}` : `/movie/${m.id}`}
                        className="group relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-white/[0.08] bg-white/[0.03] active:scale-[0.97] transition-transform"
                      >
                        <img
                          src={imgUrl(m.poster_path, "w342")}
                          alt={getTitle(m)}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs font-bold text-white truncate">{getTitle(m)}</p>
                          <p className="text-[10px] text-white/50 mt-0.5">
                            {m.media_type === "tv" ? "Series" : "Movie"} · {getYear(m)}
                          </p>
                        </div>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-[8px] font-bold uppercase tracking-wider text-white">
                          Marvel
                        </span>
                      </Link>
                    ))}
                </div>
              </div>

              <ContentRow
                title="Animated Films"
                kicker="From Pixar, Disney & more"
                movies={animatedMovies.filter((m) => m.media_type !== "tv").slice(0, 25)}
              />
              <ContentRow
                title="Animated Series"
                kicker="Cartoon & anime shows"
                movies={animatedTv}
                type="tv"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
