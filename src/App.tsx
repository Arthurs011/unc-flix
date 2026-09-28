import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { EASE } from "@/lib/motion";
import "@/index.css";

const Index = lazy(() => import("@/pages/Index"));
const MovieDetails = lazy(() => import("@/pages/MovieDetails"));
const TvDetails = lazy(() => import("@/pages/TvDetails"));
const Movies = lazy(() => import("@/pages/Movies"));
const TvShows = lazy(() => import("@/pages/TvShows"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const Watchlist = lazy(() => import("@/pages/Watchlist"));
const WatchMovie = lazy(() => import("@/pages/WatchMovie"));
const WatchTv = lazy(() => import("@/pages/WatchTv"));
const Anime = lazy(() => import("@/pages/Anime"));
const Marvel = lazy(() => import("@/pages/Marvel"));
const Animated = lazy(() => import("@/pages/Animated"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function CinematicBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06070a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,22,36,0.5),transparent_60%)]" />
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const routeKey = location.pathname.startsWith("/watch/") ? `${location.pathname}${location.search}` : location.pathname;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function LegacyEpisodeRedirect() {
  const { id, season, episode } = useParams();
  return <Navigate to={`/watch/tv/${id}?season=${season}&episode=${episode}`} replace />;
}

function ErrorBoundaryWithReset({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary resetKeys={[`${location.pathname}${location.search}`]}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundaryWithReset>
          <ScrollToTop />
          <div className="relative min-h-screen bg-background text-foreground">
            <CinematicBackdrop />
            <ScrollProgress />
            <Navbar />
            <div className="noise-overlay pointer-events-none fixed inset-0 z-[60] opacity-[0.018] mix-blend-soft-light" />
            <div className="relative z-10">
              <PageTransition>
                <Suspense fallback={<div className="min-h-[70vh] bg-background" />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/movie/:id" element={<MovieDetails />} />
                    <Route path="/tv/:id" element={<TvDetails />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/tv" element={<TvShows />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/watch/movie/:id" element={<WatchMovie />} />
                    <Route path="/watch/tv/:id" element={<WatchTv />} />
                    <Route path="/watch/tv/:id/:season/:episode" element={<LegacyEpisodeRedirect />} />
                    <Route path="/anime" element={<Anime />} />
                    <Route path="/marvel" element={<Marvel />} />
                    <Route path="/animated" element={<Animated />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
            </div>
            <BackToTop />
          </div>
        </ErrorBoundaryWithReset>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default function AppProviders() {
  return <App />;
}
