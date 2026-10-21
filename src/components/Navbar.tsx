import { Link, useLocation } from "react-router-dom";
import { Search, Clapperboard, LayoutGrid, ChevronDown, BookmarkPlus, Home, Tv, Film, Keyboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { revealNow } from "@/lib/anim";
import { STATE_TRANSITION } from "@/lib/motion";
import SearchBox from "@/components/SearchBox";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";
import MobileNav from "@/components/MobileNav";
import AccountMenu from "@/components/AccountMenu";

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

export default function Navbar({ onOpenShortcuts }: { onOpenShortcuts?: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const location = useLocation();

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const browseMenuRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setBrowseOpen(false);
  }, [location.pathname]);

  // Entrance reveal for the floating pill.
  useEffect(() => {
    revealNow(pillRef.current, { y: -40, duration: 550 });
  }, []);

  const navHidden = useAutoHideNav();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (location.pathname.startsWith("/watch/") || /^\/watch\/?$/.test(location.pathname)) return null;

  return (
    <>
      <MobileNav onOpenShortcuts={onOpenShortcuts} />

      {/* ===== Desktop floating pill nav ===== */}
      <nav
        className={cn(
          "uf-topnav position-fixed top-0 start-0 end-0 z-50 d-none d-md-flex justify-content-center pointer-events-none pt-3",
          navHidden && "uf-topnav-hidden",
          scrolled && "uf-scrolled"
        )}
        aria-label="Desktop navigation"
      >
        <div ref={pillRef} className="uf-nav-pill pointer-events-auto d-flex align-items-center gap-1 rounded-pill glass-strong px-2 shadow-card">
          <Link to="/" className="uf-nav-brand d-flex align-items-center gap-2 me-3 text-decoration-none text-white">
            <span className="uf-logo-tile rounded-3 d-inline-flex align-items-center justify-content-center text-white shadow-glow-sm">
              <Clapperboard size={16} />
            </span>
            <span className="uf-nav-wordmark fs-5 fw-extrabold fst-normal tracking-tight text-white">
              UNC<span className="text-primary">FLIX</span>
            </span>
          </Link>

          <div className="d-flex align-items-center">
            {LINKS.slice(0, 3).map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "uf-nav-link position-relative rounded-pill px-3 py-2 me-1 text-uppercase",
                    isActive ? "text-white active" : "text-white-50"
                  )}
                >
                  {isActive && <span className="uf-nav-active rounded-pill" aria-hidden="true" />}
                  <span className="position-relative z-1">{l.label}</span>
                </Link>
              );
            })}

            {/* Browse dropdown */}
            <div className="position-relative" ref={browseRef}>
              <button
                onClick={() => setBrowseOpen((o) => !o)}
                aria-expanded={browseOpen}
                aria-haspopup="true"
                className={cn(
                  "uf-nav-link d-inline-flex align-items-center gap-1 border-0 rounded-pill px-3 py-2 text-uppercase",
                  browseOpen ? "text-white bg-body-secondary" : "text-white-50"
                )}
              >
                Browse
                <ChevronDown
                  size={13}
                  className={cn("transition-transform duration-300", browseOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence>
                {browseOpen && (
                  <motion.div
                    key="uf-browse-menu"
                    ref={browseMenuRef}
                    className="uf-dropdown glass-strong rounded-4 shadow-card-lg p-2"
                    initial={{ opacity: 0, x: "-50%", y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: "-50%", y: 6, scale: 0.98 }}
                    transition={STATE_TRANSITION}
                  >
                    <p className="uf-dropdown-kicker px-2 pt-1 pb-1 mb-1 text-uppercase">Popular Genres</p>
                    {QUICK_GENRES.map((g) => (
                      <Link
                        key={g.id}
                        to={`/movies?genre=${g.id}`}
                        onClick={() => setBrowseOpen(false)}
                        className="uf-menu-item d-flex align-items-center gap-2 px-2 py-2 rounded-3 text-white-50 text-decoration-none small fw-semibold"
                      >
                        <LayoutGrid size={13} className="text-primary" />
                        {g.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right cluster */}
          <div className="d-flex align-items-center gap-1 ms-3 position-relative" ref={searchWrapRef}>
            {searchOpen && (
              <div className="uf-nav-search">
                <SearchBox
                  variant="pill"
                  autoFocus
                  onSubmitted={() => setSearchOpen(false)}
                  onDismiss={() => setSearchOpen(false)}
                />
              </div>
            )}

            {!searchOpen && (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="uf-icon-btn rounded-pill border-0 text-white-50"
              >
                <Search size={20} />
              </button>
            )}

            <Link
              to="/watchlist"
              aria-label="Watchlist"
              className={cn(
                "uf-icon-btn rounded-pill border-0 text-decoration-none",
                location.pathname === "/watchlist"
                  ? "text-primary bg-primary bg-opacity-10"
                  : "text-white-50"
              )}
            >
              <BookmarkPlus size={20} />
            </Link>

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
                className="uf-icon-btn rounded-pill border-0 d-none d-lg-inline-flex text-white-50"
              >
                <Keyboard size={18} />
              </button>
            )}

            <AccountMenu />
          </div>
        </div>
      </nav>
    </>
  );
}
