import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, Check, Clock, Film, Play, Plus, Share2, Star, X } from "lucide-react";
import { tmdb, type Movie, type MovieDetails as MD, type Review, getTitle, getYear, imgUrl } from "@/lib/tmdb";
import { addRecentlyViewed, isInWatchlist, toggleWatchlist } from "@/lib/storage";
import PageShell from "@/components/PageShell";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import ContentRow from "@/components/ContentRow";
import ReviewsSection from "@/components/ReviewsSection";
import { EASE, fadeUp, springSnappy, viewportOnce } from "@/lib/motion";

export default function TvDetailsPage() {
  const { id } = useParams();
  const [show, setShow] = useState<MD | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWL, setInWL] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [copied, setCopied] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: backdropRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tmdb.tvDetails(Number(id)).then((data) => {
      setShow(data);
      setInWL(isInWatchlist(data.id, "tv"));
      addRecentlyViewed({ ...data, media_type: "tv" });
      const videos = data.videos?.results ?? [];
      const trailer = videos.find((video) => video.site === "YouTube" && video.type === "Trailer") ?? videos.find((video) => video.site === "YouTube");
      setTrailerKey(trailer?.key ?? null);
    }).catch(() => setShow(null)).finally(() => setLoading(false));
    tmdb.tvRecommendations(Number(id)).then((data) => setSimilar((data.results ?? []).filter((item) => item.poster_path))).catch(() => setSimilar([]));
    tmdb.tvReviews(Number(id)).then((data) => setReviews(data.results ?? [])).catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (!showTrailer) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setShowTrailer(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showTrailer]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!show) {
    return (
      <PageShell className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Series unavailable</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">Series not found</h1>
          <Link to="/tv" className="mt-5 inline-flex h-10 items-center rounded-lg bg-white px-5 text-sm font-semibold text-[#06070a]">
            Back to series
          </Link>
        </div>
      </PageShell>
    );
  }

  const cast = show.credits?.cast?.slice(0, 15) ?? [];
  const seasons = show.seasons?.filter((season) => season.season_number > 0) ?? [];
  const year = getYear(show);

  return (
    <PageShell className="min-h-screen bg-background pb-28">
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Trailer" onClick={() => setShowTrailer(false)}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={springSnappy} className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-white/15 bg-black shadow-cinema" onClick={(event) => event.stopPropagation()}>
              <iframe src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} title="Trailer" allow="autoplay; encrypted-media" allowFullScreen className="h-full w-full" />
              <button type="button" onClick={() => setShowTrailer(false)} aria-label="Close trailer" className="tap-target absolute -top-12 right-0 flex items-center justify-center rounded-lg text-white/70 hover:text-white"><X className="h-5 w-5" /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={backdropRef} className="relative h-[48vh] min-h-[24rem] overflow-hidden sm:h-[62vh]">
        <motion.div style={{ y: bgY }} className="absolute inset-0 scale-105">
          {show.backdrop_path && (
            <img src={imgUrl(show.backdrop_path, "w1280")} alt="" className="h-full w-full object-cover object-[center_20%]" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070a]/90 via-[#06070a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/60 to-transparent" />
        <div className="cinema-vignette absolute inset-0" />

        <div className="section-shell absolute inset-x-0 top-20 z-10 sm:top-24">
          <Link
            to="/tv"
            aria-label="Back to series"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Series</span>
          </Link>
        </div>
      </div>

      <div className="section-shell relative z-10 -mt-28 sm:-mt-40 safe-bottom">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-52 lg:w-60"
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0d14] shadow-[0_12px_36px_rgba(0,0,0,0.8)]">
              {show.poster_path ? (
                <img src={imgUrl(show.poster_path, "w500")} alt={getTitle(show)} className="aspect-[2/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center text-[10px] font-bold tracking-[0.2em] text-white/20">UNCFLIX</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
            className="min-w-0 flex-1 text-center sm:text-left"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Series archive</p>
            <h1 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {getTitle(show)}
            </h1>

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-white/50 sm:justify-start">
              {show.vote_average > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-white/90">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
              {year && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{year}</span>
                </>
              )}
              {show.number_of_seasons && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{show.number_of_seasons} {show.number_of_seasons === 1 ? "season" : "seasons"}</span>
                </>
              )}
              {show.status && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{show.status}</span>
                </>
              )}
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="mt-3.5 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {show.genres.slice(0, 4).map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/tv?genre=${genre.id}`}
                    className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/55 transition-colors hover:border-white/20 hover:text-white"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            <p className="mx-auto mt-4 max-w-2xl text-pretty text-xs leading-relaxed text-white/60 sm:mx-0 sm:text-sm sm:leading-6">
              {show.overview || "No synopsis available for this series."}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <Link
                to={`/watch/tv/${show.id}?season=1&episode=1`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#06070a] shadow-md transition-all hover:bg-white/90 active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" />
                Start watching
              </Link>

              <button
                type="button"
                onClick={() => setInWL(toggleWatchlist(show))}
                aria-label={inWL ? "Remove from watchlist" : "Add to watchlist"}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/[0.14] active:scale-[0.98]"
              >
                {inWL ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
                <span>{inWL ? "In List" : "Add to List"}</span>
              </button>

              {trailerKey && (
                <button
                  type="button"
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <Film className="h-4 w-4" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Share series link"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {seasons.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-14 sm:mt-18">
            <div className="mb-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Episode guide</p>
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Seasons</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {seasons.map((season) => (
                <Link
                  key={season.season_number}
                  to={`/watch/tv/${show.id}?season=${season.season_number}&episode=1`}
                  className="group flex flex-col justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white/85 group-hover:text-white">{season.name}</p>
                    <Play className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">{season.episode_count} episodes</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {cast.length > 0 && (
          <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-14">
            <div className="mb-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Cast & Crew</p>
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Top cast</h2>
            </div>
            <div className="no-scrollbar flex gap-3.5 overflow-x-auto pb-2">
              {cast.map((person) => (
                <div key={person.id} className="group w-20 shrink-0 text-center sm:w-24">
                  <div className="mb-2 aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0d14]">
                    {person.profile_path ? (
                      <img src={imgUrl(person.profile_path, "w185")} alt={person.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-semibold text-white/20">UNC</div>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-white/80">{person.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-white/35">{person.character}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        <ReviewsSection reviews={reviews} />
        {similar.length > 0 && (
          <ContentRow
            eyebrow="RECOMMENDED"
            title="More like this"
            description="Series with similar atmosphere and themes."
            results={similar}
            type="tv"
          />
        )}
      </div>
    </PageShell>
  );
}
