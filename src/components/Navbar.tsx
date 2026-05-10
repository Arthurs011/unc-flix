import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Film, Tv, BookmarkPlus, Home, Clapperboard, X, LayoutGrid, ChevronDown, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import SearchDropdown from "@/components/SearchDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QUICK_GENRES = [
  { id: 28, name: "Action" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/tv", label: "Series", icon: Tv },
    { to: "/movies", label: "Cinema", icon: Film },
    { to: "/watchlist", label: "Saved", icon: BookmarkPlus },
  ];

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
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
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
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(mobileQuery.trim())}`);
      setMobileQuery("");
      setMobileSearchVisible(false);
    }
  };

  return (
    <>
      {/* 
        DESKTOP NAVBAR 
      */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block glass-strong border-b border-white/5" aria-label="Desktop navigation">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-primary text-white shadow-glow group-hover:rotate-12 transition-transform duration-500">
                <Clapperboard className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground italic">
                UNC<span className="text-primary">FLIX</span>
              </span>
            </Link>

            <div className="flex items-center gap-6">
              {links.slice(0, 3).map((l) => {
                const isActive = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={cn(
                      "relative px-4 py-2 text-xs font-black uppercase tracking-widest italic transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-white/60"
                    )}
                  >
                    {l.label}
                    {isActive && (
                      <motion.div layoutId="nav-underline" className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full shadow-glow" />
                    )}
                  </Link>
                );
              })}
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest italic text-white/60 hover:text-primary outline-none transition-colors">
                  Browse <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-strong border-white/10 p-2 rounded-2xl">
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Popular Genres</div>
                  {QUICK_GENRES.map((g) => (
                    <DropdownMenuItem key={g.id} asChild className="rounded-xl focus:bg-primary focus:text-white cursor-pointer transition-all">
                      <Link to={`/movies?genre=${g.id}`} className="flex items-center gap-2 font-bold uppercase italic text-[10px] tracking-widest">
                         <LayoutGrid className="w-3 h-3" /> {g.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4" ref={desktopSearchRef}>
              <div className="relative flex items-center">
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 320, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onSubmit={handleSearch}
                      className="overflow-visible"
                    >
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          ref={searchInputRef}
                          autoFocus
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="SEARCH CINEMA..."
                          className="w-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all italic"
                        />
                      </div>
                      <SearchDropdown query={query} onSelect={() => { setSearchOpen(false); setQuery(""); }} />
                    </motion.form>
                  )}
                </AnimatePresence>
                {!searchOpen && (
                  <button onClick={() => setSearchOpen(true)} className="p-3 rounded-full bg-white/5 hover:bg-primary text-white transition-all border border-white/5">
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Link to="/watchlist" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5">
                 <BookmarkPlus className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 
        MOBILE TOP BAR (Clean & Simple) 
      */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden glass-strong border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-glow">
                <Clapperboard className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tighter italic uppercase text-white">UNC<span className="text-primary">FLIX</span></span>
        </Link>
        <div className="flex items-center gap-2">
            <button onClick={() => setMobileSearchVisible(true)} className="p-2.5 rounded-xl bg-white/5 text-white border border-white/5">
                <Search className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* 
        MOBILE DOCK (Premium Navigation)
      */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm">
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-2 py-2 flex items-center justify-around shadow-2xl shadow-black/50">
            {links.map((l) => {
                const isActive = location.pathname === l.to;
                return (
                    <Link
                        key={l.to}
                        to={l.to}
                        className={cn(
                            "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-500",
                            isActive ? "bg-primary text-white shadow-glow" : "text-white/40 hover:text-white"
                        )}
                    >
                        <l.icon className={cn("w-5 h-5", isActive ? "scale-110" : "scale-100")} />
                        {isActive && (
                            <motion.span 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[7px] font-black uppercase tracking-tighter absolute -bottom-1"
                            >
                                {l.label}
                            </motion.span>
                        )}
                    </Link>
                );
            })}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {mobileSearchVisible && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-3xl flex flex-col p-6 md:hidden"
          >
            <div className="flex items-center gap-4 mb-8 pt-4">
              <form onSubmit={handleMobileSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                    autoFocus 
                    value={mobileQuery} 
                    onChange={(e) => setMobileQuery(e.target.value)} 
                    placeholder="Search cinema..." 
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-primary font-black uppercase italic tracking-widest text-sm" 
                  />
                </div>
              </form>
              <button 
                onClick={() => setMobileSearchVisible(false)} 
                className="p-4 rounded-2xl bg-white/5 text-white border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
              <SearchDropdown query={mobileQuery} onSelect={() => { setMobileQuery(""); setMobileSearchVisible(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
