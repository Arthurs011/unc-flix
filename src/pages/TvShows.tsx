import { useEffect, useState } from "react";
import { Movie, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { RowSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

export default function TvShowsPage() {
  const [shows, setShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tmdb.tvPopular()
      .then((d) => setShows(d.results))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="pt-24 max-w-7xl mx-auto px-4"><RowSkeleton /><RowSkeleton /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Popular TV Shows</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {shows.map((m) => (
          <MovieCard key={m.id} movie={m} type="tv" />
        ))}
      </div>
    </motion.div>
  );
}
