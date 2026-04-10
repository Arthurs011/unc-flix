import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, ArrowLeft } from "lucide-react";
import { tmdb, MovieDetails as MD, imgUrl, getTitle, getYear } from "@/lib/tmdb";
import { isInWatchlist, toggleWatchlist, addRecentlyViewed } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function TvDetailsPage() {
  const { id } = useParams();
  const [show, setShow] = useState<MD | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWL, setInWL] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tmdb.tvDetails(Number(id))
      .then((d) => {
        setShow(d);
        setInWL(isInWatchlist(d.id));
        addRecentlyViewed({ ...d, media_type: "tv" });
      })
      .catch(() => setShow(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;
  if (!show) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Show not found</h2>
        <Link to="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    </div>
  );

  const cast = show.credits?.cast?.slice(0, 20) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="relative h-[50vh] sm:h-[60vh]">
        <img src={imgUrl(show.backdrop_path, "original")} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <Link to="/" className="absolute top-20 left-4 sm:left-8 p-2 rounded-full glass text-foreground hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="flex-shrink-0 w-48 sm:w-56 mx-auto sm:mx-0">
            <img src={imgUrl(show.poster_path, "w500")} alt={getTitle(show)} className="w-full rounded-2xl shadow-2xl" />
          </div>

          <div className="flex-1 pt-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">{getTitle(show)}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
              {getYear(show) && <span>{getYear(show)}</span>}
              {show.number_of_seasons && <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}</span>}
            </div>

            {show.genres && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground">{g.name}</span>
                ))}
              </div>
            )}

            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{show.overview}</p>

            <div className="flex gap-3">
              <Button asChild size="lg" className="rounded-full px-8 gap-2 text-base font-semibold">
                <Link to={`/watch/tv/${show.id}/1/1`}>
                  <Play className="w-5 h-5 fill-current" />
                  Play S1E1
                </Link>
              </Button>
              <Button
                variant="secondary" size="lg" className="rounded-full px-6 gap-2"
                onClick={() => { const added = toggleWatchlist(show); setInWL(added); }}
              >
                {inWL ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {inWL ? "In Watchlist" : "Watchlist"}
              </Button>
            </div>

            {/* Seasons */}
            {show.seasons && show.seasons.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-3">Seasons</h3>
                <div className="flex flex-wrap gap-2">
                  {show.seasons
                    .filter((s) => s.season_number > 0)
                    .map((s) => (
                      <Link
                        key={s.season_number}
                        to={`/watch/tv/${show.id}/${s.season_number}/1`}
                        className="px-4 py-2 bg-secondary hover:bg-accent rounded-lg text-sm text-foreground transition-colors"
                      >
                        {s.name} ({s.episode_count} ep)
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {cast.length > 0 && (
          <section className="mt-12 mb-16">
            <h2 className="text-xl font-semibold text-foreground mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((c) => (
                <div key={c.id} className="flex-shrink-0 w-24 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-secondary mb-2">
                    <img src={imgUrl(c.profile_path, "w185")} alt={c.name} loading="lazy" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
