import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ThumbsUp, ThumbsDown, Share2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getContinueWatching, updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, MovieDetails, Episode, SeasonDetails, imgUrl, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import ScrollProgress from "@/components/ScrollProgress";
import WatchHeader from "@/components/WatchHeader";
import { revealNow } from "@/lib/anim";
import "@/styles/watch.css";

const CINESRC_ORIGIN = SOURCES[0].baseUrl;

export default function WatchTv() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  useFullscreenOrientation();
  const [show, setShow] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);
  const [nextEp, setNextEp] = useState<Episode | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [liveEp, setLiveEp] = useState<{ season: number; episode: number } | null>(null);
  const lastSaveRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const s = Number(season) || 1;
  const e = Number(episode) || 1;

  // The embed switches episodes by itself (autonext / its own selector) and
  // always flags that as internalNavigation, so the URL params go stale.
  // `ds`/`de` are what the UI shows; `s`/`e` stay pinned to the URL so the
  // iframe is never remounted, which would restart playback mid-advance.
  const ds = liveEp?.season ?? s;
  const de = liveEp?.episode ?? e;

  // A real URL change means the user picked an episode ourselves.
  useEffect(() => { setLiveEp(null); }, [s, e]);

  // Entrances: content is visible by default; anime.js only fades it in.
  useEffect(() => {
    revealNow(stageRef.current, { y: 24, duration: 550 });
    revealNow(infoRef.current, { y: 20, duration: 500, delay: 150 });
    revealNow(asideRef.current, { y: 24, duration: 550, delay: 100 });
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    window.scrollTo({ top: 0 });

    tmdb.tvDetails(Number(id)).then((d) => {
      if (cancelled) return;
      setShow(d);
      document.title = `Watch ${getTitle(d)} · UNCFLIX`;
      const prior = getContinueWatching().find((c) => c.type === "tv" && c.id === d.id);
      updateContinueWatching({
        id: d.id,
        type: "tv",
        title: getTitle(d),
        poster_path: d.poster_path,
        backdrop_path: d.backdrop_path,
        progress: prior?.progress ?? 0,
        season: ds,
        episode: de,
        timestamp: Date.now(),
      });
    }).catch(() => { if (!cancelled) setShow(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    tmdb.tvEpisode(Number(id), ds, de)
      .then((ep) => { if (!cancelled) setCurrentEp(ep); })
      .catch(() => { if (!cancelled) setCurrentEp(null); });
    tmdb.tvSeason(Number(id), ds)
      .then((d) => { if (!cancelled) setSeasonData(d); })
      .catch(() => { if (!cancelled) setSeasonData(null); });
    tmdb.tvEpisode(Number(id), ds, de + 1)
      .then((ep) => { if (!cancelled) setNextEp(ep); })
      .catch(() => {
        tmdb.tvEpisode(Number(id), ds + 1, 1)
          .then((ep) => { if (!cancelled) setNextEp(ep); })
          .catch(() => { if (!cancelled) setNextEp(null); });
      });

    return () => { cancelled = true; document.title = "UNCFLIX"; };
  }, [id, ds, de]);

  // CineSrc player events: progress sync + out-of-player episode navigation
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CINESRC_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "cinesrc:timeupdate" && typeof data.currentTime === "number" && typeof data.duration === "number" && data.duration > 0) {
        const now = Date.now();
        if (now - lastSaveRef.current < 15000) return;
        lastSaveRef.current = now;
        if (!id) return;
        updateContinueWatching({
          id: Number(id),
          type: "tv",
          title: getTitle(show),
          poster_path: show?.poster_path,
          backdrop_path: show?.backdrop_path,
          progress: Math.min(100, Math.round((data.currentTime / data.duration) * 100)),
          season: ds,
          episode: de,
          timestamp: now,
        });
      }

      if (data.type === "cinesrc:nextepisode") {
        const ns = Number(data.season), ne = Number(data.episode);
        if (!ns || !ne || (ns === ds && ne === de)) return;

        if (data.internalNavigation === true) {
          // The embed already switched its own stream and history. Mirror that
          // in our UI and URL only - re-navigating would remount the iframe and
          // restart the episode that is currently playing.
          setLiveEp({ season: ns, episode: ne });
          window.history.replaceState(null, "", `/watch/tv/${id}/${ns}/${ne}`);
          if (id) {
            updateContinueWatching({
              id: Number(id),
              type: "tv",
              title: getTitle(show),
              poster_path: show?.poster_path,
              backdrop_path: show?.backdrop_path,
              progress: 0,
              season: ns,
              episode: ne,
              timestamp: Date.now(),
            });
          }
        } else {
          navigate(`/watch/tv/${id}/${ns}/${ne}`, { replace: true });
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id, ds, de, show, navigate]);

  const embedSrc = SOURCES[0].build("tv", id || "", s, e);

  if (!loading && !show) {
    return (
      <PageShell className="min-vh-100 d-flex align-items-center justify-content-center px-3">
        <div className="text-center">
          <h2 className="fw-extrabold text-white mb-3" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>Title not found</h2>
          <Link to="/" className="text-decoration-none fw-bold text-uppercase" style={{ color: "var(--uf-primary)", fontSize: "0.75rem", letterSpacing: "0.1em" }}>Go Home</Link>
        </div>
      </PageShell>
    );
  }
  const seasons = show?.seasons?.filter((se) => se.season_number > 0) ?? [];

  return (
    <PageShell className="min-vh-100 text-white uf-watch-shell">
      {/* Ambient backdrop */}
      <div className="uf-watch-ambient" aria-hidden="true">
        {show?.backdrop_path && (
          <img
            src={imgUrl(show.backdrop_path, "w1280", true)}
            alt=""
          />
        )}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.85), #000)" }} />
      </div>

      <ScrollProgress />

      <WatchHeader
        to={`/tv/${id}`}
        label="Series"
        badge={`S${ds} · E${de}`}
        title={show ? getTitle(show) : "Loading..."}
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
                      title={`S${s} E${e} player`}
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
                    {formatCount(likes(show, liked))}
                  </button>
                  <span className="uf-action-divider" />
                  <button
                    onClick={() => { setDisliked(!disliked); setLiked(false); }}
                    className={`uf-action-btn${disliked ? " is-disliked" : ""}`}
                  >
                    <ThumbsDown size={16} style={{ fill: disliked ? "currentColor" : "none" }} />
                    {formatCount(dislikes(show, disliked))}
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

            {/* Now playing info */}
            <div ref={infoRef} className="uf-watch-info">
              <div className="uf-meta-row">
                <Link to={`/tv/${id}`} className="uf-meta-pill">
                  {show ? getTitle(show) : "Loading..."}
                </Link>
                {show?.vote_average ? (
                  <span className="uf-rating">
                    <Star size={14} />
                    {show.vote_average.toFixed(1)}
                    <span className="uf-meta-muted">/ 10</span>
                  </span>
                ) : null}
                {currentEp?.air_date && <span>{currentEp.air_date}</span>}
              </div>

              <h2 className="uf-watch-title">
                S{ds} E{de} · {currentEp?.name || "Episode"}
              </h2>

              <p className="uf-watch-overview">
                {currentEp?.overview || "No description available for this episode."}
              </p>
            </div>
          </div>

          {/* ===== Right: sidebar ===== */}
          <aside ref={asideRef} className="uf-watch-sidebar uf-tv-sidebar">
            {/* Up next */}
            <div>
              <p className="uf-side-kicker" style={{ marginBottom: "0.75rem" }}>Up Next</p>
              {nextEp ? (
                <Link
                  to={`/watch/tv/${id}/${nextEp.season_number}/${nextEp.episode_number}`}
                  className="uf-upnext"
                >
                  <div className="uf-upnext-thumb">
                    <img
                      src={imgUrl(nextEp.still_path || show?.backdrop_path || null, "w300")}
                      alt=""
                      loading="lazy"
                    />
                    <div className="uf-upnext-play">
                      <Play size={20} style={{ fill: "currentColor" }} />
                    </div>
                  </div>
                  <div className="uf-upnext-body">
                    <span className="uf-ep-tag">
                      S{nextEp.season_number} · E{nextEp.episode_number}
                    </span>
                    <p className="uf-upnext-title line-clamp-2">{nextEp.name}</p>
                  </div>
                </Link>
              ) : (
                <div className="uf-finale">
                  Season Finale Reached
                </div>
              )}
            </div>

            {/* Episodes browser */}
            {seasonData && seasonData.episodes.length > 0 && (
              <section>
                <div className="uf-ep-head">
                  <h3 className="uf-ep-title">
                    Episodes <span>{seasonData.episodes.length}</span>
                  </h3>
                  <div className="uf-season-pills scrollbar-hide">
                    {seasons.map((se) => (
                      <Link
                        key={se.season_number}
                        to={`/watch/tv/${id}/${se.season_number}/1`}
                        className={`uf-chip uf-chip-sm uf-season-chip${se.season_number === ds ? " active" : ""}`}
                      >
                        S{se.season_number}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="uf-ep-list">
                  {seasonData.episodes.map((ep) => {
                    const active = ep.episode_number === de;
                    return (
                      <Link
                        key={ep.id}
                        to={`/watch/tv/${id}/${ds}/${ep.episode_number}`}
                        className={`uf-ep-row${active ? " active" : ""}`}
                      >
                        <div className="uf-ep-thumb">
                          <img
                            src={imgUrl(ep.still_path ?? null, "w300")}
                            alt=""
                            loading="lazy"
                          />
                          {active ? (
                            <div className="uf-ep-playing-overlay">
                              <span className="uf-playing-badge">
                                Playing
                              </span>
                            </div>
                          ) : (
                            <div className="uf-ep-play-overlay">
                              <Play size={16} style={{ fill: "currentColor" }} />
                            </div>
                          )}
                        </div>

                        <div className="uf-ep-body">
                          <div className="uf-ep-line">
                            <span className="uf-ep-num">
                              E{String(ep.episode_number).padStart(2, "0")}
                            </span>
                            <p className="uf-ep-name">
                              {ep.name || "Episode"}
                            </p>
                          </div>
                          <div className="uf-ep-meta">
                            <span>{ep.air_date || "TBA"}</span>
                            {ep.runtime ? <span>{ep.runtime}m</span> : null}
                          </div>
                        </div>

                        <Play className="uf-ep-play-icon" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* All seasons */}
            {seasons.length > 1 && (
              <div>
                <p className="uf-side-kicker" style={{ marginBottom: "0.75rem" }}>Seasons</p>
                <div className="uf-season-grid">
                  {seasons.map((se) => (
                    <Link
                      key={se.season_number}
                      to={`/watch/tv/${id}/${se.season_number}/1`}
                      className={`uf-season-link${se.season_number === ds ? " active" : ""}`}
                    >
                      <span className="uf-season-name">{se.name}</span>
                      <span className="uf-season-count">
                        {se.episode_count} ep
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function likes(show: MovieDetails | null, boost: boolean): number {
  if (!show) return 0;
  const base = Math.round(show.vote_count * (show.vote_average / 10));
  return base + (boost ? 1 : 0);
}

function dislikes(show: MovieDetails | null, boost: boolean): number {
  if (!show) return 0;
  const base = Math.round(show.vote_count * (1 - show.vote_average / 10));
  return base + (boost ? 1 : 0);
}
