import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle } from "@/lib/tmdb";

export default function WatchMovie() {
  const { id } = useParams();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!id) return;
    tmdb.movieDetails(Number(id)).then((m) => {
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
  }, [id]);

  useEffect(() => {
    setShowFallback(false);
    const timer = setTimeout(() => setShowFallback(true), 15000);
    return () => clearTimeout(timer);
  }, [id]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="glass-strong px-4 py-3 flex items-center gap-4 z-10">
        <Link to={`/movie/${id}`} className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-medium text-foreground">Now Playing</span>
      </div>
      <div className="flex-1 relative">
        <iframe
          src={`https://vsembed.ru/embed/movie/${id}`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Movie Player"
        />
        {showFallback && (
          <div className="absolute bottom-4 right-4 z-10">
            <a
              href={`https://vsembed.ru/embed/movie/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm text-foreground rounded-lg text-sm font-medium hover:bg-background/90 transition-colors border border-border"
            >
              Video not loading? Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
