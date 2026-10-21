import { useEffect, useRef } from "react";
import { Keyboard, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Search titles" },
  { keys: ["Ctrl", "K"], label: "Search titles" },
  { keys: ["←", "→"], label: "Previous / next episode" },
  { keys: ["F"], label: "Toggle fullscreen" },
  { keys: ["?"], label: "Open this list" },
  { keys: ["Esc"], label: "Close a dialog" },
];

/**
 * The shortcut list.
 *
 * The app had a hidden shortcut (⌘K) and nothing else. A visitor had no way
 * to know it existed, and a power user had no way to know what else worked.
 */
export default function ShortcutsDialog({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="uf-trailer-overlay"
      style={{ alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        className="uf-shortcuts glass-strong"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "min(24rem, calc(100vw - 2rem))", padding: "1.75rem" }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close shortcuts"
          className="uf-icon-btn rounded-circle border-0 position-absolute top-0 end-0 m-3"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          <X size={18} />
        </button>

        <p className="kicker mb-2 d-flex align-items-center gap-2">
          <Keyboard size={14} />
          Shortcuts
        </p>
        <h2 className="uf-section-title mb-4">Keyboard control</h2>

        <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="d-flex align-items-center justify-content-between gap-3">
              <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)" }}>{s.label}</span>
              <span className="d-flex align-items-center gap-1 flex-shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="uf-kbd"
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.2rem 0.45rem",
                      borderRadius: "0.4rem",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "#fff",
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
