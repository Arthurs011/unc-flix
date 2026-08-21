import { lazy, Suspense, Component, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";

const Index = lazy(() => import("./pages/Index"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TvDetails = lazy(() => import("./pages/TvDetails"));
const WatchMovie = lazy(() => import("./pages/WatchMovie"));
const WatchTv = lazy(() => import("./pages/WatchTv"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const TvShows = lazy(() => import("./pages/TvShows"));
const Movies = lazy(() => import("./pages/Movies"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
  </div>
);

const AuroraBackdrop = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background">
    <motion.div
      animate={{ x: [0, 60, -20, 0], y: [0, -40, 30, 0] }}
      transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full bg-sky-500/[0.07] blur-[140px]"
    />
    <motion.div
      animate={{ x: [0, -70, 40, 0], y: [0, 50, -30, 0] }}
      transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/3 -right-56 w-[720px] h-[720px] rounded-full bg-indigo-600/[0.07] blur-[160px]"
    />
    <motion.div
      animate={{ x: [0, 40, -50, 0], y: [0, -30, 20, 0] }}
      transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -bottom-64 left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-600/[0.04] blur-[150px]"
    />
  </div>
);

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-transform"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TvDetails />} />
        <Route path="/watch/movie/:id" element={<WatchMovie />} />
        <Route path="/watch/tv/:id/:season/:episode" element={<WatchTv />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/tv" element={<TvShows />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuroraBackdrop />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Suspense fallback={<PageFallback />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
