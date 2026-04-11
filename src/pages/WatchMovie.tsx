import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, Movie } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "tr", label: "Türkçe" },
  { code: "hi", label: "हिन्दी" },
];

export default function WatchMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [movieTitle, setMovieTitle] = useState("");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (!id) return;
    tmdb.movieDetails(Number(id)).then((m) => {
      setMovieTitle(getTitle(m));
      updateContinueWatching({
        id: m.id,
        type: "movie",
        title: getTitle(m),
        poster_path: m.poster_path,
        backdrop_path: m.backdrop_path,
        progress: Math.floor(Math.random() * 60) + 10,
        timestamp: Date.now(),
      });
    }).catch(() => {});

    tmdb.movieRecommendations(Number(id)).then((res) => {
      setRecommendations(res.results.slice(0, 12));
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    setShowFallback(false);
    setShowRecommendations(false);
    const fallbackTimer = setTimeout(() => setShowFallback(true), 15000);
    const recoTimer = setTimeout(() => setShowRecommendations(true), 120000);
    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(recoTimer);
    };
  }, [id]);

  const embedSrc = `https://vsembed.ru/embed/movie/${id}?lang=${lang}`;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="glass-strong px-4 py-3 flex items-center gap-4 z-10 flex-wrap">
        <Link to={`/movie/${id}`} className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-medium text-foreground">Now Playing</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5 border border-border">
            <Languages className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-foreground text-sm outline-none cursor-pointer"
              data-testid="select-language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {recommendations.length > 0 && (
            <button
              onClick={() => setShowRecommendations(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors border border-border"
            >
              Up Next
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe
          key={`${id}-${lang}`}
          src={embedSrc}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Movie Player"
        />
        {showFallback && (
          <div className="absolute bottom-4 right-4 z-10">
            <a
              href={embedSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm text-foreground rounded-lg text-sm font-medium hover:bg-background/90 transition-colors border border-border"
            >
              Video not loading? Open in new tab
            </a>
          </div>
        )}

        <AnimatePresence>
          {showRecommendations && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">You just watched</p>
                  <h2 className="text-lg font-semibold text-foreground">{movieTitle}</h2>
                </div>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <h3 className="text-base font-semibold text-foreground mb-4">Recommended for you</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {recommendations.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => navigate(`/watch/movie/${movie.id}`)}
                      className="group text-left rounded-xl overflow-hidden bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="aspect-[2/3] relative overflow-hidden">
                        <img
                          src={imgUrl(movie.poster_path, "w342")}
                          alt={getTitle(movie)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-xs text-white font-medium">▶ Play</span>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-foreground truncate">{getTitle(movie)}</p>
                        {movie.vote_average > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            ⭐ {movie.vote_average.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-6 py-3 border-t border-border flex gap-3">
                <Link
                  to={`/movie/${id}`}
                  className="flex-1 text-center py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Back to details
                </Link>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue watching
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
