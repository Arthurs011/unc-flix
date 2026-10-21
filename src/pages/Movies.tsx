import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Movie, Genre, tmdb } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import ContentRow from "@/components/ContentRow";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { revealNow, revealStagger } from "@/lib/anim";
import { SlidersHorizontal, Check, Clapperboard, Loader2 } from "lucide-react";
import "@/styles/browse.css";

export default function MoviesPage() {
  usePageTitle("Movies");
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");

  const handleGenreSelect = (id: number | null) => {
    if (id === null) {
      searchParams.delete("genre");
    } else {
      searchParams.set("genre", id.toString());
    }
    setSearchParams(searchParams);
  };

  const [movies, setMovies] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    genreIdParam ? Number(genreIdParam) : null
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tmdb.movieGenres()
      .then((d) => setGenres(d.genres ?? []))
      .catch(() => setGenres([]));
    tmdb.trending()
      .then((d) => setTrending((d.results ?? []).slice(0, 10)))
      .catch(() => setTrending([]));
  }, []);

  useEffect(() => {
    setSelectedGenre(genreIdParam ? Number(genreIdParam) : null);
  }, [genreIdParam]);

  const fetchMovies = useCallback(async (p: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await tmdb.popular(p, selectedGenre ?? undefined);

      setMovies((prev) => (reset ? res.results ?? [] : [...prev, ...(res.results ?? [])]));
      setTotalPages(res.total_pages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    setPage(1);
    fetchMovies(1, true);
  }, [selectedGenre, fetchMovies]);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(page, false);
    }
  }, [page, fetchMovies]);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "800px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages]);

  // Header entrance on mount.
  useEffect(() => revealNow(headerRef.current, { y: 18, duration: 500 }), []);

  // Card stagger when a fresh grid mounts (initial load or genre change).
  // Appending a page does not re-trigger it, so loaded cards never re-fade.
  useEffect(() => {
    if (loading || !gridRef.current) return;
    revealStagger(Array.from(gridRef.current.children), { step: 40, y: 18, duration: 450 });
  }, [loading, selectedGenre]);

  return (
    <PageShell className="min-vh-100 uf-browse-top" style={{ paddingBottom: "7rem" }}>
      <div className="page-container" style={{ maxWidth: "100rem" }}>
        <header
          ref={headerRef}
          className="mb-5 d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-4"
        >
          <div>
            <p className="kicker d-flex align-items-center gap-2 mb-2">
              <Clapperboard size={14} />
              Cinema Hub
            </p>
            <h1
              className="fw-black text-white mb-3"
              style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)", letterSpacing: "-0.05em", lineHeight: 1 }}
            >
              Movies
            </h1>
            <p
              className="text-uppercase fw-bold mb-0"
              style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)" }}
            >
              Exploring {selectedGenre ? genres.find((g) => g.id === selectedGenre)?.name ?? "Everything" : "Everything"}
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "uf-btn uf-btn-md rounded-pill text-uppercase",
                showFilters ? "btn-gradient" : "uf-btn-ghost"
              )}
              style={{ fontSize: "11px", letterSpacing: "0.12em" }}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <div
              className="d-none d-sm-flex align-items-center gap-2 rounded-pill px-4 py-2 text-uppercase fw-bold flex-shrink-0"
              style={{
                fontSize: "11px",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {movies.length} Results
            </div>
          </div>
        </header>

        {!selectedGenre && trending.length > 0 && (
          <ContentRow
            title="Trending This Week"
            kicker="Top 10 in Cinema"
            movies={trending}
            showRank
            className="mb-5"
          />
        )}

        <div className="d-flex flex-column flex-lg-row gap-4 gap-lg-5">
          {/* Filter sidebar */}
          {showFilters && (
            <aside className="uf-filter-aside uf-panel-in">
              <h3 className="kicker mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Genres
              </h3>
              <div
                className="row row-cols-2 row-cols-lg-1 g-2 scrollbar-hide"
                style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "0.25rem" }}
              >
                {[{ id: null as number | null, name: "All Categories" }, ...genres].map((g) => (
                  <div className="col" key={g.name}>
                    <button
                      onClick={() => handleGenreSelect(g.id)}
                      className={cn(
                        "uf-chip uf-chip-sm w-100 justify-content-between text-start",
                        selectedGenre === g.id && "active"
                      )}
                      style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                    >
                      {g.name}
                      <Check size={16} className={selectedGenre === g.id ? undefined : "invisible"} />
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          )}

          {/* Grid */}
          <main className="flex-grow-1" style={{ minWidth: 0 }}>
            {loading ? (
              <GridSkeleton />
            ) : movies.length === 0 ? (
              <div
                className="text-center rounded-4"
                style={{ padding: "7rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}
              >
                <Clapperboard size={56} style={{ color: "rgba(255,255,255,0.15)" }} className="mx-auto mb-4" />
                <h2
                  className="fw-extrabold mb-5"
                  style={{ fontSize: "1.25rem", letterSpacing: "-0.02em", color: "rgba(255,255,255,0.4)" }}
                >
                  No matches found
                </h2>
                <button
                  onClick={() => handleGenreSelect(null)}
                  className="btn btn-link p-0 text-uppercase fw-bold text-primary text-decoration-none uf-link-underline"
                  style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                key={selectedGenre ?? "all"}
                ref={gridRef}
                className="row g-3 g-sm-4 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6"
              >
                {movies.map((m) => (
                  <div className="col" key={m.id}>
                    <MovieCard movie={m} />
                  </div>
                ))}
              </div>
            )}

            <div ref={observerRef} className="py-5 d-flex justify-content-center">
              {loadingMore && (
                <div className="d-flex flex-column align-items-center gap-3">
                  <Loader2 size={32} className="text-primary spin" />
                  <span
                    className="text-uppercase fw-bold"
                    style={{ fontSize: "10px", letterSpacing: "0.35em", color: "rgba(255,255,255,0.25)" }}
                  >
                    Loading more
                  </span>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}
