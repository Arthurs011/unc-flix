import { useEffect, useState, useCallback, useRef } from "react";
import { Movie, Genre, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { RowSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tmdb.movieGenres()
      .then((d) => setGenres(d.genres ?? []))
      .catch(() => setGenres([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    tmdb.popular(1, selectedGenre ?? undefined)
      .then((d) => {
        setMovies(d.results ?? []);
        setTotalPages(d.total_pages ?? 1);
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [selectedGenre]);

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    tmdb.popular(nextPage, selectedGenre ?? undefined)
      .then((d) => {
        setMovies((prev) => [...prev, ...(d.results ?? [])]);
        setPage(nextPage);
        setTotalPages(d.total_pages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [page, totalPages, loadingMore, selectedGenre]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-[120px] md:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-6">Popular Movies</h1>

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
      ) : movies.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">No movies found for this genre.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
          {page < totalPages && (
            <div ref={observerRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
