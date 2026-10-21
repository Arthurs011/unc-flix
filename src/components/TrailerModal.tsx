import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  /** YouTube video id. */
  videoId: string;
  onClose: () => void;
}

/**
 * The trailer overlay.
 *
 * It used to be a bare div with a close button, which left three problems
 * behind it: Escape did nothing, Tab walked straight into the page underneath
 * while the video was up, and the page behind still scrolled. Keyboard users
 * could get stuck in a dialog they could not dismiss.
 *
 * Now it behaves like a dialog: Escape closes it, Tab is trapped inside it,
 * the page behind is locked, and focus returns to whatever opened it.
 */
export default function TrailerModal({ videoId, onClose }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        frameRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null || el.tagName === "IFRAME");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !frameRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !frameRef.current?.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    // The close button is the only reliable first stop: an iframe swallows
    // focus in some browsers, so focusing it directly can be a no-op.
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trailer"
      className="uf-trailer-overlay"
      onClick={onClose}
    >
      <div ref={frameRef} className="uf-trailer-frame" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Trailer"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-100 h-100"
          style={{ border: 0 }}
        />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close trailer"
          className="uf-trailer-close glass"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
