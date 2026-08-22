import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ThumbsUp, ThumbsDown, Share2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, MovieDetails, Episode, SeasonDetails, imgUrl, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import ScrollProgress from "@/components/ScrollProgress";
import WatchHeader from "@/components/WatchHeader";
import { EASE, springSnappy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CINESRC_ORIGIN = SOURCES[0].baseUrl;

export default function WatchTv() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  useFullscreenOrientation();
  const [show, setShow] = useState<MovieDetails | null>(null);
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);
  const [nextEp, setNextEp] = useState<Episode | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const lastSaveRef = useRef(0);

  const s = Number(season) || 1;
  const e = Number(episode) || 1;

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0 });

    tmdb.tvDetails(Number(id)).then((d) => {
      setShow(d);
      document.title = `Watch ${getTitle(d)} · UNCFLIX`;
      updateContinueWatching({
        id: d.id,
        type: "tv",
        title: getTitle(d),
        poster_path: d.poster_path,
        backdrop_path: d.backdrop_path,
        progress: 0,
        season: s,
        episode: e,
        timestamp: Date.now(),
      });
    }).catch(() => {});

    tmdb.tvEpisode(Number(id), s, e).then(setCurrentEp).catch(() => {});
    tmdb.tvSeason(Number(id), s).then(setSeasonData).catch(() => setSeasonData(null));
    tmdb.tvEpisode(Number(id), s, e + 1).then(setNextEp).catch(() => {
      tmdb.tvEpisode(Number(id), s + 1, 1).then(setNextEp).catch(() => setNextEp(null));
    });

    return () => { document.title = "UNCFLIX"; };
  }, [id, s, e]);

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
          season: s,
          episode: e,
          timestamp: now,
        });
      }

      if (data.type === "cinesrc:nextepisode" && data.internalNavigation === false && data.source !== "internal") {
        const ns = Number(data.season), ne = Number(data.episode);
        if (ns && ne && (ns !== s || ne !== e)) {
          navigate(`/watch/tv/${id}/${ns}/${ne}`, { replace: true });
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id, s, e, show, navigate]);

  const embedSrc = SOURCES[0].build("tv", id || "", s, e);
  const seasons = show?.seasons?.filter((se) => se.season_number > 0) ?? [];

  return (
    <PageShell className="min-h-screen text-white pb-32 overflow-x-hidden">
      {/* Ambient backdrop */}
      <div className="fixed inset-0 -z-10">
        {show?.backdrop_path && (
          <img
            src={imgUrl(show.backdrop_path, "w1280")}
            alt=""
            className="w-full h-full object-cover opacity-20 scale-110 blur-2xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/85 to-black" />
      </div>

      <ScrollProgress />

      <WatchHeader
        to={`/tv/${id}`}
        label="Series"
        badge={`S${s} · E${e}`}
        title={show ? getTitle(show) : "Loading..."}
      />

      {/* Two-column cinema layout */}
      <div className="w-full max-w-[1600px] mx-auto mt-5 sm:mt-7 px-0 sm:px-6 pt-16 md:pt-24">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_370px] xl:grid-cols-[minmax(0,1fr)_410px] gap-6 xl:gap-8 px-0 lg:px-0">

          {/* ===== Left: stage + info ===== */}
          <div className="min-w-0">
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="relative group/stage sm:px-6 lg:px-0">
                <div className="absolute -inset-1 rounded-none sm:rounded-[2rem] bg-gradient-to-r from-sky-500/25 via-indigo-500/15 to-transparent blur-xl opacity-60" />
                <div className="relative p-px rounded-none sm:rounded-[1.75rem] bg-gradient-to-b from-white/20 via-white/[0.07] to-transparent shadow-card-lg">
                  <div className="aspect-video w-full overflow-hidden rounded-none sm:rounded-[1.7rem] bg-black relative">
                    <iframe
                      key={embedSrc}
                      src={embedSrc}
                      className="absolute inset-0 w-full h-full border-0 z-10"
                      allowFullScreen
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`S${s} E${e} player`}
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Action dock */}
                <div className="hidden sm:flex absolute -bottom-7 left-1/2 -translate-x-1/2 z-20 items-center gap-1 glass-strong ring-1 ring-white/10 rounded-full px-2 py-1.5 shadow-card-lg">
                  <button
                    onClick={() => { setLiked(!liked); setDisliked(false); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${liked ? "bg-primary text-white shadow-glow-sm" : "text-white/60 hover:text-white hover:bg-white/[0.08]"}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                    {formatCount(likes(show, liked))}
                  </button>
                  <span className="w-px h-5 bg-white/10" />
                  <button
                    onClick={() => { setDisliked(!disliked); setLiked(false); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${disliked ? "bg-red-500 text-white" : "text-white/60 hover:text-white hover:bg-white/[0.08]"}`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
                    {formatCount(dislikes(show, disliked))}
                  </button>
                  <span className="w-px h-5 bg-white/10" />
                  <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    aria-label="Share"
                    className="flex items-center px-4 py-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile actions */}
              <div className="sm:hidden flex justify-center mt-3 relative z-20 px-4">
                <div className="flex items-center gap-1 glass-strong ring-1 ring-white/10 rounded-full px-2 py-1.5 shadow-card-lg">
                  <button onClick={() => { setLiked(!liked); setDisliked(false); }} aria-label="Like" className={`flex items-center px-4 py-2.5 rounded-full transition-all ${liked ? "bg-primary text-white" : "text-white/60"}`}>
                    <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => { setDisliked(!disliked); setLiked(false); }} aria-label="Dislike" className={`flex items-center px-4 py-2.5 rounded-full transition-all ${disliked ? "bg-red-500 text-white" : "text-white/60"}`}>
                    <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => navigator.clipboard?.writeText(window.location.href)} aria-label="Share" className="flex items-center px-4 py-2.5 rounded-full text-white/60">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Now playing info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              className="px-4 sm:px-6 lg:px-0 mt-12 sm:mt-14"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <Link to={`/tv/${id}`} className="rounded-full bg-white/[0.07] ring-1 ring-white/10 px-3 py-1 text-[10px] normal-case text-white/75 hover:ring-primary/40 transition-all">
                  {show ? getTitle(show) : "Loading..."}
                </Link>
                {show?.vote_average ? (
                  <span className="flex items-center gap-1.5 text-yellow-400 normal-case font-bold">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    {show.vote_average.toFixed(1)}
                    <span className="text-white/30 font-semibold">/ 10</span>
                  </span>
                ) : null}
                {currentEp?.air_date && <span>{currentEp.air_date}</span>}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-[0.95] mb-5">
                S{s} E{e} · {currentEp?.name || "Episode"}
              </h2>

              <p className="text-base text-white/55 leading-relaxed max-w-2xl">
                {currentEp?.overview || "No description available for this episode."}
              </p>
            </motion.div>
          </div>

          {/* ===== Right: sidebar ===== */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
            className="w-full min-w-0 px-4 sm:px-6 lg:px-0 lg:sticky lg:top-24 lg:self-start space-y-6"
          >
            {/* Up next */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-3">Up Next</p>
              {nextEp ? (
                <motion.div whileHover={{ x: 4 }} transition={springSnappy}>
                  <Link
                    to={`/watch/tv/${id}/${nextEp.season_number}/${nextEp.episode_number}`}
                    className="flex gap-3.5 p-2.5 rounded-2xl bg-white/[0.03] ring-1 ring-transparent hover:ring-primary/30 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-900 ring-1 ring-white/[0.08]">
                      <img
                        src={imgUrl(nextEp.still_path || show?.backdrop_path || null, "w300")}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1">
                        S{nextEp.season_number} · E{nextEp.episode_number}
                      </span>
                      <p className="text-xs font-bold line-clamp-2 leading-snug">{nextEp.name}</p>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <div className="p-6 text-center rounded-2xl ring-1 ring-dashed ring-white/10 text-white/25 text-[10px] font-bold uppercase tracking-[0.3em]">
                  Season Finale Reached
                </div>
              )}
            </div>

            {/* Episodes browser */}
            {seasonData && seasonData.episodes.length > 0 && (
              <section>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4">
                  <h3 className="text-sm font-extrabold tracking-tight">
                    Episodes <span className="text-white/30">{seasonData.episodes.length}</span>
                  </h3>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide max-w-[60%]">
                    {seasons.map((se) => (
                      <Link
                        key={se.season_number}
                        to={`/watch/tv/${id}/${se.season_number}/1`}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 transition-all whitespace-nowrap",
                          se.season_number === s
                            ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-transparent shadow-glow-sm"
                            : "bg-white/[0.04] text-white/45 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                        )}
                      >
                        S{se.season_number}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 -mr-1">
                  {seasonData.episodes.map((ep) => {
                    const active = ep.episode_number === e;
                    return (
                      <Link
                        key={ep.id}
                        to={`/watch/tv/${id}/${s}/${ep.episode_number}`}
                        className={cn(
                          "group flex items-center gap-3 p-2 pr-3.5 rounded-xl ring-1 transition-all",
                          active
                            ? "bg-primary/[0.09] ring-primary/40"
                            : "bg-white/[0.03] ring-transparent hover:ring-white/[0.14] hover:bg-white/[0.05]"
                        )}
                      >
                        <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                          <img
                            src={imgUrl(ep.still_path ?? null, "w300")}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {active ? (
                            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                              <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest text-white shadow-glow-sm">
                                Playing
                              </span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 fill-current" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className={cn("text-[10px] font-black tabular-nums", active ? "text-primary" : "text-white/35")}>
                              E{String(ep.episode_number).padStart(2, "0")}
                            </span>
                            <p className={cn("text-xs font-bold truncate", active ? "text-white" : "text-white/80")}>
                              {ep.name || "Episode"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/30">
                            <span>{ep.air_date || "TBA"}</span>
                            {ep.runtime ? <span>{ep.runtime}m</span> : null}
                          </div>
                        </div>

                        <Play className={cn("w-3.5 h-3.5 shrink-0 transition-all", active ? "text-primary fill-current" : "text-white/20 group-hover:text-white")} />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* All seasons */}
            {seasons.length > 1 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-3">Seasons</p>
                <div className="grid grid-cols-2 gap-2">
                  {seasons.map((se) => (
                    <Link
                      key={se.season_number}
                      to={`/watch/tv/${id}/${se.season_number}/1`}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                        se.season_number === s
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                      )}
                    >
                      <span className="truncate">{se.name}</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60 ml-2 shrink-0">
                        {se.episode_count} ep
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>
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
