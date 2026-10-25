import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, TriangleAlert, X } from "lucide-react";
import { imgUrl } from "@/lib/tmdb";
import CustomPlayer from "./CustomPlayer";

interface Props {
  src: string;
  title: string;
  poster?: string | null;
  playing?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const LOAD_TIMEOUT_MS = 15000;

export default function CustomPlayerFrame({ src, title, poster, playing = false, onEnded, onTimeUpdate }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    setHintDismissed(false);
    setUseCustom(false);
  }, [src, attempt]);

  useEffect(() => {
    if (loaded || playing || slow) return;
    const timer = window.setTimeout(() => {
      setSlow(true);
      // Try custom player if it's a direct stream
      if (src.includes('.m3u8') || src.includes('.mp4')) {
        setUseCustom(true);
      }
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [loaded, playing, slow, src, attempt]);

  const frameKey = `${src}#${attempt}`;

  const waiting = !loaded && !playing && !slow && !useCustom;
  const showHint = slow && !hintDismissed && !loaded && !playing && !useCustom;

  // Check if src is a direct stream URL
  const isDirectStream = src.includes('.m3u8') || src.includes('.mp4') || src.includes('.ts');

  if (useCustom || isDirectStream) {
    return (
      <div className="uf-stage-player">
        <CustomPlayer 
          src={src} 
          poster={poster} 
          autoPlay={true}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
        />
      </div>
    );
  }

  return (
    <div className="uf-stage-player">
      <iframe
        key={frameKey}
        src={src}
        className="position-absolute top-0 start-0 w-100 h-100 border-0"
        style={{ zIndex: 10 }}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        loading="eager"
        onLoad={() => setLoaded(true)}
      />

      {waiting && (
        <div className="uf-player-wait" role="status" aria-live="polite">
          {poster && (
            <img
              src={imgUrl(poster, "w1280", true)}
              alt=""
              className="uf-player-wait-art"
              aria-hidden="true"
            />
          )}
          <div className="uf-player-wait-body">
            <Loader2 size={26} className="spin text-primary" />
            <p className="mb-0">Starting the player…</p>
          </div>
        </div>
      )}

      {showHint && (
        <div className="uf-player-hint glass-strong" role="status">
          <button
            type="button"
            onClick={() => setHintDismissed(true)}
            aria-label="Dismiss"
            className="uf-icon-btn rounded-circle border-0 position-absolute top-0 end-0 m-1"
            style={{ width: "1.75rem", height: "1.75rem", color: "rgba(255,255,255,0.6)" }}
          >
            <X size={14} />
          </button>
          <p className="uf-player-hint-title">
            <TriangleAlert size={15} style={{ color: "#fbbf24" }} />
            Player taking a while?
          </p>
          <p className="uf-player-hint-text">
            The host may be unreachable. You can wait, reload, or open it directly.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="uf-btn uf-btn-sm uf-btn-glass rounded-pill px-3"
            >
              <RefreshCw size={13} />
              Reload
            </button>
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className="uf-btn uf-btn-sm btn-gradient rounded-pill px-3"
            >
              Try Custom Player
            </button>
            <a
              href={src}
              target="_blank"
              rel="noreferrer noopener"
              className="uf-btn uf-btn-sm btn-gradient rounded-pill px-3"
            >
              <ExternalLink size={13} />
              New tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
