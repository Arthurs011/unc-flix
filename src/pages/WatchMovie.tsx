import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle } from "@/lib/tmdb";

export default function WatchMovie() {
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    // Save to continue watching
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className="pointer-events-auto text-center bg-background/80 backdrop-blur-sm rounded-xl p-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <p className="text-muted-foreground text-sm mb-3">Video not loading?</p>
            <a
              href={`https://vsembed.ru/embed/movie/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
