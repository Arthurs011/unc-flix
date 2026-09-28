import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Bookmark, Film, House, Search, Tv, X } from "lucide-react";
import SearchDropdown from "@/components/SearchDropdown";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";
import { EASE } from "@/lib/motion";

const DOCK_ITEMS = [
  { label: "Home", href: "/", icon: House },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Series", href: "/tv", icon: Tv },
  { label: "Search", href: "/search", icon: Search },
  { label: "My List", href: "/watchlist", icon: Bookmark },
];

export default function MobileNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const hidden = useAutoHideNav(220);

  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [searchOpen]);

  if (pathname.startsWith("/watch/")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/movies") return pathname === "/movies" || pathname.startsWith("/movie/");
    if (href === "/tv") return pathname === "/tv" || pathname.startsWith("/tv/");
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: hidden && !searchOpen ? -72 : 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={`pointer-events-none fixed inset-x-0 top-0 px-4 pt-[calc(0.6rem+env(safe-area-inset-top,0px))] transition-[z-index] md:hidden ${
          searchOpen ? "z-[70]" : "z-50"
        }`}
      >
        <div
          className={`pointer-events-auto flex h-12 items-center justify-between rounded-xl px-3 transition-all duration-300 ${
            scrolled || searchOpen
              ? "border border-white/[0.07] bg-[#07080c]/90 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              : "border border-transparent bg-transparent"
          }`}
        >
          {searchOpen ? (
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="tap-target -ml-1 flex items-center justify-center rounded-lg text-white/60 transition-colors hover:text-white"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2" aria-label="UNCFLIX home">
              <span className="text-sm font-black tracking-[-0.055em] text-white">
                UNC<span className="text-primary">FLIX</span>
              </span>
            </Link>
          )}

          {searchOpen ? (
            <span className="mr-auto ml-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Search archive
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="tap-target -mr-1 flex items-center justify-center rounded-lg text-white/55 transition-colors hover:text-white"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search the archive"
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-[60] bg-[#06070a]/95 px-4 pb-6 pt-[calc(5rem+env(safe-area-inset-top,0px))] backdrop-blur-2xl md:hidden"
          >
            <div onClick={(event) => event.stopPropagation()} className="mx-auto w-full max-w-lg">
              <SearchDropdown
                query={query}
                onQueryChange={setQuery}
                onSelect={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden pointer-events-none"
      >
        <div className="pointer-events-auto mx-auto grid h-[3.85rem] max-w-sm grid-cols-5 items-center rounded-2xl border border-white/[0.08] bg-[#090b10]/92 px-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          {DOCK_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            if (item.label === "Search") {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className={`tap-target relative flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                    active || searchOpen ? "text-white" : "text-white/40 hover:text-white/75"
                  }`}
                  aria-label="Search"
                >
                  <Icon className="h-5 w-5" strokeWidth={active || searchOpen ? 2.2 : 1.8} />
                  <span className={`text-[10px] font-medium tracking-tight ${active || searchOpen ? "text-primary" : ""}`}>
                    {item.label}
                  </span>
                  {(active || searchOpen) && (
                    <motion.span
                      layoutId="mobile-dock-dot"
                      className="absolute top-1 h-1 w-1 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`tap-target relative flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  active ? "text-white" : "text-white/40 hover:text-white/75"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span className={`text-[10px] font-medium tracking-tight ${active ? "text-primary" : ""}`}>
                  {item.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="mobile-dock-dot"
                    className="absolute top-1 h-1 w-1 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
