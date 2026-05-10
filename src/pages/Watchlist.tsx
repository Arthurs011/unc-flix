import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, removeFromWatchlist } from "@/lib/storage";
import { Movie, getTitle, imgUrl } from "@/lib/tmdb";
import { X, Bookmark, Film, Tv, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Watchlist() {
  const [list, setList] = useState<Movie[]>([]);

  useEffect(() => {
    setList(getWatchlist() || []);
  }, []);

  const handleRemove = (id: number) => {
    removeFromWatchlist(id);
    setList(getWatchlist());
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-[100px] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter">My Watchlist</h1>
            <p className="text-muted-foreground mt-2 font-medium uppercase tracking-widest text-xs">Saved movies and TV shows</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
             <Bookmark className="w-4 h-4 text-primary fill-current" />
             <span className="text-sm font-bold">{list.length} {list.length === 1 ? 'Item' : 'Items'}</span>
          </div>
        </header>

        {list.length === 0 ? (
          <div className="text-center py-32 bg-secondary/20 rounded-[2rem] border border-dashed border-border/50">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">Start adding movies and TV shows to keep track of what you want to watch next.</p>
            <Link to="/" className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-black uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all">
               Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence mode="popLayout">
              {list.map((m) => {
                const type = m.media_type || (m.title ? "movie" : "tv");
                const to = type === "tv" ? `/tv/${m.id}` : `/movie/${m.id}`;
                
                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative"
                  >
                    <Link to={to} className="block aspect-[2/3] rounded-2xl overflow-hidden bg-secondary relative shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                      <img
                        src={imgUrl(m.poster_path, "w500")}
                        alt={getTitle(m)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                         <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-3 shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                         </div>
                         <p className="text-xs font-black uppercase italic tracking-tighter leading-tight line-clamp-2">{getTitle(m)}</p>
                      </div>
                      
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="p-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest">
                           {type === 'movie' ? <Film className="w-2.5 h-2.5" /> : <Tv className="w-2.5 h-2.5" />}
                        </span>
                      </div>
                    </Link>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(m.id);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                      title="Remove from Watchlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
