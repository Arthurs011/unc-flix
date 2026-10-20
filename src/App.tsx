import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HeroSkeleton } from "@/components/LoadingSkeleton";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/BackToTop";
import { AuthProvider } from "@/contexts/AuthProvider";

import { lazy, Suspense } from "react";

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
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));

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
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuroraBackdrop />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ErrorBoundaryWithReset>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:bg-primary focus:text-white focus:shadow-glow"
                >
                  Skip to content
                </a>
                <Navbar />
                <Suspense fallback={<HeroSkeleton />}>
                  <AnimatedRoutes />
                </Suspense>
                <BackToTop />
              </ErrorBoundaryWithReset>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
};

function ErrorBoundaryWithReset({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundary resetKeys={[location.pathname]}>
      {children}
    </ErrorBoundary>
  );
}

export default App;
