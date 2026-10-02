import { Link } from "react-router-dom";
import { Bookmark, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import PageShell from "@/components/PageShell";
import WatchlistCard from "@/components/WatchlistCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useWatchlist, useWatchlistPersistent } from "@/hooks/useWatchlist";
import { Movie } from "@/lib/tmdb";
import { titleType } from "@/lib/watchlistSync";
import { removeFromWatchlist } from "@/lib/storage";
import { springSnappy } from "@/lib/motion";

export default function Watchlist() {
  usePageTitle("My List");
  const list = useWatchlist();
  const persistent = useWatchlistPersistent();

  const handleRemove = (m: Movie) => removeFromWatchlist(m.id, titleType(m));

  return (
    <PageShell className="min-h-screen bg-background pt-28 md:pt-32 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSnappy}
          className="mb-10 flex items-center justify-between gap-4"
        >
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              Your Library
            </p>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none">
              Watchlist
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
            <Bookmark className="w-3.5 h-3.5 text-primary fill-current" />
            <span className="text-xs font-bold text-white/70">
              {list.length} {list.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </motion.header>

        {!persistent && (
          <div
            role="status"
            className="mb-8 flex items-start gap-3 rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30 px-5 py-4"
          >
            <TriangleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-100/90 leading-relaxed">
              This browser is not saving your library, so titles added here disappear when you
              close the tab. Private browsing and full storage both cause this. Sign in to keep
              your watchlist on your account, or clear this site's data in your browser settings.
            </p>
          </div>
        )}

        {list.length === 0 ? (
          <div className="text-center py-28 rounded-3xl bg-white/[0.03] ring-1 ring-dashed ring-white/10">
            <Bookmark className="w-14 h-14 text-white/15 mx-auto mb-5" />
            <h2 className="text-xl font-extrabold tracking-tight text-white/50 mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-white/30 text-sm max-w-xs mx-auto mb-8">
              Start adding movies and TV shows to keep track of what you want to watch next.
            </p>
            <Link
              to="/"
              className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-transform"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={springSnappy}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((m, i) => (
                <WatchlistCard
                  key={`${titleType(m)}:${m.id}`}
                  movie={m}
                  type={titleType(m)}
                  index={i}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}