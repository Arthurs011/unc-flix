import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Film, Tv, BookmarkPlus, Home } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/tv", label: "TV Shows", icon: Tv },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/watchlist", label: "Watchlist", icon: BookmarkPlus },
  ];

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
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" aria-label="Uncleflix Home">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Uncle<span className="text-primary">flix</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1" role="menubar">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                role="menuitem"
                aria-current={location.pathname === l.to ? "page" : undefined}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === l.to
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Search (icon toggle) */}
          <div className="hidden md:flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                  role="search"
                >
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search movies & TV..."
                    aria-label="Search movies and TV shows"
                    className="w-full bg-secondary/80 text-foreground text-sm rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    onBlur={() => !query && setSearchOpen(false)}
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              onClick={() => {
                if (searchOpen && query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  setSearchOpen(false);
                  setQuery("");
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Nav icons (no search icon) */}
          <div className="flex md:hidden items-center gap-1" role="menubar">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                role="menuitem"
                aria-label={l.label}
                aria-current={location.pathname === l.to ? "page" : undefined}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  location.pathname === l.to
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <l.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile search bar — always visible below the navbar on small screens */}
      <div className="md:hidden border-t border-border/30 px-4 py-2">
        <form onSubmit={handleMobileSearch} role="search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Search movies & TV shows..."
              aria-label="Search movies and TV shows"
              className="w-full bg-secondary/80 text-foreground text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>
      </div>
    </nav>
  );
}
