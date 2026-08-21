import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, removeFromWatchlist } from "@/lib/storage";
import { Movie, getTitle, imgUrl } from "@/lib/tmdb";
import { X, Bookmark, Film, Tv, Play } from "lucide-react";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { motion, AnimatePresence } from "motion/react";
import { fadeUp, staggerFast, springSnappy } from "@/lib/motion";

export default function Watchlist() {
  usePageTitle("My List");
  const [list, setList] = useState<Movie[]>([]);

  useEffect(() => {
    setList(getWatchlist() || []);
  }, []);

  const handleRemove = (id: number) => {
    removeFromWatchlist(id);
    setList(getWatchlist());
  };

  return (
    <PageShell className="min-h-screen bg-background pt-28 md:pt-32 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.header variants={fadeUp} initial="hidden" animate="show" className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              Your Library
            </p>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none">Watchlist</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
            <Bookmark className="w-3.5 h-3.5 text-primary fill-current" />
            <span className="text-xs font-bold text-white/70">
              {list.length} {list.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </motion.header>

        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-28 rounded-3xl bg-white/[0.03] ring-1 ring-dashed ring-white/10"
          >
            <Bookmark className="w-14 h-14 text-white/15 mx-auto mb-5" />
            <h2 className="text-xl font-extrabold tracking-tight text-white/50 mb-2">Your watchlist is empty</h2>
            <p className="text-white/30 text-sm max-w-xs mx-auto mb-8">
              Start adding movies and TV shows to keep track of what you want to watch next.
            </p>
            <Link
              to="/"
              className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-transform"
            >
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <motion.div layout variants={staggerFast} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {list.map((m) => {
                const type = m.media_type || (m.title ? "movie" : "tv");
                const to = type === "tv" ? `/tv/${m.id}` : `/movie/${m.id}`;

                return (
                  <motion.div
                    key={m.id}
                    layout
                    variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={springSnappy}
                    className="group relative"
                  >
                    <Link
                      to={to}
                      className="block aspect-[2/3] rounded-2xl overflow-hidden bg-card relative ring-1 ring-white/[0.08] group-hover:ring-primary/40 shadow-card transition-all duration-300"
                    >
                      <img
                        src={imgUrl(m.poster_path, "w500")}
                        alt={getTitle(m)}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4 pb-5 text-center">
                        <motion.div
                          initial={{ scale: 0.7, opacity: 0 }}
                          whileHover={{ scale: 1 }}
                          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-3 shadow-glow-lg"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </motion.div>
                        <p className="text-xs font-bold leading-tight line-clamp-2">{getTitle(m)}</p>
                      </div>

                      <div className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md ring-1 ring-white/10 text-white/70">
                        {type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                      </div>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(m.id);
                      }}
                      aria-label="Remove from watchlist"
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 active:scale-90 transition-all z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
