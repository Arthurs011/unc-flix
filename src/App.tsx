import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { MotionConfig } from "motion/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { HeroSkeleton } from "@/components/LoadingSkeleton";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/BackToTop";
import ScrollManager from "@/components/ScrollManager";
import ShortcutsDialog from "@/components/ShortcutsDialog";
import PageShell from "@/components/PageShell";
import { AuthProvider } from "@/contexts/AuthProvider";

import { lazy, Suspense, useEffect, useState } from "react";

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
  <div className="aurora" aria-hidden="true">
    <div className="aurora-blob aurora-blob-1" />
    <div className="aurora-blob aurora-blob-2" />
    <div className="aurora-blob aurora-blob-3" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
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
  );
};

const App = () => {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // "?" opens the shortcut list from anywhere, as long as the visitor is not
  // typing into a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setShortcutsOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <AuroraBackdrop />
        <Toaster position="bottom-right" theme="dark" richColors />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundaryWithReset>
              <a
                href="#main-content"
                className="visually-hidden-focusable position-fixed top-0 start-0 z-100 m-2 btn btn-gradient btn-sm"
              >
                Skip to content
              </a>
              <Navbar onOpenShortcuts={() => setShortcutsOpen(true)} />
              <ScrollManager />
              <Suspense
                /* The fallback keeps the main landmark, so the skip link
                   still has a target while a lazy route is loading. */
                fallback={
                  <PageShell className="min-vh-100">
                    <HeroSkeleton />
                  </PageShell>
                }
              >
                <AnimatedRoutes />
              </Suspense>
              <BackToTop />
              {shortcutsOpen && (
                <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />
              )}
            </ErrorBoundaryWithReset>
          </AuthProvider>
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
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
