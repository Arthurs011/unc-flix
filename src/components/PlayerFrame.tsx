import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, TriangleAlert, X } from "lucide-react";
import { imgUrl } from "@/lib/tmdb";

interface Props {
  src: string;
  title: string;
  /** Backdrop or poster shown behind the loading state. */
  poster?: string | null;
  /** True once the embed reports that it is actually playing. */
  playing?: boolean;
}

/** How long the embed gets before we stop covering it and offer a way out. */
const LOAD_TIMEOUT_MS = 12000;

/**
 * The player frame.
 *
 * The embed is a third-party iframe, so the app had no way to tell the
 * difference between "still starting" and "never going to start": the page
 * showed an empty black rectangle, and if the embed refused to load there was
 * nothing on screen to click.
 *
 * The app now owns the wait. The artwork shows through, a spinner says what is
 * happening, and after a deadline the overlay gets out of the way and leaves a
 * small card with a reload and a link to the host. The overlay never outlives
 * its welcome: a slow ad load used to sit on top of a playing video forever.
 */
export default function PlayerFrame({ src, title, poster, playing = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [slow, setSlow] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setSlow(false);
    setHintDismissed(false);
  }, [src, attempt]);

  // The deadline only runs while nothing has arrived.
  useEffect(() => {
    if (loaded || playing || slow) return;
    const timer = window.setTimeout(() => setSlow(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [loaded, playing, slow, src, attempt]);

  // A retry is a new iframe, so the key has to change with it.
  const frameKey = `${src}#${attempt}`;

  const waiting = !loaded && !playing && !slow;
  const showHint = slow && !hintDismissed && !loaded && !playing;

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
