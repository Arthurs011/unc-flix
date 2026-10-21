import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Clapperboard, X, Home, Tv, Film, BookmarkPlus, LayoutGrid, Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LAYOUT_TRANSITION, SHEET_TRANSITION, STATE_TRANSITION } from "@/lib/motion";
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

export default function MobileNav({ onOpenShortcuts }: { onOpenShortcuts?: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  // Over the hero the bar is invisible; once the page moves it becomes glass,
  // so the logo never floats on a poster.
  const [scrolled, setScrolled] = useState(false);
  // Held here, not inside SearchBox, so the quick-genre chips can hide as soon
  // as the field has text in it.
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
    // The search query matters here as much as the path: a quick genre chip
    // navigates from /movies to /movies?genre=28, which leaves the pathname
    // untouched. Watching the path alone left the sheet open over the page
    // the user just asked for.
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ===== Top bar ===== */}
      <header
        className={cn(
          "uf-mobile-topbar d-md-none",
          scrolled ? "glass-strong uf-topbar-solid" : "uf-topbar-clear"
        )}
      >
        <div className="d-flex align-items-center justify-content-between px-3" style={{ height: "4rem" }}>
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-white py-2">
            <span className="uf-logo-tile rounded-3 d-inline-flex align-items-center justify-content-center text-white shadow-glow-sm">
              <Clapperboard size={16} />
            </span>
            <span className="fs-6 fw-extrabold fst-normal tracking-tight text-white">
              UNC<span className="text-primary">FLIX</span>
            </span>
          </Link>
          <div className="d-flex align-items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="uf-icon-btn rounded-circle border-0"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              <Search size={20} />
            </button>
            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                aria-label="Keyboard shortcuts"
                className="uf-icon-btn rounded-circle border-0 d-none d-sm-inline-flex"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                <Keyboard size={18} />
              </button>
            )}
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* ===== Bottom dock ===== */}
      <nav className="uf-dock d-md-none" aria-label="Mobile navigation">
        <div className="uf-dock-inner glass-strong">
          {DOCK_LINKS.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-label={l.label}
                aria-current={isActive ? "page" : undefined}
                className={cn("uf-dock-link", isActive && "active")}
              >
                {isActive && (
                  <motion.span
                    layoutId="uf-dock-active"
                    className="uf-dock-active"
                    aria-hidden="true"
                    transition={LAYOUT_TRANSITION}
                  />
                )}
                <l.icon size={20} className="position-relative z-1" />
                <span className="uf-dock-label">{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ===== Search sheet ===== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="uf-search-sheet"
            className="uf-sheet-backdrop d-md-none"
            onClick={() => setSearchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={STATE_TRANSITION}
          >
            <motion.div
              className="uf-sheet"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Search"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SHEET_TRANSITION}
            >
              <div className="pt-safe flex-shrink-0">
                <div className="d-flex justify-content-center pt-3 pb-1">
                  <span className="uf-sheet-grabber" />
                </div>

                <div className="px-3 pb-4 d-flex align-items-center gap-3">
                  <div className="flex-grow-1">
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
                    className="uf-btn uf-btn-glass rounded-4 border-0"
                    style={{ width: "3rem", height: "3rem", padding: 0 }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {!query && (
                  <div className="px-3 pb-3 d-flex gap-2 overflow-x-auto scrollbar-hide">
                    {QUICK_GENRES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => navigate(`/movies?genre=${g.id}`)}
                        className="uf-chip uf-chip-sm"
                        style={{ padding: "0.625rem 1rem" }}
                      >
                        <LayoutGrid size={13} className="text-primary" />
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-grow-1 overflow-y-auto scrollbar-hide px-3 pb-safe" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
