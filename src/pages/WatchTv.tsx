import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Play, Share2, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, type Episode, type MovieDetails, type SeasonDetails, imgUrl, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import WatchHeader from "@/components/WatchHeader";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CINESRC_ORIGIN = SOURCES[0].baseUrl;

export default function WatchTv() {
  const { id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useFullscreenOrientation();
  const [show, setShow] = useState<MovieDetails | null>(null);
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);
  const [nextEp, setNextEp] = useState<Episode | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastSaveRef = useRef(0);
  const lastProgressRef = useRef<{ currentTime: number; duration: number } | null>(null);
  const seekTo = Math.max(0, Number(searchParams.get("t")) || 0);
  const s = Number(searchParams.get("season") ?? season) || 1;
  const e = Number(searchParams.get("episode") ?? episode) || 1;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    window.scrollTo({ top: 0 });
    tmdb.tvDetails(Number(id)).then((data) => {
      if (cancelled) return;
      setShow(data);
      document.title = `Watch ${getTitle(data)} · UNCFLIX`;
    }).catch(() => {
      if (!cancelled) setShow(null);
    });
    return () => {
      cancelled = true;
      document.title = "UNCFLIX";
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setCurrentEp(null);
    setNextEp(null);
    setSeasonData(null);
    tmdb.tvEpisode(Number(id), s, e).then((episode) => {
      if (!cancelled) setCurrentEp(episode);
    }).catch(() => {
      if (!cancelled) setCurrentEp(null);
    });
    tmdb.tvSeason(Number(id), s).then((season) => {
      if (!cancelled) setSeasonData(season);
    }).catch(() => {
      if (!cancelled) setSeasonData(null);
    });
    tmdb.tvEpisode(Number(id), s, e + 1).then((episode) => {
      if (!cancelled) setNextEp(episode);
    }).catch(() => {
      if (cancelled) return;
      tmdb.tvEpisode(Number(id), s + 1, 1).then((episode) => {
        if (!cancelled) setNextEp(episode);
      }).catch(() => {
        if (!cancelled) setNextEp(null);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [e, id, s]);

  useEffect(() => {
    lastSaveRef.current = 0;
    lastProgressRef.current = null;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CINESRC_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "cinesrc:timeupdate" && typeof data.currentTime === "number" && typeof data.duration === "number" && data.duration > 0 && id) {
        const now = Date.now();
        if (now - lastSaveRef.current < 8000 || !show) return;
        lastSaveRef.current = now;
        const progress = Math.min(100, Math.round((data.currentTime / data.duration) * 100));
        if (progress < 2) return;
        lastProgressRef.current = { currentTime: data.currentTime, duration: data.duration };
        updateContinueWatching({ id: Number(id), type: "tv", title: getTitle(show), poster_path: show.poster_path, backdrop_path: show.backdrop_path, progress, currentTime: data.currentTime, duration: data.duration, season: s, episode: e, timestamp: now });
      }
      if (data.type === "cinesrc:nextepisode" && data.internalNavigation === false && data.source !== "internal") {
        const nextSeason = Number(data.season);
        const nextEpisode = Number(data.episode);
        if (nextSeason && nextEpisode && (nextSeason !== s || nextEpisode !== e)) navigate(`/watch/tv/${id}?season=${nextSeason}&episode=${nextEpisode}`, { replace: true });
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      const last = lastProgressRef.current;
      if (last && id && show) {
        const progress = Math.min(100, Math.round((last.currentTime / last.duration) * 100));
        if (progress >= 2) updateContinueWatching({ id: Number(id), type: "tv", title: getTitle(show), poster_path: show.poster_path, backdrop_path: show.backdrop_path, progress, currentTime: last.currentTime, duration: last.duration, season: s, episode: e, timestamp: Date.now() });
      }
    };
  }, [e, id, navigate, s, show]);

  const embedSrc = SOURCES[0].build("tv", id || "", s, e) + (seekTo > 0 ? `&t=${seekTo}` : "");
  const seasons = show?.seasons?.filter((item) => item.season_number > 0) ?? [];

  return (
    <PageShell className="min-h-screen overflow-x-hidden bg-[#030408] pb-24 text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        {show?.backdrop_path && <img src={imgUrl(show.backdrop_path, "w1280")} alt="" className="h-full w-full scale-110 object-cover opacity-[0.10] blur-3xl" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#040508]/92 to-black" />
      </div>
      <WatchHeader to={`/tv/${id}`} label="Series" badge={`S${s} · E${e}`} title={show ? getTitle(show) : "Loading…"} />

      <div className="mx-auto w-full max-w-[1600px] px-0 pt-16 sm:px-6 sm:pt-20 md:pt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0">
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
              <div className="overflow-hidden border-y border-white/[0.08] bg-black shadow-2xl sm:rounded-2xl sm:border">
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <iframe key={embedSrc} src={embedSrc} title={`S${s} E${e} player`} className="absolute inset-0 z-10 h-full w-full border-0" allowFullScreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" loading="eager" />
                </div>
              </div>
            </motion.section>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1, ease: EASE }} className="px-4 pt-6 sm:px-0 sm:pt-8">
              <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    <Link to={`/tv/${id}`} className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 normal-case text-white/70 transition-colors hover:border-white/20 hover:text-white">
                      {show ? getTitle(show) : "Loading…"}
                    </Link>
                    {show?.vote_average ? <span className="inline-flex items-center gap-1 text-amber-200"><Star className="h-3 w-3 fill-amber-300" />{show.vote_average.toFixed(1)}</span> : null}
                    {currentEp?.air_date && <span>{currentEp.air_date}</span>}
                  </div>
                  <h1 className="text-2xl font-black leading-tight tracking-[-0.04em] text-white sm:text-3xl md:text-4xl">
                    S{s} E{e} <span className="text-white/25">·</span> {currentEp?.name || "Episode"}
                  </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                  <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#0c0d14]/70 p-1 backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => { setLiked((value) => !value); setDisliked(false); }}
                      aria-label={liked ? "Remove like" : "Like"}
                      aria-pressed={liked}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${liked ? "bg-primary text-[#060e17] font-semibold" : "text-white/60 hover:bg-white/[0.08] hover:text-white"}`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
                      <span>{formatCount(likes(show, liked))}</span>
                    </button>
                    <span className="mx-1 h-3.5 w-px bg-white/10" />
                    <button
                      type="button"
                      onClick={() => { setDisliked((value) => !value); setLiked(false); }}
                      aria-label={disliked ? "Remove dislike" : "Dislike"}
                      aria-pressed={disliked}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${disliked ? "bg-red-400 text-red-950 font-semibold" : "text-white/60 hover:bg-white/[0.08] hover:text-white"}`}
                    >
                      <ThumbsDown className={`h-3.5 w-3.5 ${disliked ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share episode link"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0c0d14]/70 px-3 text-xs font-medium text-white/60 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-5">
                <p className="max-w-3xl text-pretty text-sm leading-relaxed text-white/55 sm:text-base">
                  {currentEp?.overview || "No description available for this episode."}
                </p>
              </div>
            </motion.div>
          </div>

          <aside className="space-y-7 px-4 sm:px-6 lg:sticky lg:top-24 lg:self-start lg:px-0" aria-label="Episode browser">
            <section>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Up next</p>
              {nextEp ? (
                <Link
                  to={`/watch/tv/${id}?season=${nextEp.season_number}&episode=${nextEp.episode_number}`}
                  className="group flex gap-3.5 rounded-xl border border-white/[0.07] bg-[#0c0d14]/60 p-3 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                    {nextEp.still_path || show?.backdrop_path ? (
                      <img src={imgUrl(nextEp.still_path || show?.backdrop_path || null, "w300")} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-80 transition-opacity group-hover:opacity-100">
                      <Play className="h-4 w-4 fill-current text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 py-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">S{nextEp.season_number} · E{nextEp.episode_number}</span>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-white/80 group-hover:text-white">{nextEp.name}</p>
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  Season finale reached
                </div>
              )}
            </section>

            {seasonData && seasonData.episodes.length > 0 && (
              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Episodes <span className="font-normal text-white/30">({seasonData.episodes.length})</span></h2>
                  <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto">
                    {seasons.map((item) => (
                      <Link
                        key={item.season_number}
                        to={`/watch/tv/${id}?season=${item.season_number}&episode=1`}
                        className={cn(
                          "h-7 shrink-0 rounded px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
                          item.season_number === s ? "bg-primary text-[#060e17]" : "bg-white/[0.04] text-white/45 hover:bg-white/[0.08] hover:text-white"
                        )}
                      >
                        S{item.season_number}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="grid max-h-[30rem] gap-1.5 overflow-y-auto pr-1">
                  {seasonData.episodes.map((ep) => {
                    const active = ep.episode_number === e;
                    return (
                      <Link
                        key={ep.id}
                        to={`/watch/tv/${id}?season=${s}&episode=${ep.episode_number}`}
                        className={cn(
                          "group flex min-w-0 items-center gap-3 rounded-xl border p-2 transition-colors",
                          active ? "border-primary/40 bg-primary/[0.08]" : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.035]"
                        )}
                      >
                        <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                          {ep.still_path && <img src={imgUrl(ep.still_path, "w300")} alt="" loading="lazy" className="h-full w-full object-cover" />}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                            <Play className="h-3.5 w-3.5 fill-current text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className={cn("text-[10px] font-bold tabular-nums", active ? "text-primary" : "text-white/35")}>
                              E{String(ep.episode_number).padStart(2, "0")}
                            </span>
                            <p className="truncate text-xs font-semibold text-white/80">{ep.name || "Episode"}</p>
                          </div>
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
                            {ep.air_date || "TBA"}{ep.runtime ? ` · ${ep.runtime}m` : ""}
                          </p>
                        </div>
                        {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {seasons.length > 1 && (
              <section>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-primary">All seasons</p>
                <div className="grid grid-cols-2 gap-2">
                  {seasons.map((item) => (
                    <Link
                      key={item.season_number}
                      to={`/watch/tv/${id}?season=${item.season_number}&episode=1`}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-[10px] font-semibold transition-colors",
                        item.season_number === s ? "bg-primary/10 text-primary" : "text-white/45 hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="ml-2 shrink-0 text-[10px] text-white/30">{item.episode_count} ep</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </PageShell>
  );
}

function likes(show: MovieDetails | null, boost: boolean): number {
  if (!show) return 0;
  return Math.round(show.vote_count * (show.vote_average / 10)) + (boost ? 1 : 0);
}

function dislikes(show: MovieDetails | null, boost: boolean): number {
  if (!show) return 0;
  return Math.round(show.vote_count * (1 - show.vote_average / 10)) + (boost ? 1 : 0);
}
