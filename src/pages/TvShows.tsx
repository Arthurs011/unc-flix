import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Movie, tmdb, imgUrl } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import ContentRow from "@/components/ContentRow";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { revealNow, revealOnView, revealStagger } from "@/lib/anim";
import { Star, Play, Tv, Loader2 } from "lucide-react";
import "@/styles/browse.css";

const MOOD_PILLS = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
];

export default function TvShowsPage() {
  usePageTitle("Series");
  const [searchParams, setSearchParams] = useSearchParams();
  const genreIdParam = searchParams.get("genre");

  const [shows, setShows] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<Movie[]>([]);
  const [heroShow, setHeroShow] = useState<Movie | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(
    genreIdParam ? Number(genreIdParam) : null
  );
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedGenre(genreIdParam ? Number(genreIdParam) : null);
  }, [genreIdParam]);

  useEffect(() => {
    tmdb.tvTrending()
      .then((d) => setTrendingTv((d.results ?? []).slice(0, 10)))
      .catch(() => setTrendingTv([]));
  }, []);

  const fetchShows = useCallback(async (p: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await tmdb.tvPopular(p, selectedGenre ?? undefined);

      if (reset && res.results?.length) {
        setHeroShow(res.results[0]);
      }

      setShows((prev) => (reset ? res.results ?? [] : [...prev, ...(res.results ?? [])]));
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
    fetchShows(1, true);
  }, [selectedGenre, fetchShows]);

  useEffect(() => {
    if (page > 1) {
      fetchShows(page, false);
    }
  }, [page, fetchShows]);

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

  const handleGenreSelect = (id: number | null) => {
    if (id === null) {
      searchParams.delete("genre");
    } else {
      searchParams.set("genre", id.toString());
    }
    setSearchParams(searchParams);
  };

  // Spotlight hero entrance: fade the section, then stagger the content.
  // Everything is visible by default; the reveal only dips it to opacity 0
  // when it actually runs. The backdrop zoom is a CSS animation (.uf-tv-zoom).
  useEffect(() => {
    if (!heroShow || genreIdParam) return;
    revealNow(heroRef.current, { y: 0, duration: 600 });
    const kids = heroContentRef.current ? Array.from(heroContentRef.current.children) : [];
    revealStagger(kids, { step: 80, y: 18, duration: 500 });
  }, [heroShow, genreIdParam]);

  // Header reveals the first time it scrolls into view.
  useEffect(() => revealOnView(headerRef.current, { y: 18, duration: 500 }), []);

  // Card stagger when a fresh grid mounts (initial load or genre change).
  useEffect(() => {
    if (loading || !gridRef.current) return;
    revealStagger(Array.from(gridRef.current.children), { step: 40, y: 18, duration: 450 });
  }, [loading, selectedGenre]);

  return (
    <PageShell className="min-vh-100" style={{ paddingBottom: "8rem" }}>
      {/* Hero spotlight */}
      {heroShow && !genreIdParam && (
        <section key={heroShow.id} ref={heroRef} className="uf-tv-hero position-relative w-100 overflow-hidden">
          <img
            src={imgUrl(heroShow.backdrop_path, "w1280", true)}
            className="uf-tv-zoom position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            alt=""
          />
          <div className="uf-hero-scrim-bottom" />
          <div className="uf-hero-scrim-left" />

          <div
            ref={heroContentRef}
            className="uf-tv-hero-content position-absolute bottom-0 start-0 end-0 z-1 mx-auto"
            style={{ maxWidth: "80rem" }}
          >
            <div className="d-flex align-items-center gap-3 mb-3">
              <span
                className="rounded-pill btn-gradient px-3 text-uppercase fw-bold flex-shrink-0"
                style={{ fontSize: "10px", letterSpacing: "0.2em", paddingTop: "0.375rem", paddingBottom: "0.375rem" }}
              >
                Trending Series
              </span>
              <span
                className="d-flex align-items-center gap-1 fw-bold"
                style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)" }}
              >
                <Star size={14} style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                {heroShow.vote_average.toFixed(1)}
              </span>
            </div>

            <h2
              className="fw-black text-white mb-4"
              style={{
                fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                maxWidth: "64rem",
              }}
            >
              {heroShow.name}
            </h2>

            <div>
              <Link
                to={`/tv/${heroShow.id}`}
                className="uf-btn uf-btn-md btn-gradient rounded-pill text-decoration-none"
              >
                <Play size={20} style={{ fill: "currentColor" }} />
                Start Series
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className={cn("page-container", genreIdParam ? "uf-browse-top" : "uf-tv-overlap")}>
        <header ref={headerRef} className="mb-4">
          <p className="kicker d-flex align-items-center gap-2 mb-2">
            <Tv size={14} />
            Series Hub
          </p>
          <h1
            className="fw-black text-white mb-4"
            style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)", letterSpacing: "-0.05em", lineHeight: 1 }}
          >
            {selectedGenre ? MOOD_PILLS.find((p) => p.id === selectedGenre)?.name ?? "Series" : "TV Shows"}
          </h1>

          {/* Genre pills */}
          <div className="d-flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {[{ id: null as number | null, name: "All Series" }, ...MOOD_PILLS].map((g) => (
              <button
                key={g.name}
                onClick={() => handleGenreSelect(g.id)}
                className={cn("uf-chip uf-chip-sm", selectedGenre === g.id && "active")}
              >
                {g.name}
              </button>
            ))}
          </div>
        </header>

        {!selectedGenre && trendingTv.length > 0 && (
          <ContentRow
            title="Trending Series This Week"
            kicker="Top 10 on TV"
            movies={trendingTv}
            type="tv"
            showRank
            className="mb-5"
          />
        )}

        <main>
          {loading ? (
            <GridSkeleton count={12} />
          ) : (
            <div
              key={selectedGenre ?? "all"}
              ref={gridRef}
              className="row g-3 g-sm-4 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6"
            >
              {shows.map((m) => (
                <div className="col" key={m.id}>
                  <MovieCard movie={m} type="tv" />
                </div>
              ))}
            </div>
          )}

          <div ref={observerRef} className="py-5 d-flex flex-column align-items-center justify-content-center gap-3">
            {loadingMore && (
              <>
                <Loader2 size={32} className="text-primary spin" />
                <span
                  className="text-uppercase fw-bold"
                  style={{ fontSize: "10px", letterSpacing: "0.35em", color: "rgba(255,255,255,0.25)" }}
                >
                  Loading more
                </span>
              </>
            )}
            {!loading && page >= totalPages && (
              <span
                className="text-uppercase fw-bold"
                style={{ fontSize: "10px", letterSpacing: "0.35em", color: "rgba(255,255,255,0.2)" }}
              >
                End of library
              </span>
            )}
          </div>
        </main>
      </div>
    </PageShell>
  );
}
