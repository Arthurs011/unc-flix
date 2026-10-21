import { Link } from "react-router-dom";
import { Bookmark, TriangleAlert } from "lucide-react";
import PageShell from "@/components/PageShell";
import WatchlistCard from "@/components/WatchlistCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useWatchlist, useWatchlistPersistent } from "@/hooks/useWatchlist";
import { Movie } from "@/lib/tmdb";
import { titleType } from "@/lib/watchlistSync";
import { removeFromWatchlist } from "@/lib/storage";
import { revealNow } from "@/lib/anim";
import { useEffect, useRef } from "react";

export default function Watchlist() {
  usePageTitle("My List");
  const list = useWatchlist();
  const persistent = useWatchlistPersistent();
  const headerRef = useRef<HTMLElement>(null);

  // Header entrance on mount. The cards themselves carry an inline,
  // index-based CSS animation — a CSS animation always completes on its own,
  // so the grid can never be stranded at opacity 0 the way a variant label
  // used to strand it on a client-side route change.
  useEffect(() => revealNow(headerRef.current, { y: 18, duration: 500 }), []);

  const handleRemove = (m: Movie) => removeFromWatchlist(m.id, titleType(m));

  return (
    <PageShell className="min-vh-100 pt-safe" style={{ paddingTop: "7rem", paddingBottom: "9rem" }}>
      <div className="page-container" style={{ maxWidth: "100rem" }}>
        <header ref={headerRef} className="d-flex align-items-end justify-content-between gap-4 mb-5">
          <div>
            <p className="kicker d-flex align-items-center gap-2 mb-2">
              <Bookmark size={13} className="fill-current" />
              Your Library
            </p>
            <h1 className="fw-black text-white mb-0" style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)", letterSpacing: "-0.05em", lineHeight: 1 }}>
              Watchlist
            </h1>
          </div>
          <div className="d-none d-sm-flex align-items-center gap-2 rounded-pill px-4 py-2 flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bookmark size={14} className="text-primary fill-current" />
            <span className="small fw-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
              {list.length} {list.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </header>

        {!persistent && (
          <div role="status" className="d-flex align-items-start gap-3 rounded-4 px-4 py-3 mb-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
            <TriangleAlert size={20} style={{ color: "#fbbf24" }} className="flex-shrink-0 mt-1" />
            <p className="mb-0 small" style={{ color: "rgba(254,243,199,0.9)", lineHeight: 1.7 }}>
              This browser is not saving your library, so titles added here disappear when you
              close the tab. Private browsing and full storage both cause this. Sign in to keep
              your watchlist on your account, or clear this site's data in your browser settings.
            </p>
          </div>
        )}

        {list.length === 0 ? (
          <div className="text-center rounded-4 mx-auto" style={{ padding: "7rem 1rem", maxWidth: "36rem", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Bookmark size={56} style={{ color: "rgba(255,255,255,0.15)" }} className="mx-auto mb-4" />
            <h2 className="fw-extrabold mb-2" style={{ fontSize: "1.25rem", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.5)" }}>
              Your watchlist is empty
            </h2>
            <p className="mb-4 mx-auto" style={{ maxWidth: "20rem", color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>
              Start adding movies and TV shows to keep track of what you want to watch next.
            </p>
            <Link to="/" className="btn-gradient btn uf-btn-md rounded-pill text-decoration-none">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="row g-3 g-sm-4 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">
            {list.map((m, i) => (
              <div className="col" key={`${titleType(m)}:${m.id}`}>
                <WatchlistCard
                  movie={m}
                  type={titleType(m)}
                  index={i}
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
