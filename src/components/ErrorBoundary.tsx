import { Component, ReactNode } from "react";
import { RefreshCw, Home, AlertTriangle, ChevronDown } from "lucide-react";

interface Props {
  children: ReactNode;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  private lastResetKeys: unknown[] = [];

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      this.lastResetKeys = this.props.resetKeys ?? [];
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center px-3 position-relative overflow-hidden route-enter">
        <div className="uf-error-blob position-absolute pointer-events-none" aria-hidden="true" />

        <div className="position-relative text-center w-100" style={{ maxWidth: "32rem" }}>
          <div
            className="rounded-4 d-inline-flex align-items-center justify-content-center mb-4"
            style={{
              width: "4rem",
              height: "4rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <AlertTriangle size={28} style={{ color: "#f87171" }} />
          </div>

          <p className="kicker mb-3" style={{ color: "rgba(248,113,113,0.8)", letterSpacing: "0.35em" }}>
            Transmission Interrupted
          </p>
          <h1 className="fw-black text-white mb-3" style={{ fontSize: "clamp(2rem, 6vw, 3rem)", letterSpacing: "-0.04em", lineHeight: 0.95 }}>
            Something broke the stream
          </h1>
          <p className="mb-4 mx-auto" style={{ maxWidth: "28rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
            An unexpected error interrupted this page. Navigating away resets it automatically —
            or jump back home and pick up where you left off.
          </p>

          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 mb-4">
            <button onClick={() => window.location.reload()} className="uf-btn uf-btn-md btn-gradient rounded-pill">
              <RefreshCw size={16} />
              Reload
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="uf-btn uf-btn-md uf-btn-glass rounded-pill"
            >
              <Home size={16} />
              Go Home
            </button>
          </div>

          {this.state.error && (
            <div className="text-start rounded-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                className="d-flex align-items-center justify-content-between w-100 border-0 px-4 py-3 text-uppercase"
                style={{
                  background: "transparent",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "var(--uf-muted)",
                }}
              >
                Error Details
                <ChevronDown size={16} className={this.state.showDetails ? "rotate-180" : ""} style={{ transition: "transform 300ms ease" }} />
              </button>
              {this.state.showDetails && (
                <pre className="px-4 pb-4 pt-1 mb-0 scrollbar-hide" style={{ fontSize: "11px", lineHeight: 1.7, color: "var(--uf-muted)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: "12rem", overflowY: "auto" }}>
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
