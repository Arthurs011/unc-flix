import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Film, Tv } from "lucide-react";
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
    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
      {loading && (
        <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching…
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="px-4 py-3 text-muted-foreground text-sm">
          No results for "{query}"
        </div>
      )}

      {!loading && results.length > 0 && (
        <ul role="listbox">
          {results.map((item) => {
            const isTV = item.media_type === "tv";
            const year = getYear(item);
            return (
              <li key={item.id} role="option" aria-selected="false">
                <button
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary focus-visible:bg-secondary transition-colors text-left"
                >
                  {/* Poster thumbnail */}
                  <div className="flex-shrink-0 w-9 h-[54px] rounded-md overflow-hidden bg-secondary">
                    {item.poster_path ? (
                      <img
                        src={imgUrl(item.poster_path, "w92")}
                        alt={getTitle(item)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {isTV ? <Tv className="w-4 h-4 text-muted-foreground" /> : <Film className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getTitle(item)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {year && <span className="text-xs text-muted-foreground">{year}</span>}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isTV ? "bg-blue-500/20 text-blue-400" : "bg-primary/20 text-primary"}`}>
                        {isTV ? "TV" : "Movie"}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
