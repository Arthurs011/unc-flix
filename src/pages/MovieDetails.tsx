import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, ArrowLeft, X, Film, Clock } from "lucide-react";
import { tmdb, Movie, Review, MovieDetails as MD, imgUrl, posterUrl, getTitle, getYear } from "@/lib/tmdb";
import { addRecentlyViewed } from "@/lib/storage";
import { useWatchlistItem } from "@/hooks/useWatchlist";
import PageShell from "@/components/PageShell";
import ScrollProgress from "@/components/ScrollProgress";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import ContentRow from "@/components/ContentRow";
import ReviewsSection from "@/components/ReviewsSection";
import { revealNow, revealOnView, revealStagger, prefersReducedMotion } from "@/lib/anim";
import "@/styles/details.css";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [show, setShow] = useState<MD | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const backdropImgRef = useRef<HTMLImageElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLElement>(null);

  const showId = show?.id;

  const movieForList: Movie | null = show ? { ...show, media_type: "movie" } : null;
  const { saved: inWL, toggle } = useWatchlistItem(movieForList);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tmdb.movieDetails(Number(id))
      .then((d) => {
        setShow(d);
        addRecentlyViewed({ ...d, media_type: "movie" });
        const videos = d.videos?.results ?? [];
        const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer")
          ?? videos.find((v) => v.site === "YouTube");
        setTrailerKey(trailer?.key ?? null);
      })
      .catch(() => setShow(null))
      .finally(() => setLoading(false));
    tmdb.movieRecommendations(Number(id))
      .then((d) => setSimilar((d.results ?? []).filter((m) => m.poster_path)))
      .catch(() => setSimilar([]));
    tmdb.movieReviews(Number(id))
      .then((d) => setReviews(d.results ?? []))
      .catch(() => setReviews([]));
  }, [id]);

  // Backdrop parallax: rAF-throttled scroll listener writing translate3d on the
  // <img> directly. Fully skipped under prefers-reduced-motion.
  useEffect(() => {
    if (!showId || prefersReducedMotion()) return;
    const wrap = backdropRef.current;
    const img = backdropImgRef.current;
    if (!wrap || !img) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const h = rect.height || 1;
      const progress = Math.min(Math.max(-rect.top / h, 0), 1);
      img.style.transform = `translate3d(0, ${progress * 25}%, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [showId]);

  // Hero entrance: poster rise + staggered info items.
  useEffect(() => {
    if (!showId) return;
    revealNow(posterRef.current, { y: 30, duration: 600 });
    if (infoRef.current) {
      revealStagger(Array.from(infoRef.current.children), { step: 70, y: 16, duration: 500 });
    }
  }, [showId]);

  // Cast section reveals the first time it scrolls into view.
  useEffect(() => {
    if (!showId) return;
    return revealOnView(castRef.current);
  }, [showId]);

  if (loading) return <DetailSkeleton />;
  if (!show) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center pt-5">
      <div className="text-center">
        <h2 className="fs-3 fw-extrabold text-white mb-3">Movie not found</h2>
        <Link to="/" className="text-primary fw-bold text-uppercase text-decoration-none uf-ghost-link">Go Home</Link>
      </div>
    </div>
  );

  const cast = show.credits?.cast?.slice(0, 15) ?? [];

  return (
    <PageShell className="min-vh-100" style={{ paddingBottom: "8rem" }}>
      <ScrollProgress />
      {/* Trailer modal */}
      {showTrailer && trailerKey && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Trailer"
          className="uf-trailer-overlay"
          onClick={() => setShowTrailer(false)}
        >
          <div className="uf-trailer-frame" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-100 h-100"
              style={{ border: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
              className="uf-trailer-close glass"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div ref={backdropRef} className="uf-details-hero">
        <div className="uf-details-hero-imgwrap">
          <img
            ref={backdropImgRef}
            src={imgUrl(show.backdrop_path, "w1280", true)}
            alt=""
            className="uf-details-hero-img"
          />
        </div>
        <div className="uf-details-hero-scrim" />
        <Link to="/" aria-label="Back to home" className="uf-details-back glass">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="uf-details-body">
        <div className="uf-details-grid">
          <div ref={posterRef} className="uf-details-poster-col">
            <img
              src={posterUrl(show, "w500")}
              alt={getTitle(show)}
              className="uf-details-poster"
            />
          </div>

          <div ref={infoRef} className="uf-details-info">
            <p className="kicker uf-kicker-block">
              Feature Film
            </p>

            <h1 className="uf-details-title">
              {getTitle(show)}
            </h1>

            <div className="uf-details-meta">
              {show.vote_average > 0 && (
                <span className="uf-meta-rating">
                  <Star size={16} className="uf-star" />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
              {getYear(show) && (
                <>
                  <span className="uf-meta-dot" />
                  <span>{getYear(show)}</span>
                </>
              )}
              {show.runtime ? (
                <>
                  <span className="uf-meta-dot" />
                  <span className="uf-meta-runtime">
                    <Clock size={14} />
                    {Math.floor(show.runtime / 60)}h {show.runtime % 60}m
                  </span>
                </>
              ) : null}
              {show.genres?.slice(0, 3).map((g) => (
                <span key={g.id} className="uf-genre-chip">
                  {g.name}
                </span>
              ))}
            </div>

            <p className="uf-details-overview">
              {show.overview}
            </p>

            <div className="uf-details-actions">
              <Link
                to={`/watch/movie/${show.id}`}
                className="uf-btn uf-btn-lg btn-gradient shadow-glow-lg uf-btn-pill uf-fill-icon"
              >
                <Play size={20} />
                Play Now
              </Link>

              {trailerKey && (
                <button
                  type="button"
                  onClick={() => setShowTrailer(true)}
                  className="uf-btn uf-btn-lg uf-btn-glass uf-btn-pill"
                >
                  <Film size={20} />
                  Trailer
                </button>
              )}

              <button
                type="button"
                onClick={toggle}
                aria-label={inWL ? "Remove from watchlist" : "Add to watchlist"}
                className="uf-btn uf-btn-glass uf-btn-round"
              >
                {inWL ? <Check size={20} className="uf-check" /> : <Plus size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <section ref={castRef} className="uf-details-section">
            <p className="kicker uf-kicker-block">Starring</p>
            <h2 className="uf-section-title mb-4">Top Cast</h2>
            <div className="uf-cast-rail scrollbar-hide">
              {cast.map((c, i) => (
                <div key={c.id} className="uf-cast-card content-card" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="uf-cast-photo">
                    <img
                      src={imgUrl(c.profile_path, "w185")}
                      alt={c.name}
                      loading="lazy"
                      className="uf-cast-img"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <p className="uf-cast-name line-clamp-1">{c.name}</p>
                  <p className="uf-cast-role line-clamp-1">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <ReviewsSection reviews={reviews} />

        {similar.length > 0 && (
          <section className="mb-5">
            <ContentRow title="More Like This" kicker="If you liked this" movies={similar} />
          </section>
        )}
      </div>
    </PageShell>
  );
}
