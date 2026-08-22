import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, ArrowLeft, X, Film, Clock } from "lucide-react";
import { tmdb, Movie, Review, MovieDetails as MD, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist, addRecentlyViewed } from "@/lib/storage";
import PageShell from "@/components/PageShell";
import ScrollProgress from "@/components/ScrollProgress";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import ContentRow from "@/components/ContentRow";
import ReviewsSection from "@/components/ReviewsSection";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { EASE, springSnappy, fadeUp, staggerFast, viewportOnce } from "@/lib/motion";

export default function TvDetailsPage() {
  const { id } = useParams();
  const [show, setShow] = useState<MD | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWL, setInWL] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: backdropRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tmdb.tvDetails(Number(id))
      .then((d) => {
        setShow(d);
        setInWL(isInWatchlist(d.id));
        addRecentlyViewed({ ...d, media_type: "tv" });
        const videos = d.videos?.results ?? [];
        const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer")
          ?? videos.find((v) => v.site === "YouTube");
        setTrailerKey(trailer?.key ?? null);
      })
      .catch(() => setShow(null))
      .finally(() => setLoading(false));
    tmdb.tvRecommendations(Number(id))
      .then((d) => setSimilar((d.results ?? []).filter((m) => m.poster_path)))
      .catch(() => setSimilar([]));
    tmdb.tvReviews(Number(id))
      .then((d) => setReviews(d.results ?? []))
      .catch(() => setReviews([]));
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!show) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-3">Show not found</h2>
        <Link to="/" className="text-primary font-bold uppercase tracking-widest text-xs hover:underline">Go Home</Link>
      </div>
    </div>
  );

  const cast = show.credits?.cast?.slice(0, 15) ?? [];
  const seasons = show.seasons?.filter((s) => s.season_number > 0) ?? [];

  return (
    <PageShell className="min-h-screen pb-32">
      <ScrollProgress />
      {/* Trailer modal */}
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={springSnappy}
              className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden ring-1 ring-white/15 shadow-card-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              />
              <button
                onClick={() => setShowTrailer(false)}
                aria-label="Close trailer"
                className="absolute -top-12 right-0 p-2 rounded-full glass text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <div ref={backdropRef} className="relative h-[52vh] sm:h-[62vh] overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 scale-110">
          <img src={imgUrl(show.backdrop_path, "w1280")} alt="" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <Link
          to="/"
          aria-label="Back to home"
          className="absolute top-20 left-4 sm:left-8 p-3 rounded-full glass ring-1 ring-white/10 text-white hover:bg-white/10 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-44 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex-shrink-0 w-44 sm:w-60 mx-auto sm:mx-0"
          >
            <img
              src={imgUrl(show.poster_path, "w500")}
              alt={getTitle(show)}
              className="w-full rounded-3xl shadow-card-lg ring-1 ring-white/10"
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
            className="flex-1 pt-2 text-center sm:text-left"
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2"
            >
              Series Hub
            </motion.p>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95] mb-5"
            >
              {getTitle(show)}
            </motion.h1>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-white/45 mb-6"
            >
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1.5 text-white">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
              {getYear(show) && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{getYear(show)}</span>
                </>
              )}
              {show.number_of_seasons ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}
                  </span>
                </>
              ) : null}
              {show.genres?.slice(0, 3).map((g) => (
                <span key={g.id} className="rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
                  {g.name}
                </span>
              ))}
            </motion.div>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="text-white/60 leading-relaxed mb-8 max-w-2xl text-sm sm:text-base mx-auto sm:mx-0"
            >
              {show.overview}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-wrap justify-center sm:justify-start items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springSnappy}
                className="flex items-center gap-2.5 h-13 pl-7 pr-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow-lg"
              >
                <Link to={`/watch/tv/${show.id}/1/1`} className="flex items-center gap-2.5">
                  <Play className="w-5 h-5 fill-current" />
                  Play S1 E1
                </Link>
              </motion.button>

              {trailerKey && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springSnappy}
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2.5 h-13 px-7 rounded-full glass ring-1 ring-white/15 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  <Film className="w-5 h-5" />
                  Trailer
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springSnappy}
                onClick={() => setInWL(toggleWatchlist(show))}
                aria-label={inWL ? "Remove from watchlist" : "Add to watchlist"}
                className="w-13 h-13 rounded-full glass ring-1 ring-white/15 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                {inWL ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Seasons */}
        {seasons.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-16"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1.5">Browse</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-6">Seasons</h2>
            <motion.div variants={staggerFast} initial="hidden" whileInView="show" viewport={viewportOnce} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {seasons.map((s) => (
                <motion.div key={s.season_number} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
                  <Link
                    to={`/watch/tv/${show.id}/${s.season_number}/1`}
                    className="group flex items-center justify-between rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.07] hover:ring-primary/40 hover:bg-white/[0.05] px-5 py-4 transition-all"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{s.name}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35 mt-0.5">
                        {s.episode_count} Episode{s.episode_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Play className="w-4 h-4 text-white/25 group-hover:text-primary transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-16 mb-8"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1.5">Starring</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-6">Top Cast</h2>
            <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">
              {cast.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-24 text-center group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-card mb-3 ring-1 ring-white/[0.08] group-hover:ring-primary/50 transition-all duration-300">
                    <img
                      src={imgUrl(c.profile_path, "w185")}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <p className="text-[11px] font-bold text-white line-clamp-1">{c.name}</p>
                  <p className="text-[9px] font-medium uppercase tracking-wider text-white/35 line-clamp-1 mt-0.5">{c.character}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        <ReviewsSection reviews={reviews} />

        {similar.length > 0 && (
          <section className="mb-8">
            <ContentRow title="More Like This" kicker="If you liked this" movies={similar} type="tv" />
          </section>
        )}
      </div>
    </PageShell>
  );
}
