import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Clapperboard, X, Home, Tv, Film, BookmarkPlus, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE, springSnappy } from "@/lib/motion";
import SearchBox from "@/components/SearchBox";
import AccountMenu from "@/components/AccountMenu";

const DOCK_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tv", label: "Series", icon: Tv },
  { to: "/movies", label: "Cinema", icon: Film },
  { to: "/watchlist", label: "Saved", icon: BookmarkPlus },
];

const QUICK_GENRES = [
  { id: 28, name: "Action" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
];

export default function MobileNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  // Held here, not inside SearchBox, so the quick-genre chips can hide as soon
  // as the field has text in it.
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  return (
    <>
      {/* ===== Top bar ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden glass-strong ring-1 ring-white/[0.06] pt-safe">
        <div className="h-16 px-4 flex items-center justify-between">
          <Link to="/" className="-my-2 p-2 flex items-center gap-2.5 active:opacity-70 transition-opacity">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm">
              <Clapperboard className="w-4 h-4" />
            </span>
            <span className="text-base font-extrabold tracking-tight text-white">
              UNC<span className="text-primary">FLIX</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="w-11 h-11 rounded-full flex items-center justify-center text-white/70 active:bg-white/[0.1] transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* ===== Bottom dock ===== */}
      <motion.nav
        initial={{ y: 110, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center pointer-events-none pb-safe"
      >
        <div className="pointer-events-auto mb-3 glass-strong ring-1 ring-white/10 rounded-[2rem] px-2.5 py-2 flex items-center gap-1 shadow-card-lg">
          {DOCK_LINKS.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-label={l.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative w-16 h-14 rounded-3xl flex flex-col items-center justify-center gap-1 transition-colors",
                  isActive ? "text-white" : "text-white/40 active:text-white/80"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="dock-active-pill"
                    transition={springSnappy}
                    className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-sm"
                  />
                )}
                <l.icon className="relative z-10 w-5 h-5" />
                <span className="relative z-10 text-[8px] font-bold uppercase tracking-widest">{l.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* ===== Search sheet ===== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] md:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 top-10 rounded-t-[2rem] bg-background ring-1 ring-white/10 flex flex-col overflow-hidden"
            >
              <div className="pt-safe shrink-0">
                <div className="flex justify-center pt-3 pb-1">
                  <span className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                <div className="px-4 pb-4 flex items-center gap-3">
                  <div className="flex-1">
                    <SearchBox
                      variant="sheet"
                      autoFocus
                      query={query}
                      onQueryChange={setQuery}
                      onSubmitted={() => setSearchOpen(false)}
                      onDismiss={() => setSearchOpen(false)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close search"
                    className="w-12 h-12 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center text-white/70 active:bg-white/[0.12]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!query && (
                  <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                    {QUICK_GENRES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => navigate(`/movies?genre=${g.id}`)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.05] ring-1 ring-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-white/55 active:bg-white/[0.1]"
                      >
                        <LayoutGrid className="w-3 h-3 text-primary" />
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-safe" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
