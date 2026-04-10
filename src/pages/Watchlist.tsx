import { useState, useEffect } from "react";
import { BookmarkX } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import { getWatchlist, removeFromWatchlist } from "@/lib/storage";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";

export default function WatchlistPage() {
  const [list, setList] = useState<Movie[]>([]);

  useEffect(() => {
    setList(getWatchlist());
  }, []);

  const remove = (id: number) => {
    removeFromWatchlist(id);
    setList(getWatchlist());
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">My Watchlist</h1>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <BookmarkX className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Your watchlist is empty</h3>
          <p className="text-muted-foreground">Browse movies and add them to your watchlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {list.map((m) => (
            <div key={m.id} className="relative group">
              <MovieCard movie={m} type={m.media_type as "movie" | "tv"} />
              <button
                onClick={() => remove(m.id)}
                className="absolute top-2 left-2 p-1.5 rounded-full bg-background/70 backdrop-blur text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Remove from watchlist"
              >
                <BookmarkX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
