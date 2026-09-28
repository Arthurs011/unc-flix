import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Film, Search, X } from "lucide-react";
import { tmdb, type Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import PageShell from "@/components/PageShell";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";

const POPULAR_SEARCHES = [
  "Dune",
  "Oppenheimer",
  "Interstellar",
  "Spider-Man",
  "Batman",
  "Breaking Bad",
  "Stranger Things",
  "Succession",
  "The Last of Us",
  "Arcane",
];

const QUICK_GENRES = [
  { name: "Sci-Fi", path: "/movies?genre=878" },
  { name: "Action", path: "/movies?genre=28" },
  { name: "Drama", path: "/movies?genre=18" },
  { name: "Animation", path: "/animated" },
  { name: "Anime", path: "/anime" },
  { name: "Marvel", path: "/marvel" },
];

export default function SearchPage() {
  usePageTitle("Search");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") ?? "";
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      tmdb
        .search(query.trim())
        .then((response) => {
          if (!cancelled) {
            setResults(
              (response.results ?? []).filter(
                (item) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path
              )
            );
          }
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 380);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const clearSearch = () => {
    setInput("");
    navigate("/search");
  };

  return (
    <PageShell className="min-h-screen bg-background pb-32 pt-24 sm:pt-28 md:pt-32">
      <div className="section-shell">
        <header className="mb-8 border-b border-white/[0.07] pb-8 sm:mb-10 sm:pb-10">
          <p className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            <Search className="h-3.5 w-3.5" />
            Search archive
          </p>
          <h1 className="text-3xl font-black leading-none tracking-[-0.05em] text-white sm:text-5xl">
            Find your next story.
          </h1>

          <form onSubmit={submit} className="relative mt-7 max-w-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#0c0d14]/80 p-1.5 backdrop-blur-md transition-all focus-within:border-white/30 focus-within:bg-[#0c0d14] focus-within:ring-1 focus-within:ring-white/20">
              <Search className="ml-3 h-[18px] w-[18px] shrink-0 text-white/30" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search movies, series, titles…"
                aria-label="Search movies and series"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-white/30"
              />
              {input && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search input"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 text-xs font-bold text-[#080a0f] transition-colors hover:bg-sky-100"
              >
                <span>Search</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </header>

        {query && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="min-w-0 truncate text-sm text-white/50">
              Results for <span className="font-semibold text-white/90">“{query}”</span>
            </p>
            {!loading && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                {results.length} {results.length === 1 ? "title" : "titles"}
              </span>
            )}
          </div>
        )}

        {loading ? (
          <GridSkeleton count={12} />
        ) : results.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((item) => (
              <MovieCard key={`${item.media_type}:${item.id}`} movie={item} type={item.media_type === "tv" ? "tv" : "movie"} />
            ))}
          </motion.div>
        ) : query ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex min-h-72 flex-col items-center justify-center py-16 text-center"
          >
            <Film className="mb-4 h-9 w-9 text-white/15" />
            <h2 className="text-xl font-bold tracking-tight text-white/75">No titles surfaced</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/35">
              We couldn’t find anything matching “{query}”. Check spelling or try browsing categories.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-6 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-white/20 hover:text-white"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <div className="space-y-10 pt-2">
            <div>
              <p className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setInput(term);
                      navigate(`/search?q=${encodeURIComponent(term)}`);
                    }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-white/60 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
                Browse genres & hubs
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
                {QUICK_GENRES.map((genre) => (
                  <Link
                    key={genre.name}
                    to={genre.path}
                    className="flex h-14 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-center text-xs font-semibold text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

