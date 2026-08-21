import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Film, Loader2 } from "lucide-react";
import { Movie, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "motion/react";
import { fadeUp, staggerFast } from "@/lib/motion";

export default function SearchPage() {
  usePageTitle("Search");
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
    <PageShell className="min-h-screen bg-background pt-28 md:pt-32 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.header variants={fadeUp} initial="hidden" animate="show" className="mb-10">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
            <Search className="w-3.5 h-3.5" />
            Search Results
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none truncate">
            {query ? `"${query}"` : "Discover Content"}
          </h1>
        </motion.header>

        {loading ? (
          <GridSkeleton count={12} />
        ) : results.length > 0 ? (
          <motion.div
            key={query}
            variants={staggerFast}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {results.map((m) => (
              <motion.div key={m.id} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>
                <MovieCard movie={m} />
              </motion.div>
            ))}
          </motion.div>
        ) : query ? (
          <div className="text-center py-28 rounded-3xl bg-white/[0.03] ring-1 ring-dashed ring-white/10">
            <Film className="w-14 h-14 text-white/15 mx-auto mb-5" />
            <h3 className="text-xl font-extrabold tracking-tight text-white/40 mb-2">No matches found</h3>
            <p className="text-white/25 uppercase tracking-widest text-[10px] font-bold">Try searching for something else</p>
          </div>
        ) : (
          <div className="text-center py-28">
            <Loader2 className="w-10 h-10 mx-auto mb-5 text-white/10" />
            <h3 className="text-lg font-extrabold tracking-tight text-white/30 mb-2">Start your search</h3>
            <p className="text-white/20 uppercase tracking-widest text-[10px] font-bold">Find your favorite movies and shows</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
