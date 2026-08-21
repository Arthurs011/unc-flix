import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, Clock, ArrowLeft, X, Film, Bookmark } from "lucide-react";
import { tmdb, Movie, Review, MovieDetails as MD, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist, addRecentlyViewed } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import ContentRow from "@/components/ContentRow";
import ReviewsSection from "@/components/ReviewsSection";
import { motion, AnimatePresence } from "motion/react";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MD | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWL, setInWL] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tmdb.movieDetails(Number(id))
      .then((d) => {
        setMovie(d);
        setInWL(isInWatchlist(d.id));
        addRecentlyViewed({ ...d, media_type: "movie" });
        const videos = d.videos?.results ?? [];
        const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer")
          ?? videos.find((v) => v.site === "YouTube");
        setTrailerKey(trailer?.key ?? null);
      })
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
    tmdb.movieRecommendations(Number(id))
      .then((d) => setSimilar((d.results ?? []).filter((m) => m.poster_path)))
      .catch(() => setSimilar([]));
    tmdb.movieReviews(Number(id))
      .then((d) => setReviews(d.results ?? []))
      .catch(() => setReviews([]));
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!movie) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Movie not found</h2>
        <Link to="/" className="text-primary hover:underline font-black uppercase italic tracking-tighter">Go Home</Link>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32">
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
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
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh]">
        <img src={imgUrl(movie.backdrop_path, "original")} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <Link to="/" className="absolute top-20 left-4 sm:left-8 p-2 rounded-full glass text-foreground hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-48 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-shrink-0 w-44 sm:w-64 mx-auto sm:mx-0">
            <img src={imgUrl(movie.poster_path, "w500")} alt={getTitle(movie)} className="w-full rounded-3xl shadow-2xl border border-white/5" />
          </div>

          <div className="flex-1 pt-4 text-center sm:text-left">
            <div className="mb-2">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] italic">Feature Film</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">{getTitle(movie)}</h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-black uppercase tracking-widest text-white/40 mb-6">
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1.5 text-white">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-white/20" />
              {getYear(movie) && <span>{getYear(movie)}</span>}
              <span className="w-1 h-1 rounded-full bg-white/20" />
              {movie.runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {movie.runtime} min
                </span>
              )}
            </div>

            {(movie.genres?.length ?? 0) > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-8">
                {movie.genres!.map((g) => (
                  <span key={g.id} className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">{g.name}</span>
                ))}
              </div>
            )}

            <p className="text-white/70 leading-relaxed mb-10 max-w-2xl text-base sm:text-lg font-medium italic">{movie.overview}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-16 sm:h-14 rounded-2xl px-10 gap-3 text-lg font-black uppercase italic tracking-tighter bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25">
                <Link to={`/watch/movie/${movie.id}`}>
                  <Play className="w-6 h-6 fill-current" />
                  Play Now
                </Link>
              </Button>
              <div className="flex gap-3">
                {trailerKey && (
                    <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 sm:flex-none h-16 sm:h-14 rounded-2xl px-8 gap-3 text-lg font-black uppercase italic tracking-tighter bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 transition-all"
                    onClick={() => setShowTrailer(true)}
                    >
                    <Film className="w-5 h-5" />
                    Trailer
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 sm:flex-none h-16 sm:h-14 rounded-2xl px-6 bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white/10 transition-all"
                    onClick={() => { const added = toggleWatchlist(movie); setInWL(added); }}
                >
                    {inWL ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cast */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <section className="mt-20 mb-20">
             <div className="flex items-center gap-3 mb-8">
                <div className="h-1.5 w-12 bg-primary rounded-full shadow-glow" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Top Cast</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
              {movie.credits.cast.slice(0, 15).map((c) => (
                <div key={c.id} className="flex-shrink-0 w-28 text-center group">
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-secondary mb-3 border-2 border-transparent group-hover:border-primary transition-all duration-300 shadow-lg">
                    <img src={imgUrl(c.profile_path, "w185")} alt={c.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-tight text-white line-clamp-1">{c.name}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 line-clamp-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewsSection reviews={reviews} />

        {similar.length > 0 && (
          <section className="mb-20">
            <ContentRow title="Similar Cinema" movies={similar} type="movie" />
          </section>
        )}
      </div>
    </motion.div>
  );
}
