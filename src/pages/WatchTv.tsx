import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, MovieDetails } from "@/lib/tmdb";
import { useFullscreenOrientation } from "@/hooks/useFullscreenOrientation";
import { DEFAULT_SERVER_ID, getServer, getNextServerId } from "@/lib/servers";
import ServerPicker from "@/components/ServerPicker";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "tr", label: "Türkçe" },
  { code: "hi", label: "हिन्दी" },
];

export default function WatchTv() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  useFullscreenOrientation();
  const [show, setShow] = useState<MovieDetails | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [lang, setLang] = useState("en");
  const [serverId, setServerId] = useState<string>(DEFAULT_SERVER_ID);
  const [autoFellBack, setAutoFellBack] = useState(false);
  const s = Number(season) || 1;
  const e = Number(episode) || 1;
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    tmdb.tvDetails(Number(id)).then((d) => {
      setShow(d);
      updateContinueWatching({
        id: d.id,
        type: "tv",
        title: getTitle(d),
        poster_path: d.poster_path,
        backdrop_path: d.backdrop_path,
        progress: Math.floor(Math.random() * 60) + 10,
        season: s,
        episode: e,
        timestamp: Date.now(),
      });
    }).catch(() => {});
  }, [id, s, e]);

  useEffect(() => {
    setShowFallback(false);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      const next = getNextServerId(serverId);
      if (next && !autoFellBack) {
        setAutoFellBack(true);
        setServerId(next);
      } else {
        setShowFallback(true);
      }
    }, 15000);
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [id, s, e, serverId]);

  // Reset auto-fallback when changing episode/show.
  useEffect(() => {
    setAutoFellBack(false);
    setServerId(DEFAULT_SERVER_ID);
  }, [id, s, e]);

  const currentSeason = show?.seasons?.find((ss) => ss.season_number === s);
  const episodeCount = currentSeason?.episode_count || 10;
  const server = getServer(serverId);
  const embedSrc = id
    ? server.build({ type: "tv", id, season: s, episode: e, lang: server.supportsLang ? lang : undefined })
    : "";

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="glass-strong px-4 py-3 flex items-center gap-3 z-10 flex-wrap">
        <Link to={`/tv/${id}`} className="p-2 rounded-full hover:bg-secondary transition-colors text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-medium text-foreground truncate max-w-[120px] sm:max-w-none">
          {show ? getTitle(show) : "Loading..."}
        </span>

        <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
          {/* Server selector */}
          <ServerPicker
            value={serverId}
            onChange={(next) => {
              setAutoFellBack(true);
              setServerId(next);
            }}
          />

          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5 border border-border">
            <Languages className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={lang}
              onChange={(ev) => setLang(ev.target.value)}
              className="bg-transparent text-foreground text-sm outline-none cursor-pointer"
              data-testid="select-language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Season selector */}
          <select
            value={s}
            onChange={(ev) => navigate(`/watch/tv/${id}/${ev.target.value}/1`)}
            className="bg-secondary text-foreground text-sm rounded-lg px-3 py-1.5 outline-none border border-border"
            data-testid="select-season"
          >
            {show?.seasons?.filter((ss) => ss.season_number > 0).map((ss) => (
              <option key={ss.season_number} value={ss.season_number}>
                Season {ss.season_number}
              </option>
            ))}
          </select>

          {/* Episode selector */}
          <select
            value={e}
            onChange={(ev) => navigate(`/watch/tv/${id}/${s}/${ev.target.value}`)}
            className="bg-secondary text-foreground text-sm rounded-lg px-3 py-1.5 outline-none border border-border"
            data-testid="select-episode"
          >
            {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
              <option key={ep} value={ep}>Episode {ep}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe
          key={`${id}-${s}-${e}-${serverId}-${lang}`}
          src={embedSrc}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock"
          referrerPolicy="no-referrer"
          title="TV Player"
          onLoad={() => {
            if (fallbackTimerRef.current) {
              clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }
            setShowFallback(false);
          }}
        />
        {showFallback && (
          <div className="absolute top-4 right-4 z-10">
            <a
              href={embedSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm text-foreground rounded-lg text-sm font-medium hover:bg-background/90 transition-colors border border-border"
            >
              Video not loading? Open in new tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
