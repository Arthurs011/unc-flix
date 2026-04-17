import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Movie, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setSearched(true);
    tmdb.search(q)
      .then((d) => setResults(d.results.filter((r) => r.poster_path && (r.media_type === "movie" || r.media_type === "tv"))))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim() && query !== q) {
        setParams({ q: query.trim() });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-[120px] md:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & TV shows..."
          className="w-full bg-secondary text-foreground text-lg rounded-2xl pl-12 pr-4 py-4 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-shadow"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((m) => (
            <MovieCard key={m.id} movie={m} type={m.media_type as "movie" | "tv"} />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
          <p className="text-muted-foreground">Try searching for something else</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Search for movies & shows</h3>
          <p className="text-muted-foreground">Type to start searching</p>
        </div>
      )}
    </motion.div>
  );
}
