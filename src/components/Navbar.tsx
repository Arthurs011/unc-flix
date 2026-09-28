import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import SearchDropdown from "@/components/SearchDropdown";
import MobileNav from "@/components/MobileNav";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";
import { EASE } from "@/lib/motion";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Series", href: "/tv" },
  { label: "My List", href: "/watchlist" },
];

const BROWSE_ITEMS = [
  { label: "Anime", description: "Animation from every era", href: "/anime" },
  { label: "Marvel", description: "A connected cinematic universe", href: "/marvel" },
  { label: "Animated", description: "Hand-drawn and beyond", href: "/animated" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hidden = useAutoHideNav(160);
  const browseRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setScrolled(latest > 24));

  useEffect(() => {
    setBrowseOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setBrowseOpen(false);
        setSearchOpen(true);
        return;
      }
      if (event.key === "Escape") {
        setBrowseOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!browseOpen || browseRef.current?.contains(event.target as Node)) return;
      setBrowseOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [browseOpen]);

  if (pathname.startsWith("/watch/")) return null;

  const submitSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  return (
    <>
      <MobileNav />
      <nav className="fixed inset-x-0 top-0 z-50 hidden md:block" aria-label="Primary navigation">
      <AnimatePresence>
        {searchOpen && (
          <motion.button
            type="button"
            aria-label="Close search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <motion.header
        animate={{
          y: hidden ? -80 : 0,
          backgroundColor: scrolled || browseOpen ? "rgba(6, 7, 10, 0.82)" : "rgba(6, 7, 10, 0)",
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className={`relative z-50 border-b transition-all duration-300 ${
          scrolled || browseOpen ? "border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl" : "border-transparent"
        }`}
      >
        <div className="section-shell relative flex h-16 items-center justify-between gap-6">
          <div className="flex shrink-0 items-center gap-4">
            <Link to="/" className="group flex items-center gap-2.5" aria-label="UNCFLIX home">
              <span className="text-[15px] font-black tracking-[-0.055em] text-white">
                UNC<span className="text-primary">FLIX</span>
              </span>
              <span className="h-4 w-px bg-white/15" />
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35 xl:inline">
                Cinematic archive
              </span>
            </Link>
          </div>

          <div className="flex h-full items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((item) => {
              const isMoviesActive = item.href === "/movies" && (pathname === "/movies" || pathname.startsWith("/movie/"));
              const isTvActive = item.href === "/tv" && (pathname === "/tv" || pathname.startsWith("/tv/"));
              const active = item.href === "/" ? pathname === "/" : isMoviesActive || isTvActive || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative flex h-full items-center px-3.5 text-[13px] font-medium tracking-tight transition-colors ${
                    active ? "text-white" : "text-white/50 hover:text-white/90"
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active"
                      className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-primary"
                      transition={{ duration: 0.25, ease: EASE }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-label={searchOpen ? "Close search" : "Open search (Press ⌘K)"}
                aria-expanded={searchOpen}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  searchOpen
                    ? "bg-white/[0.1] text-white"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute right-0 top-[calc(100%+0.65rem)] w-[min(92vw,27rem)]"
                  >
                    <SearchDropdown
                      query={query}
                      onQueryChange={setQuery}
                      onSelect={() => {
                        setSearchOpen(false);
                        setQuery("");
                      }}
                      onSubmit={submitSearch}
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={browseRef} className="relative">
              <button
                type="button"
                onClick={() => setBrowseOpen((open) => !open)}
                aria-expanded={browseOpen}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors ${
                  browseOpen ? "bg-white/[0.08] text-white" : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span>Explore</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${browseOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {browseOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="glass-strong absolute right-0 top-[calc(100%+0.65rem)] w-72 overflow-hidden rounded-2xl p-2 shadow-cinema"
                  >
                    <p className="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
                      Curated worlds
                    </p>
                    {BROWSE_ITEMS.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.055]"
                      >
                        <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-white/85 transition-colors group-hover:text-white">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-white/35">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>
      </nav>
    </>
  );
}
