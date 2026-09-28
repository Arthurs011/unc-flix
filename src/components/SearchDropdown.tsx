import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, Tv, X } from "lucide-react";
import { getTitle, imgUrl, tmdb, type Movie } from "@/lib/tmdb";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  query: string;
  onQueryChange?: (value: string) => void;
  onSelect: () => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchDropdown({
  query,
  onQueryChange,
  onSelect,
  onSubmit,
  autoFocus = false,
  className,
}: Props) {
  const [internalQuery, setInternalQuery] = useState("");
  const navigate = useNavigate();
  const value = onQueryChange ? query : internalQuery;
  const searchTerm = value.trim();

  const { data: results = [], isFetching, isError } = useQuery({
    queryKey: ["search-dropdown", searchTerm],
    queryFn: () =>
      tmdb
        .search(searchTerm)
        .then((response) => response.results.filter((item) => item.media_type === "movie" || item.media_type === "tv")),
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const updateQuery = (next: string) => {
    if (onQueryChange) onQueryChange(next);
    else setInternalQuery(next);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!searchTerm) return;
    if (onSubmit) onSubmit();
    else navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    onSelect();
  };

  const selectResult = (result: Movie) => {
    navigate(result.media_type === "tv" ? `/tv/${result.id}` : `/movie/${result.id}`);
    onSelect();
  };

  return (
    <motion.form
      onSubmit={submit}
      onClick={(event) => event.stopPropagation()}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={cn("glass-strong overflow-hidden rounded-2xl shadow-cinema", className)}
      role="search"
    >
      <div className="flex h-14 items-center gap-3 border-b border-white/[0.08] px-4">
        <Search className="h-[18px] w-[18px] shrink-0 text-primary" />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search films and series…"
          aria-label="Search films and series"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
        />
        {value ? (
          <button
            type="button"
            onClick={() => updateQuery("")}
            className="tap-target -mr-2 flex items-center justify-center rounded-lg text-white/35 transition-colors hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-mono text-[9px] text-white/30 sm:inline">
            ↵
          </kbd>
        )}
      </div>

      <div className="min-h-[5.5rem] p-2">
        {!searchTerm && (
          <div className="flex min-h-[4.5rem] items-center gap-3 rounded-xl px-3 text-white/35">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
              <Search className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-white/60">Search the archive</p>
              <p className="mt-0.5 text-[11px]">Films and series from the archive appear here.</p>
            </div>
          </div>
        )}

        {searchTerm.length === 1 && (
          <p className="px-3 py-4 text-xs text-white/35">Keep typing to search the archive.</p>
        )}

        {searchTerm.length >= 2 && isFetching && (
          <div className="space-y-1" aria-label="Searching">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl p-2.5">
                <div className="h-14 w-10 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-white/[0.07]" />
                  <div className="h-2 w-1/3 animate-pulse rounded-full bg-white/[0.045]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && isError && (
          <p className="px-3 py-5 text-center text-xs text-red-300/80">Search is temporarily unavailable.</p>
        )}

        {searchTerm.length >= 2 && !isFetching && !isError && results.length === 0 && (
          <p className="px-3 py-5 text-center text-xs text-white/35">No titles found in the archive.</p>
        )}

        <AnimatePresence initial={false}>
          {searchTerm.length >= 2 && !isFetching && results.slice(0, 6).map((result) => (
            <motion.button
              key={`${result.media_type ?? "movie"}:${result.id}`}
              type="button"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => selectResult(result)}
              className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06]"
            >
              <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-raised ring-1 ring-white/[0.07]">
                {result.poster_path ? (
                  <img
                    src={imgUrl(result.poster_path, "w185")}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-white/20">
                    <FilmIcon />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white/80 group-hover:text-white">
                  {getTitle(result)}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/30">
                  {result.media_type === "tv" && <Tv className="h-3 w-3" />}
                  {result.media_type === "tv" ? "Series" : "Film"}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/20 transition-colors group-hover:text-primary" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {searchTerm.length >= 2 && (
        <button
          type="submit"
          className="flex w-full items-center justify-between border-t border-white/[0.07] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 transition-colors hover:bg-white/[0.035] hover:text-primary"
        >
          Search all for “{searchTerm}”
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.form>
  );
}

function FilmIcon() {
  return <span className="text-[10px] font-black tracking-widest">UNC</span>;
}
