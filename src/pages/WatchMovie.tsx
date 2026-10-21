import { useParams, Link } from "react-router-dom";
import { Star, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, imgUrl, posterUrl, Movie, MovieDetails, formatCount, getYear } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import ScrollProgress from "@/components/ScrollProgress";
import WatchHeader from "@/components/WatchHeader";
import { revealNow } from "@/lib/anim";
import "@/styles/watch.css";

const CINESRC_ORIGIN = SOURCES[0].baseUrl;

export default function WatchMovie() {
  const { id } = useParams();
  useFullscreenOrientation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const lastSaveRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0 });

    tmdb.movieDetails(Number(id)).then((m) => {
      setMovie(m);
      document.title = `Watch ${getTitle(m)} · UNCFLIX`;
    }).catch(() => setMovie(null))
      .finally(() => setLoading(false));

    tmdb.movieRecommendations(Number(id)).then((res) => {
      setRecommendations((res.results ?? []).slice(0, 10));
    }).catch(() => setRecommendations([]));

    return () => { document.title = "UNCFLIX"; };
  }, [id]);

  // Entrances: content is visible by default; anime.js only fades it in.
  useEffect(() => {
    revealNow(stageRef.current, { y: 24, duration: 550 });
    revealNow(infoRef.current, { y: 20, duration: 500, delay: 150 });
  }, []);

  useEffect(() => {
    if (recommendations.length > 0) {
      revealNow(asideRef.current, { y: 24, duration: 550, delay: 100 });
    }
  }, [recommendations.length]);

  // CineSrc progress sync
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CINESRC_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "cinesrc:timeupdate" && typeof data.currentTime === "number" && typeof data.duration === "number" && data.duration > 0 && id) {
        const now = Date.now();
        if (now - lastSaveRef.current < 15000 || !movie) return;
        lastSaveRef.current = now;
        updateContinueWatching({
          id: Number(id),
          type: "movie",
          title: getTitle(movie),
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          progress: Math.min(100, Math.round((data.currentTime / data.duration) * 100)),
          timestamp: now,
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id, movie]);

  const embedSrc = SOURCES[0].build("movie", id || "");

  if (!loading && !movie) {
    return (
      <PageShell className="min-vh-100 d-flex align-items-center justify-content-center px-3">
        <div className="text-center">
          <h2 className="fw-extrabold text-white mb-3" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>Title not found</h2>
          <Link to="/" className="text-decoration-none fw-bold text-uppercase" style={{ color: "var(--uf-primary)", fontSize: "0.75rem", letterSpacing: "0.1em" }}>Go Home</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="min-vh-100 text-white uf-watch-shell">
      {/* Ambient backdrop */}
      <div className="uf-watch-ambient" aria-hidden="true">
        {movie?.backdrop_path && (
          <img
            src={imgUrl(movie.backdrop_path, "w1280", true)}
            alt=""
          />
        )}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.85), #000)" }} />
      </div>

      {/* Floating pill header */}
      <ScrollProgress />

      <WatchHeader
        to={`/movie/${id}`}
        label="Feature Film"
        title={movie ? getTitle(movie) : "Loading..."}
      />

      {/* Two-column cinema layout */}
      <div className="uf-watch-main">
        <div className="uf-watch-grid">

          {/* ===== Left: stage + info ===== */}
          <div style={{ minWidth: 0 }}>
            <div ref={stageRef}>
              <section className="uf-stage">
                <div className="uf-stage-glow" aria-hidden="true" />
                <div className="uf-stage-frame">
                  <div className="uf-stage-player">
                    <iframe
                      key={embedSrc}
                      src={embedSrc}
                      className="position-absolute top-0 start-0 w-100 h-100 border-0"
                      style={{ zIndex: 10 }}
                      allowFullScreen
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                      referrerPolicy="no-referrer-when-downgrade"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                      title={movie ? `${getTitle(movie)} player` : "Streaming player"}
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Action dock */}
                <div className="uf-action-dock d-none d-sm-flex glass-strong">
                  <button
                    onClick={() => { setLiked(!liked); setDisliked(false); }}
                    className={`uf-action-btn${liked ? " is-liked" : ""}`}
                  >
                    <ThumbsUp size={16} style={{ fill: liked ? "currentColor" : "none" }} />
                    {formatCount(likes(movie, liked))}
                  </button>
                  <span className="uf-action-divider" />
                  <button
                    onClick={() => { setDisliked(!disliked); setLiked(false); }}
                    className={`uf-action-btn${disliked ? " is-disliked" : ""}`}
                  >
                    <ThumbsDown size={16} style={{ fill: disliked ? "currentColor" : "none" }} />
                    {formatCount(dislikes(movie, disliked))}
                  </button>
                  <span className="uf-action-divider" />
                  <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    aria-label="Share"
                    className="uf-action-btn"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </section>

              {/* Mobile actions */}
              <div className="uf-action-dock-mobile d-sm-none pb-safe">
                <div className="uf-action-dock-inline glass-strong">
                  <button onClick={() => { setLiked(!liked); setDisliked(false); }} aria-label="Like" className={`uf-action-btn${liked ? " is-liked" : ""}`}>
                    <ThumbsUp size={16} style={{ fill: liked ? "currentColor" : "none" }} />
                  </button>
                  <button onClick={() => { setDisliked(!disliked); setLiked(false); }} aria-label="Dislike" className={`uf-action-btn${disliked ? " is-disliked" : ""}`}>
                    <ThumbsDown size={16} style={{ fill: disliked ? "currentColor" : "none" }} />
                  </button>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)} aria-label="Share" className="uf-action-btn">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div ref={infoRef} className="uf-watch-info">
              <div className="uf-meta-row">
                <Link to={`/movie/${id}`} className="uf-meta-pill">HD</Link>
                {movie?.vote_average ? (
                  <span className="uf-rating">
                    <Star size={14} />
                    {movie.vote_average.toFixed(1)}
                    <span className="uf-meta-muted">/ 10</span>
                  </span>
                ) : null}
                {movie && getYear(movie) && <span>{getYear(movie)}</span>}
                {movie?.runtime ? (
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                ) : null}
              </div>

              <h2 className="uf-watch-title">
                {movie ? getTitle(movie) : "Loading..."}
              </h2>

              <p className="uf-watch-overview">
                {movie?.overview || "No description available."}
              </p>

              {movie?.genres && movie.genres.length > 0 && (
                <div className="uf-genre-row">
                  {movie.genres.map((g) => (
                    <Link
                      key={g.id}
                      to={`/movies?genre=${g.id}`}
                      className="uf-genre-pill"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== Right: recommendations sidebar ===== */}
          {recommendations.length > 0 && (
            <aside ref={asideRef} className="uf-watch-sidebar">
              <p className="uf-side-kicker">More Like This</p>
              <div className="uf-side-list">
                {recommendations.map((rec, i) => (
                  <Link
                    key={rec.id}
                    to={`/movie/${rec.id}`}
                    className="uf-side-item content-card"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="uf-side-poster">
                      <img src={posterUrl(rec, "w200")} alt="" loading="lazy" />
                    </div>
                    <div className="uf-side-body">
                      <p className="uf-side-title line-clamp-2">{getTitle(rec)}</p>
                      <span className="uf-side-meta">
                        {getYear(rec)}
                        {rec.vote_average ? ` · ★ ${rec.vote_average.toFixed(1)}` : ""}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function likes(movie: MovieDetails | null, boost: boolean): number {
  if (!movie) return 0;
  const base = Math.round(movie.vote_count * (movie.vote_average / 10));
  return base + (boost ? 1 : 0);
}

function dislikes(movie: MovieDetails | null, boost: boolean): number {
  if (!movie) return 0;
  const base = Math.round(movie.vote_count * (1 - movie.vote_average / 10));
  return base + (boost ? 1 : 0);
}
