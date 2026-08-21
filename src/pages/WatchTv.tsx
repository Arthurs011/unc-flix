import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Star, Download, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, MovieDetails, Episode, SeasonDetails, imgUrl, formatCount } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { SOURCES } from "@/lib/servers";

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
    <div className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 bg-zinc-950 sticky top-0 z-50">
        <Link to={`/tv/${id}`} className="p-2 rounded-full hover:bg-white/10 mr-4">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-sm font-bold truncate tracking-tight uppercase italic text-white/80">
          {show ? getTitle(show) : "Loading..."} • S{s} E{e}
        </h1>
      </div>

      {/* Player Container */}
      <div className="w-full max-w-[1600px] mx-auto mt-4 sm:mt-8 px-0 sm:px-8">
        <div className="w-full aspect-video bg-zinc-900 relative group overflow-hidden shadow-2xl rounded-none sm:rounded-2xl border border-white/5">
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
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
             <div className="space-y-2 mb-8">
                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] italic">Series Premiere</span>
                <h1 className="text-3xl sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
                  S{s} E{e}: {currentEp?.name || "Episode Name"}
                </h1>
                <div className="flex items-center gap-4 pt-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">{show ? getTitle(show) : "Loading..."}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-white/60">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    {show?.vote_average.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{currentEp?.air_date}</span>
                </div>
             </div>

            <div className="flex items-center gap-8 py-6 border-y border-white/5 mb-8">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <ThumbsUp className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="text-sm font-black italic tracking-tighter">{formatCount(likes)}</span>
              </div>
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <ThumbsDown className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                <span className="text-sm font-black italic tracking-tighter">{formatCount(dislikes)}</span>
              </div>
              <div className="ml-auto flex items-center gap-6">
                 <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group">
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline text-xs font-black uppercase tracking-tighter">Download Season</span>
                 </div>
                 <Share2 className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-4xl font-medium">
              {currentEp?.overview || "No description available for this episode."}
            </p>

            {/* Episodes */}
            {seasonData && seasonData.episodes.length > 0 && (
              <section className="mt-12">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic shrink-0">
                    Episodes <span className="text-white/40">{seasonData.episodes.length}</span>
                  </h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {show?.seasons?.filter((se) => se.season_number > 0).map((se) => (
                      <Link
                        key={se.season_number}
                        to={`/watch/tv/${id}/${se.season_number}/1`}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter border transition-all whitespace-nowrap ${
                          se.season_number === s
                            ? "bg-primary border-primary text-white"
                            : "bg-white/5 border-white/5 text-white/60 hover:border-primary/50 hover:text-white"
                        }`}
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
                      <Link
                        key={ep.id}
                        to={`/watch/tv/${id}/${s}/${ep.episode_number}`}
                        className={`flex gap-4 p-3 rounded-2xl border transition-all group ${
                          active
                            ? "bg-primary/10 border-primary/40"
                            : "bg-white/5 border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="relative w-32 sm:w-44 aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                          <img
                            src={imgUrl(ep.still_path ?? null, "w300")}
                            alt={ep.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {active && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-[9px] font-black uppercase italic tracking-widest text-primary">Now Playing</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0 py-1">
                          <p className={`text-xs font-black uppercase italic tracking-tighter line-clamp-1 ${active ? "text-primary" : "text-white group-hover:text-primary transition-colors"}`}>
                            E{ep.episode_number} • {ep.name || "Episode"}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <span>{ep.air_date || "TBA"}</span>
                            {ep.runtime ? <span>{ep.runtime} Min</span> : null}
                          </div>
                          {ep.overview && (
                            <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mt-2 hidden sm:block">{ep.overview}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Next Episode</h3>
            {nextEp ? (
              <Link to={`/watch/tv/${id}/${nextEp.season_number}/${nextEp.episode_number}`} className="flex gap-4 group">
                <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 relative shadow-2xl border border-white/5">
                  <img src={imgUrl(nextEp.still_path || show?.backdrop_path, "w300")} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                  <h4 className="font-black uppercase italic text-xs line-clamp-1 group-hover:text-primary transition-colors">E{nextEp.episode_number} - {nextEp.name}</h4>
                  <span className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest italic">Up Next</span>
                </div>
              </Link>
            ) : (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-white/20 font-black uppercase text-[10px] tracking-widest italic">Season Finale Reached</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
