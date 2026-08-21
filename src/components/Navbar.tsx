import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Clapperboard, X, LayoutGrid, ChevronDown, BookmarkPlus, Home, Tv, Film } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { springSnappy } from "@/lib/motion";
import SearchDropdown from "@/components/SearchDropdown";

const QUICK_GENRES = [
  { id: 28, name: "Action" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
];

const LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tv", label: "Series", icon: Tv },
  { to: "/movies", label: "Cinema", icon: Film },
  { to: "/watchlist", label: "Saved", icon: BookmarkPlus },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setQuery("");
    setMobileQuery("");
    setSearchOpen(false);
    setMobileSearchVisible(false);
    setBrowseOpen(false);
  }, [location.pathname]);

  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastScrollY.current) < 8) return;
      const goingDown = y > lastScrollY.current && y > 140;
      setNavHidden(goingDown);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent, q: string) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setQuery("");
      setMobileQuery("");
      setMobileSearchVisible(false);
    }
  };

  return (
    <>
      {/* ===== Desktop floating pill nav ===== */}
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: navHidden ? -96 : 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none"
        aria-label="Desktop navigation"
      >
        <div className="pointer-events-auto flex items-center gap-1 h-16 pl-5 pr-2 rounded-full glass-strong ring-1 ring-white/10 shadow-card">
          <Link to="/" className="flex items-center gap-2.5 mr-4 group">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm group-hover:rotate-12 transition-transform duration-500">
              <Clapperboard className="w-4 h-4" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              UNC<span className="text-primary">FLIX</span>
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {LINKS.slice(0, 3).map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors",
                    isActive ? "text-white" : "text-white/50 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={springSnappy}
                      className="absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-white/10"
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </Link>
              );
            })}

            {/* Browse dropdown */}
            <div className="relative" ref={browseRef}>
              <button
                onClick={() => setBrowseOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors outline-none",
                  browseOpen ? "text-white bg-white/[0.09]" : "text-white/50 hover:text-white"
                )}
              >
                Browse
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", browseOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {browseOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 rounded-2xl glass-strong ring-1 ring-white/10 shadow-card-lg p-1.5 origin-top"
                  >
                    <p className="px-3 pt-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                      Popular Genres
                    </p>
                    {QUICK_GENRES.map((g, i) => (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i }}
                      >
                        <Link
                          to={`/movies?genre=${g.id}`}
                          onClick={() => setBrowseOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors"
                        >
                          <LayoutGrid className="w-3 h-3 text-primary" />
                          {g.name}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1 ml-3 relative" ref={searchWrapRef}>
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  onSubmit={(e) => submit(e, query)}
                  className="overflow-visible relative"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search titles..."
                      className="w-full h-11 rounded-full bg-white/[0.06] ring-1 ring-white/10 text-sm text-white placeholder:text-white/30 pl-11 pr-4 outline-none focus:ring-primary/60 transition-all"
                    />
                  </div>
                  <div className="absolute top-full right-0 left-0">
                    <SearchDropdown query={query} onSelect={() => { setSearchOpen(false); setQuery(""); }} />
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {!searchOpen && (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <Link
              to="/watchlist"
              aria-label="Watchlist"
              className={cn(
                "p-3 rounded-full transition-all",
                location.pathname === "/watchlist"
                  ? "text-primary bg-primary/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.08]"
              )}
            >
              <BookmarkPlus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ===== Mobile top bar ===== */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden glass-strong ring-1 ring-white/[0.06] px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm">
            <Clapperboard className="w-4 h-4" />
          </span>
          <span className="text-base font-extrabold tracking-tight text-white">
            UNC<span className="text-primary">FLIX</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileSearchVisible(true)}
          aria-label="Search"
          className="p-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* ===== Mobile dock ===== */}
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden"
      >
        <div className="glass-strong ring-1 ring-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-card-lg">
          {LINKS.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-label={l.label}
                className={cn(
                  "relative w-13 h-13 rounded-full flex items-center justify-center transition-colors",
                  isActive ? "text-white" : "text-white/40 hover:text-white/80"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="dock-active-pill"
                    transition={springSnappy}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow"
                  />
                )}
                <l.icon className="relative z-10 w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ===== Mobile search overlay ===== */}
      <AnimatePresence>
        {mobileSearchVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl flex flex-col p-5 md:hidden"
          >
            <div className="flex items-center gap-3 mb-6 pt-3">
              <form onSubmit={(e) => submit(e, mobileQuery)} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 pointer-events-none" />
                  <input
                    autoFocus
                    value={mobileQuery}
                    onChange={(e) => setMobileQuery(e.target.value)}
                    placeholder="Search titles..."
                    className="w-full h-14 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 text-base text-white placeholder:text-white/30 pl-12 pr-4 outline-none focus:ring-primary/60 transition-all"
                  />
                </div>
              </form>
              <button
                onClick={() => setMobileSearchVisible(false)}
                aria-label="Close search"
                className="p-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <SearchDropdown query={mobileQuery} onSelect={() => { setMobileQuery(""); setMobileSearchVisible(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
