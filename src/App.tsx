import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
