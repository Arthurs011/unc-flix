import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { updateContinueWatching } from "@/lib/storage";
import { tmdb, getTitle, MovieDetails } from "@/lib/tmdb";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "tr", label: "Türkçe" },
];

export default function WatchTv() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState<MovieDetails | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [lang, setLang] = useState("en");
  const s = Number(season) || 1;
  const e = Number(episode) || 1;

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
    const timer = setTimeout(() => setShowFallback(true), 15000);
    return () => clearTimeout(timer);
  }, [id, s, e]);

  const currentSeason = show?.seasons?.find((ss) => ss.season_number === s);
  const episodeCount = currentSeason?.episode_count || 10;
  const embedSrc = `https://vsembed.ru/embed/tv/${id}/${s}/${e}?lang=${lang}`;

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
          key={`${id}-${s}-${e}-${lang}`}
          src={embedSrc}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen"
          title="TV Player"
        />
        {showFallback && (
          <div className="absolute bottom-4 right-4 z-10">
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
