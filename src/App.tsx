import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";

import Index from "./pages/Index";
import MovieDetails from "./pages/MovieDetails";
import TvDetails from "./pages/TvDetails";
import WatchMovie from "./pages/WatchMovie";
import WatchTv from "./pages/WatchTv";
import SearchPage from "./pages/SearchPage";
import Watchlist from "./pages/Watchlist";
import TvShows from "./pages/TvShows";
import Movies from "./pages/Movies";
import NotFound from "./pages/NotFound";

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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuroraBackdrop />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundaryWithReset>
            <Navbar />
            <AnimatedRoutes />
          </ErrorBoundaryWithReset>
        </BrowserRouter>
      </TooltipProvider>
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
