import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, Clock, ArrowLeft, X, Film } from "lucide-react";
import { tmdb, Movie, Review, MovieDetails as MD, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist, addRecentlyViewed } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import ContentRow from "@/components/ContentRow";
import ReviewsSection from "@/components/ReviewsSection";
import { motion, AnimatePresence } from "framer-motion";

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
        addRecentlyViewed(d);
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
    <div className="min-h-screen flex items-center justify-center pt-[120px] md:pt-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Movie not found</h2>
        <Link to="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    </div>
  );

  const cast = movie.credits?.cast?.slice(0, 20) ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <AnimatePresence>
        {showTrailer && trailerKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
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

      <div className="relative h-[50vh] sm:h-[60vh]">
        <img src={imgUrl(movie.backdrop_path, "original")} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Link
          to="/"
          className="absolute top-20 left-4 sm:left-8 p-2 rounded-full glass text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-shrink-0 w-48 sm:w-56 mx-auto sm:mx-0">
            <img
              src={imgUrl(movie.poster_path, "w500")}
              alt={getTitle(movie)}
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>

          <div className="flex-1 pt-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              {getTitle(movie)}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {getYear(movie) && <span>{getYear(movie)}</span>}
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
            </div>

            {(movie.genres?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres!.map((g) => (
                  <span key={g.id} className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 gap-2 text-base font-semibold">
                <Link to={`/watch/movie/${movie.id}`}>
                  <Play className="w-5 h-5 fill-current" />
                  Play Now
                </Link>
              </Button>
              {trailerKey && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 gap-2"
                  onClick={() => setShowTrailer(true)}
                >
                  <Film className="w-5 h-5" />
                  Trailer
                </Button>
              )}
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-6 gap-2"
                onClick={() => {
                  const added = toggleWatchlist(movie);
                  setInWL(added);
                }}
              >
                {inWL ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {inWL ? "In Watchlist" : "Watchlist"}
              </Button>
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <section className="mt-12 mb-16">
            <h2 className="text-xl font-semibold text-foreground mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-24 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-secondary mb-2">
                    <img
                      src={imgUrl(c.profile_path, "w185")}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewsSection reviews={reviews} />

        {similar.length > 0 && (
          <section className="mb-16">
            <ContentRow title="Similar Movies" movies={similar} type="movie" />
          </section>
        )}
      </div>
    </motion.div>
  );
}
