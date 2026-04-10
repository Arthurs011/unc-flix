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
        progress: Math.floor(Math.random() * 60) + 10, // simulate progress
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
      <div className="flex-1">
        <iframe
          src={`https://vidsrc.xyz/embed/movie/${id}`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="Movie Player"
        />
      </div>
    </div>
  );
}
