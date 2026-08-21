import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, MovieDetails, Episode, SeasonDetails, imgUrl, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";
import PageShell from "@/components/PageShell";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function WatchTv() {
  const { id, season, episode } = useParams();
  useFullscreenOrientation();
  const [show, setShow] = useState<MovieDetails | null>(null);
  const [currentEp, setCurrentEp] = useState<Episode | null>(null);
  const [nextEp, setNextEp] = useState<Episode | null>(null);
  const [seasonData, setSeasonData] = useState<SeasonDetails | null>(null);

  const s = Number(season) || 1;
  const e = Number(episode) || 1;

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0 });

    tmdb.tvDetails(Number(id)).then((d) => {
      setShow(d);
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

    tmdb.tvSeason(Number(id), s)
      .then(setSeasonData)
      .catch(() => setSeasonData(null));

    tmdb.tvEpisode(Number(id), s, e + 1).then(setNextEp).catch(() => {
      tmdb.tvEpisode(Number(id), s + 1, 1).then(setNextEp).catch(() => setNextEp(null));
    });
  }, [id, s, e]);

  const embedSrc = SOURCES[0].build("tv", id || "", s, e);

  const likes = show ? Math.round(show.vote_count * (show.vote_average / 10)) : 0;
  const dislikes = show ? Math.round(show.vote_count * (1 - (show.vote_average / 10))) : 0;

  return (
    <PageShell className="min-h-screen bg-black text-white pb-28 overflow-x-hidden">
      {/* Header */}
      <div className="h-16 flex items-center px-4 sm:px-6 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <Link to={`/tv/${id}`} aria-label="Back to details" className="p-2 rounded-full hover:bg-white/10 mr-3 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-semibold truncate tracking-tight text-white/70">
          {show ? getTitle(show) : "Loading..."} · S{s} E{e}
        </h1>
      </div>

      {/* Player */}
      <div className="w-full max-w-[1600px] mx-auto mt-4 sm:mt-6 px-0 sm:px-8">
        <div className="w-full aspect-video bg-zinc-900 relative overflow-hidden shadow-card-lg rounded-none sm:rounded-3xl ring-1 ring-white/10">
          <iframe
            key={embedSrc}
            src={embedSrc}
            className="w-full h-full border-0 relative z-10"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
            title="Streaming Player"
            loading="eager"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <div className="mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Series Premiere</p>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-[0.95] mb-4">
                S{s} E{e}: {currentEp?.name || "Episode Name"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <span className="rounded-full bg-white/[0.07] px-3 py-1 text-[10px] text-white/70">{show ? getTitle(show) : "Loading..."}</span>
                {show?.vote_average ? (
                  <span className="flex items-center gap-1.5 text-white/60 normal-case">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {show.vote_average.toFixed(1)}
                  </span>
                ) : null}
                {currentEp?.air_date && <span>{currentEp.air_date}</span>}
              </div>
            </div>

            <div className="flex items-center gap-6 py-5 border-y border-white/[0.06] mb-8">
              <div className="flex items-center gap-2 cursor-pointer group">
                <ThumbsUp className="w-[18px] h-[18px] group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold">{formatCount(likes)}</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group">
                <ThumbsDown className="w-[18px] h-[18px] group-hover:text-red-500 transition-colors" />
                <span className="text-sm font-bold">{formatCount(dislikes)}</span>
              </div>
              <div className="ml-auto flex items-center gap-5">
                <Share2 className="w-[18px] h-[18px] cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-3xl">
              {currentEp?.overview || "No description available for this episode."}
            </p>

            {/* Episodes */}
            {seasonData && seasonData.episodes.length > 0 && (
              <section className="mt-12">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1">Browse</p>
                    <h3 className="text-lg font-extrabold tracking-tight">
                      Episodes <span className="text-white/30 font-bold">{seasonData.episodes.length}</span>
                    </h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {show?.seasons?.filter((se) => se.season_number > 0).map((se) => (
                      <Link
                        key={se.season_number}
                        to={`/watch/tv/${id}/${se.season_number}/1`}
                        className={cn(
                          "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest ring-1 transition-all whitespace-nowrap",
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

                <div className="space-y-3">
                  {seasonData.episodes.map((ep) => {
                    const active = ep.episode_number === e;
                    return (
                      <motion.div key={ep.id} layout>
                        <Link
                          to={`/watch/tv/${id}/${s}/${ep.episode_number}`}
                          className={cn(
                            "flex gap-4 p-3 rounded-2xl ring-1 transition-all group",
                            active
                              ? "bg-primary/[0.08] ring-primary/40"
                              : "bg-white/[0.03] ring-white/[0.06] hover:ring-white/[0.15]"
                          )}
                        >
                          <div className="relative w-32 sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                            <img
                              src={imgUrl(ep.still_path ?? null, "w300")}
                              alt={ep.name}
                              loading="lazy"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {active && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-white">
                                  Now Playing
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col justify-center min-w-0 py-1">
                            <p className={cn("text-xs font-bold line-clamp-1", active ? "text-primary" : "text-white group-hover:text-primary transition-colors")}>
                              E{ep.episode_number} · {ep.name || "Episode"}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                              <span>{ep.air_date || "TBA"}</span>
                              {ep.runtime ? <span>{ep.runtime} Min</span> : null}
                            </div>
                            {ep.overview && (
                              <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mt-2 hidden sm:block">{ep.overview}</p>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Up next */}
          <div className="w-full lg:w-80 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25 mb-5">Up Next</p>
            {nextEp ? (
              <motion.div layout>
                <Link
                  to={`/watch/tv/${id}/${nextEp.season_number}/${nextEp.episode_number}`}
                  className="flex gap-4 p-3 rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] hover:ring-primary/40 transition-all group"
                >
                  <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                    <img
                      src={imgUrl(nextEp.still_path || show?.backdrop_path || null, "w300")}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-bold text-xs line-clamp-2 group-hover:text-primary transition-colors">
                      E{nextEp.episode_number} · {nextEp.name}
                    </h4>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-white/30 mt-1.5">Up Next</span>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <div className="p-8 text-center rounded-2xl ring-1 ring-dashed ring-white/10 text-white/25 text-[10px] font-bold uppercase tracking-[0.3em]">
                Season Finale Reached
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
