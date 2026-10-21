import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, ArrowLeft, Film, Clock } from "lucide-react";
import { tmdb, Movie, Review, Episode, SeasonDetails, MovieDetails as MD, imgUrl, posterUrl, getTitle, getYear, srcSetUrl } from "@/lib/tmdb";
import { addRecentlyViewed } from "@/lib/storage";
import { useWatchlistItem } from "@/hooks/useWatchlist";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import PageShell from "@/components/PageShell";
import ScrollProgress from "@/components/ScrollProgress";
import TrailerModal from "@/components/TrailerModal";
import { DetailSkeleton } from "@/components/LoadingSkeleton";
import ContentRow from "@/components/ContentRow";
import ReviewsSection from "@/components/ReviewsSection";
import { revealNow, revealOnView, revealStagger, prefersReducedMotion } from "@/lib/anim";
import "@/styles/details.css";

export default function TvDetailsPage() {
  const { id } = useParams();
  const [show, setShow] = useState<MD | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [seasonNum, setSeasonNum] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [epsLoading, setEpsLoading] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const backdropImgRef = useRef<HTMLImageElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const episodesRef = useRef<HTMLElement>(null);
  const castRef = useRef<HTMLElement>(null);

  const showId = show?.id;

  const showForList: Movie | null = show ? { ...show, media_type: "tv" } : null;
  const { saved: inWL, toggle } = useWatchlistItem(showForList);

  const continueItems = useContinueWatching();
  const resumeItem = show
    ? continueItems.find((c) => c.type === "tv" && c.id === show.id)
    : undefined;
  const resumeSeason = resumeItem?.season;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tmdb.tvDetails(Number(id))
      .then((d) => {
        setShow(d);
        addRecentlyViewed({ ...d, media_type: "tv" });
        const videos = d.videos?.results ?? [];
        const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer")
          ?? videos.find((v) => v.site === "YouTube");
        setTrailerKey(trailer?.key ?? null);
      })
      .catch(() => setShow(null))
      .finally(() => setLoading(false));
    tmdb.tvRecommendations(Number(id))
      .then((d) => setSimilar((d.results ?? []).filter((m) => m.poster_path)))
      .catch(() => setSimilar([]));
    tmdb.tvReviews(Number(id))
      .then((d) => setReviews(d.results ?? []))
      .catch(() => setReviews([]));
  }, [id]);

  // Open on the season the viewer last watched, otherwise the first season.
  // Keyed on the stored resume season rather than the whole list, so a manual
  // season pick isn't undone by unrelated progress updates.
  useEffect(() => {
    if (!show) return;
    const list = (show.seasons ?? []).filter((x) => x.season_number > 0);
    if (list.length === 0) { setSeasonNum(null); return; }
    const firstSeason = list.reduce((min, x) => Math.min(min, x.season_number), Infinity);
    const target =
      resumeSeason && list.some((x) => x.season_number === resumeSeason)
        ? resumeSeason
        : firstSeason;
    setSeasonNum(target);
  }, [show, resumeSeason]);

  // Load the episode list for the selected season.
  useEffect(() => {
    if (!show?.id || !seasonNum) { setSeasonData(null); return; }
    let cancelled = false;
    setEpsLoading(true);
    tmdb.tvSeason(show.id, seasonNum)
      .then((d) => { if (!cancelled) setSeasonData(d); })
      .catch(() => { if (!cancelled) setSeasonData(null); })
      .finally(() => { if (!cancelled) setEpsLoading(false); });
    return () => { cancelled = true; };
  }, [show?.id, seasonNum]);

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

  // Episodes + cast sections reveal the first time they scroll into view.
  useEffect(() => {
    if (!showId) return;
    return revealOnView(episodesRef.current);
  }, [showId]);
  useEffect(() => {
    if (!showId) return;
    return revealOnView(castRef.current);
  }, [showId]);

  if (loading) return <DetailSkeleton />;
  if (!show) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center pt-5">
      <div className="text-center">
        <h2 className="fs-3 fw-extrabold text-white mb-3">Show not found</h2>
        <Link to="/" className="text-primary fw-bold text-uppercase text-decoration-none uf-ghost-link">Go Home</Link>
      </div>
    </div>
  );

  const cast = show.credits?.cast?.slice(0, 15) ?? [];
  const seasons = show.seasons?.filter((s) => s.season_number > 0) ?? [];
  const episodes = seasonData?.episodes ?? [];

  return (
    <PageShell className="min-vh-100" style={{ paddingBottom: "8rem" }}>
      <ScrollProgress />
      {/* Trailer modal */}
      {showTrailer && trailerKey && (
        <TrailerModal videoId={trailerKey} onClose={() => setShowTrailer(false)} />
      )}

      {/* Backdrop */}
      <div ref={backdropRef} className="uf-details-hero">
        <div className="uf-details-hero-imgwrap">
          <img
            ref={backdropImgRef}
            src={imgUrl(show.backdrop_path, "w1280", true)}
            srcSet={srcSetUrl(show.backdrop_path)}
            sizes="100vw"
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
              Series Hub
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
              {show.number_of_seasons ? (
                <>
                  <span className="uf-meta-dot" />
                  <span className="uf-meta-runtime">
                    <Clock size={14} />
                    {show.number_of_seasons} Season{show.number_of_seasons > 1 ? "s" : ""}
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
                to={`/watch/tv/${show.id}/${resumeItem?.season || 1}/${resumeItem?.episode || 1}`}
                className="uf-btn uf-btn-lg btn-gradient shadow-glow-lg uf-btn-pill uf-fill-icon"
              >
                <Play size={20} />
                {resumeItem
                  ? `Resume S${resumeItem.season} E${resumeItem.episode}`
                  : "Play S1 E1"}
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
                aria-pressed={inWL}
                className="uf-btn uf-btn-glass uf-btn-pill"
              >
                {inWL ? <Check size={20} className="uf-check" /> : <Plus size={20} />}
                {inWL ? "Saved" : "My List"}
              </button>
            </div>
          </div>
        </div>

        {/* Episodes */}
        {seasons.length > 0 && (
          <section ref={episodesRef} className="uf-episodes-section">
            <p className="kicker uf-kicker-block">Browse</p>
            <h2 className="uf-section-title mb-3">Episodes</h2>

            {/* Season tabs */}
            <div className="uf-season-rail scrollbar-hide">
              {seasons.map((s) => (
                <button
                  key={s.season_number}
                  type="button"
                  onClick={() => setSeasonNum(s.season_number)}
                  className={`uf-chip uf-chip-sm${s.season_number === seasonNum ? " active" : ""}`}
                >
                  S{s.season_number}
                </button>
              ))}
            </div>

            {epsLoading ? (
              <div className="uf-episode-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="uf-ep-skel">
                    <div className="uf-ep-skel-thumb" />
                    <div className="uf-ep-skel-body">
                      <div className="uf-ep-skel-bar" style={{ width: "2.5rem" }} />
                      <div className="uf-ep-skel-bar w-100" />
                      <div className="uf-ep-skel-bar" style={{ width: "4rem" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : episodes.length > 0 ? (
              <div className="uf-episode-grid">
                {episodes.map((ep: Episode, i: number) => {
                  const isResume =
                    resumeItem?.season === seasonNum && resumeItem?.episode === ep.episode_number;
                  return (
                    <div key={ep.id} className="content-card" style={{ animationDelay: `${i * 40}ms` }}>
                      <Link
                        to={`/watch/tv/${show.id}/${seasonNum}/${ep.episode_number}`}
                        className={`uf-episode-card${isResume ? " is-resume" : ""}`}
                      >
                        <div className="uf-episode-still">
                          <img
                            src={imgUrl(ep.still_path ?? null, "w300")}
                            alt=""
                            loading="lazy"
                            onError={(ev) => { (ev.target as HTMLImageElement).style.visibility = "hidden"; }}
                          />
                          <div className="uf-episode-overlay">
                            {isResume ? (
                              <span className="uf-episode-resume-badge">
                                Resume
                              </span>
                            ) : (
                              <Play size={20} className="uf-episode-play" />
                            )}
                          </div>
                        </div>
                        <div className="uf-episode-body">
                          <div className="uf-episode-head">
                            <span className="uf-episode-num">
                              E{String(ep.episode_number).padStart(2, "0")}
                            </span>
                            <p className="uf-episode-title line-clamp-2">
                              {ep.name || "Episode"}
                            </p>
                          </div>
                          <p className="uf-episode-meta">
                            {ep.air_date || "TBA"}{ep.runtime ? ` · ${ep.runtime}m` : ""}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="uf-episodes-empty">
                No Episodes Listed
              </div>
            )}
          </section>
        )}

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
            <ContentRow title="More Like This" kicker="If you liked this" movies={similar} type="tv" />
          </section>
        )}
      </div>
    </PageShell>
  );
}
