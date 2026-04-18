import { lazy, Suspense, useEffect, Component, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { syncFromCloud, pushLocalToCloud } from "@/lib/storage";

const Index = lazy(() => import("./pages/Index"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TvDetails = lazy(() => import("./pages/TvDetails"));
const WatchMovie = lazy(() => import("./pages/WatchMovie"));
const WatchTv = lazy(() => import("./pages/WatchTv"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const TvShows = lazy(() => import("./pages/TvShows"));
const Movies = lazy(() => import("./pages/Movies"));
const Auth = lazy(() => import("./pages/Auth"));
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
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
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
            <h1 className="text-3xl font-bold text-foreground mb-3">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
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

const SyncOnLogin = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    pushLocalToCloud()
      .then(() => syncFromCloud())
      .catch(() => {});
  }, [user?.id]);
  return null;
};

const AppRoutes = () => (
  <BrowserRouter>
    <SyncOnLogin />
    <Navbar />
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TvDetails />} />
        <Route path="/watch/movie/:id" element={<WatchMovie />} />
        <Route path="/watch/tv/:id/:season/:episode" element={<WatchTv />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/tv" element={<TvShows />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
