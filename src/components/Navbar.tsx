import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Film, Tv, BookmarkPlus, Home, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import SearchDropdown from "@/components/SearchDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { clearLocalUserData } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut();
    clearLocalUserData();
    toast.success("Signed out");
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/tv", label: "TV Shows", icon: Tv },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/watchlist", label: "Watchlist", icon: BookmarkPlus },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setMobileQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Clear queries on route change
  useEffect(() => {
    setQuery("");
    setMobileQuery("");
    setSearchOpen(false);
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
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setMobileQuery("");
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

          {/* Desktop Search */}
          <div className="hidden md:flex items-center gap-2" ref={desktopSearchRef}>
            <div className="relative">
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSearch}
                    className="overflow-visible"
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
                    />
                    <SearchDropdown
                      query={query}
                      onSelect={() => { setSearchOpen(false); setQuery(""); }}
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
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

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account menu"
                    className="ml-1 h-9 w-9 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-secondary/70 transition"
                  >
                    <span className="text-sm font-semibold">
                      {(user.user_metadata?.display_name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {user.user_metadata?.display_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/watchlist" className="flex items-center gap-2">
                      <BookmarkPlus className="w-4 h-4" /> My Watchlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            )}
          </div>

          {/* Mobile Nav icons */}
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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Account"
                    className="ml-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <span className="text-xs font-semibold">
                      {(user.user_metadata?.display_name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {user.user_metadata?.display_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                aria-label="Sign in"
                className="ml-1 p-2 rounded-lg text-primary"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar with live suggestions */}
      <div className="md:hidden border-t border-border/30 px-4 py-2">
        <div className="relative" ref={mobileSearchRef}>
          <form onSubmit={handleMobileSearch} role="search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                onKeyDown={handleMobileKeyDown}
                placeholder="Search movies & TV shows..."
                aria-label="Search movies and TV shows"
                className="w-full bg-secondary/80 text-foreground text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>
          <SearchDropdown
            query={mobileQuery}
            onSelect={() => setMobileQuery("")}
          />
        </div>
      </div>
    </nav>
  );
}
