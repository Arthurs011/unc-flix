import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Film, Tv } from "lucide-react";
import { Movie, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      tmdb.search(query)
        .then((res) => {
          setResults((res.results ?? []).filter((m) => m.poster_path));
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pt-[100px] pb-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
            <Search className="w-5 h-5 text-primary" />
            <h1 className="text-sm font-black uppercase tracking-widest text-white/40 italic">Search Results</h1>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter">
            {query ? `"${query}"` : "Discover Content"}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-secondary rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
          {results.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
          <Film className="w-16 h-16 text-white/20 mx-auto mb-6" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white/40">No matches found</h3>
          <p className="text-white/20 uppercase tracking-widest text-[10px] font-bold mt-2">Try searching for something else</p>
        </div>
      ) : (
        <div className="text-center py-32 opacity-20">
          <Search className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2 font-black uppercase italic tracking-tighter">Start your search</h3>
          <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Find your favorite movies and shows</p>
        </div>
      )}
    </motion.div>
  );
}
