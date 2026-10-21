import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** Small, inline variant for a failure that sits above content that loaded. */
  compact?: boolean;
}

/**
 * A failure the user can act on.
 *
 * Browse pages used to swallow a failed request and render "no matches
 * found", which reads as "this genre is empty" rather than "TMDB is down".
 * An outage and an empty result are different things and they need different
 * copy, so the error gets its own state.
 */
export default function ErrorState({
  title = "We couldn't reach the service",
  message = "The catalogue did not load. Check your connection and try again.",
  onRetry,
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div
        role="status"
        className="d-flex align-items-center gap-3 rounded-4 px-4 py-3"
        style={{
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.3)",
          color: "rgba(254,243,199,0.92)",
          fontSize: "0.875rem",
        }}
      >
        <AlertTriangle size={18} style={{ color: "#fbbf24" }} className="flex-shrink-0" />
        <span className="flex-grow-1">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="uf-btn uf-btn-ghost rounded-pill flex-shrink-0"
            style={{ fontSize: "0.6875rem", letterSpacing: "0.1em", padding: "0.375rem 0.75rem" }}
          >
            <RefreshCw size={13} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="text-center rounded-4"
      style={{
        padding: "6rem 1.5rem",
        background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.28)",
      }}
    >
      <AlertTriangle size={52} style={{ color: "rgba(251,191,36,0.7)" }} className="mx-auto mb-4" />
      <h2 className="fw-extrabold mb-2" style={{ fontSize: "1.25rem", letterSpacing: "-0.02em", color: "var(--uf-fg)" }}>
        {title}
      </h2>
      <p
        className="mb-4 mx-auto"
        style={{ maxWidth: "26rem", color: "var(--uf-muted)", fontSize: "0.875rem", lineHeight: 1.7 }}
      >
        {message}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="uf-btn uf-btn-md btn-gradient rounded-pill px-4">
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
