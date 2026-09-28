import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, Check, Film, Library, Trash2, Tv } from "lucide-react";
import { getWatchlist, removeFromWatchlist } from "@/lib/storage";
import type { Movie } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FilterType = "all" | "movie" | "tv";

export default function Watchlist() {
  usePageTitle("My List");
  const [list, setList] = useState<Movie[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    setList(getWatchlist());
  }, []);

  const remove = (id: number, type: "movie" | "tv") => {
    removeFromWatchlist(id, type);
    setList(getWatchlist());
  };

  const seriesCount = list.filter((item) => item.media_type === "tv" || (!item.title && item.name)).length;
  const movieCount = list.length - seriesCount;

  const filteredList = list.filter((item) => {
    const isTv = item.media_type === "tv" || (!item.title && item.name);
    if (filter === "movie") return !isTv;
    if (filter === "tv") return isTv;
    return true;
  });

  return (
    <PageShell className="min-h-screen bg-background pb-32 pt-24 sm:pt-28 md:pt-32">
      <div className="section-shell">
        <header className="mb-8 flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-8 md:flex-row md:items-end md:pb-10">
          <div>
            <p className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              <Bookmark className="h-3.5 w-3.5" />
              My library
            </p>
            <h1 className="text-4xl font-black leading-none tracking-[-0.05em] text-white sm:text-6xl">
              Watchlist
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/40">
              Keep the films and series you want to return to, all in one quiet place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0c0d14] px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              <Library className="h-3.5 w-3.5 text-primary" />
              {list.length} saved
            </span>
          </div>
        </header>

        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex min-h-[26rem] flex-col items-center justify-center py-16 text-center"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-white/30">
              <Bookmark className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white/80">Your list is waiting</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/35">
              Save any film or series to keep it handy for your next watch session.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/movies"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-[#080a0f] transition-colors hover:bg-sky-100"
              >
                <Film className="h-3.5 w-3.5" />
                Browse films
              </Link>
              <Link
                to="/tv"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 text-xs font-semibold text-white/70 transition-colors hover:border-white/20 hover:text-white"
              >
                <Tv className="h-3.5 w-3.5" />
                Explore series
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Filter Pills */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                  filter === "all"
                    ? "bg-primary text-[#060e17]"
                    : "border border-white/[0.08] bg-white/[0.025] text-white/45 hover:border-white/20 hover:text-white"
                )}
              >
                All ({list.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("movie")}
                className={cn(
                  "h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                  filter === "movie"
                    ? "bg-primary text-[#060e17]"
                    : "border border-white/[0.08] bg-white/[0.025] text-white/45 hover:border-white/20 hover:text-white"
                )}
              >
                Films ({movieCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("tv")}
                className={cn(
                  "h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors",
                  filter === "tv"
                    ? "bg-primary text-[#060e17]"
                    : "border border-white/[0.08] bg-white/[0.025] text-white/45 hover:border-white/20 hover:text-white"
                )}
              >
                Series ({seriesCount})
              </button>
            </div>

            {filteredList.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] p-10 text-center">
                <p className="text-sm font-semibold text-white/60">No {filter === "movie" ? "films" : "series"} in your list yet</p>
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-3 text-xs font-semibold text-primary transition-colors hover:text-sky-300"
                >
                  Show all saved titles
                </button>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                <AnimatePresence mode="popLayout">
                  {filteredList.map((item) => {
                    const type = item.media_type === "tv" || (!item.title && item.name) ? "tv" : "movie";
                    return (
                      <motion.div key={`${type}:${item.id}`} layout exit={{ opacity: 0, scale: 0.9 }} className="group relative min-w-0">
                        <MovieCard movie={{ ...item, media_type: type }} type={type} />
                        <button
                          type="button"
                          onClick={() => remove(item.id, type)}
                          aria-label={`Remove ${item.name ?? item.title} from my list`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/60 text-white/50 opacity-0 backdrop-blur-md transition-all hover:border-red-400/40 hover:bg-red-950/80 hover:text-red-200 focus:opacity-100 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            <div className="mt-14 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Saved locally on this device
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

