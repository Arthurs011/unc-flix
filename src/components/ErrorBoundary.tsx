import { Component, type ReactNode } from "react";
import { motion } from "motion/react";
import { AlertTriangle, ChevronDown, Home, RefreshCw } from "lucide-react";
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
  state: State = { hasError: false, error: null, showDetails: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.state.hasError) return;
    const previous = prevProps.resetKeys?.join("|") ?? "";
    const next = this.props.resetKeys?.join("|") ?? "";
    if (previous !== next) this.setState({ hasError: false, error: null, showDetails: false });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] px-4 py-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/[0.05] blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-red-300/15 bg-red-300/[0.06] text-red-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-red-200/65">Transmission interrupted</p>
          <h1 className="text-balance text-3xl font-black leading-tight tracking-[-0.045em] text-white sm:text-4xl">The reel went blank</h1>
          <p className="mx-auto mb-8 mt-4 max-w-md text-sm leading-7 text-white/42">Something unexpected interrupted this page. Reload the experience, or return to the archive and keep exploring.</p>
          <div className="mb-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <button type="button" onClick={() => window.location.reload()} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#080a0f] transition-colors hover:bg-sky-100">
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>
            <button type="button" onClick={() => { window.location.href = "/"; }} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.045] px-5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white">
              <Home className="h-4 w-4" />
              Go home
            </button>
          </div>

          {this.state.error && (
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] text-left">
              <button type="button" onClick={() => this.setState((state) => ({ showDetails: !state.showDetails }))} className="flex w-full items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-white/70">
                Error details
                <ChevronDown className={`h-4 w-4 transition-transform ${this.state.showDetails ? "rotate-180" : ""}`} />
              </button>
              {this.state.showDetails && (
                <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words px-4 pb-4 font-mono text-[10px] leading-relaxed text-white/30">
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
