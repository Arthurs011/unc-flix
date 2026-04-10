import { useEffect, useState } from "react";
import { Movie, Genre, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { RowSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TvShowsPage() {
  const [shows, setShows] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tmdb.tvGenres().then((d) => setGenres(d.genres)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    tmdb.tvPopular(1, selectedGenre ?? undefined)
      .then((d) => setShows(d.results))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, [selectedGenre]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-6">Popular TV Shows</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedGenre(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
            selectedGenre === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              selectedGenre === g.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading ? (
        <RowSkeleton />
      ) : shows.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No shows found for this genre.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {shows.map((m) => (
            <MovieCard key={m.id} movie={m} type="tv" />
          ))}
        </div>
      )}
    </motion.div>
  );
}
