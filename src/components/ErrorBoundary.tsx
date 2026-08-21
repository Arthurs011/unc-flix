import { Component, ReactNode } from "react";
import { motion } from "motion/react";
import { RefreshCw, Home, AlertTriangle, ChevronDown } from "lucide-react";
import { EASE } from "@/lib/motion";

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
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-red-500/[0.06] blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative text-center max-w-lg w-full"
        >
          <div className="mx-auto mb-7 w-16 h-16 rounded-3xl bg-red-500/10 ring-1 ring-red-500/25 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-red-400/80 mb-3">
            Transmission Interrupted
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-[0.95] mb-4">
            Something broke the stream
          </h1>
          <p className="text-white/45 text-sm sm:text-base leading-relaxed mb-9 max-w-md mx-auto">
            An unexpected error interrupted this page. Navigating away resets it automatically —
            or jump back home and pick up where you left off.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2.5 h-12 px-7 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow hover:scale-[1.03] active:scale-95 transition-transform"
            >
              <RefreshCw className="w-4 h-4" />
              Reload
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="flex items-center gap-2.5 h-12 px-7 rounded-full glass ring-1 ring-white/15 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>

          {this.state.error && (
            <div className="text-left rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.07] overflow-hidden">
              <button
                onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
                className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
              >
                Error Details
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${this.state.showDetails ? "rotate-180" : ""}`} />
              </button>
              {this.state.showDetails && (
                <pre className="px-5 pb-5 pt-1 text-[11px] leading-relaxed text-white/35 whitespace-pre-wrap break-words font-mono max-h-48 overflow-y-auto scrollbar-hide">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }
}
