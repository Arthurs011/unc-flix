import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Film, Tv, SearchX } from "lucide-react";
import { tmdb, imgUrl, getTitle, getYear, Movie } from "@/lib/tmdb";

interface Props {
  query: string;
  onSelect: () => void;
}

export default function SearchDropdown({ query, onSelect }: Props) {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await tmdb.search(query.trim());
        const filtered = res.results
          .filter((r) => (r.media_type === "movie" || r.media_type === "tv") && (r.title || r.name))
          .slice(0, 8);
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (item: Movie) => {
    const path = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(path);
    onSelect();
  };

  if (query.trim().length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-background/90 backdrop-blur-2xl ring-1 ring-white/10 shadow-card-lg overflow-hidden"
    >
      {loading && (
        <div className="flex items-center gap-2.5 px-4 py-4 text-white/40 text-xs font-semibold uppercase tracking-widest">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Searching
        </div>
      )}

      <AnimatePresence mode="wait">
        {!loading && results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-4 py-4 text-white/40 text-sm"
          >
            <SearchX className="w-4 h-4" />
            No results for "{query}"
          </motion.div>
        )}

        {!loading && results.length > 0 && (
          <motion.ul
            key="results"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
            role="listbox"
            className="p-1.5"
          >
            {results.map((item) => {
              const isTV = item.media_type === "tv";
              const year = getYear(item);
              return (
                <motion.li
                  key={item.id}
                  role="option"
                  aria-selected="false"
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.06] focus-visible:bg-white/[0.06] transition-colors text-left outline-none"
                  >
                    <div className="flex-shrink-0 w-9 h-[54px] rounded-lg overflow-hidden bg-white/[0.06]">
                      {item.poster_path ? (
                        <img
                          src={imgUrl(item.poster_path, "w92")}
                          alt={getTitle(item)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          {isTV ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{getTitle(item)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {year && (
                          <span className="text-[10px] font-medium text-white/40 tracking-wide">
                            {year}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isTV ? "bg-indigo-500/15 text-indigo-300" : "bg-sky-500/15 text-sky-300"
                          }`}
                        >
                          {isTV ? "Series" : "Movie"}
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
