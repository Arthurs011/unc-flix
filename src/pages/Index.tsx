import { useEffect, useState, useRef } from "react";
import { Movie, tmdb } from "@/lib/tmdb";
import { getRecentlyViewed } from "@/lib/storage";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import ContinueRow from "@/components/ContinueRow";
import PageShell from "@/components/PageShell";
import { usePageTitle } from "@/hooks/usePageTitle";
import { HeroSkeleton, RowSkeleton } from "@/components/LoadingSkeleton";
import { cn } from "@/lib/utils";
import { revealStagger } from "@/lib/anim";
import "@/styles/browse.css";

const MOOD_PILLS = [
  { id: 28, name: "Action" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export default function Index() {
  usePageTitle();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [recent, setRecent] = useState<Movie[]>([]);
  const continueList = useContinueWatching();

  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreResults, setGenreResults] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [error, setError] = useState(false);

  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      tmdb.trending(),
      tmdb.popular(),
      tmdb.topRated(),
      tmdb.tvPopular(),
      tmdb.upcoming(),
    ])
      .then(([t, p, tr, tv, u]) => {
        setTrending(t?.results ?? []);
        setPopular(p?.results ?? []);
        setTopRated(tr?.results ?? []);
        setTvShows(tv?.results ?? []);
        setUpcoming(u?.results ?? []);
        setRecent(getRecentlyViewed() || []);
      })
      .catch((err) => {
        console.error("TMDB Fetch Error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGenre === null) {
      setGenreResults([]);
      return;
    }
    setLoadingGenre(true);
    tmdb.popular(1, selectedGenre)
      .then((res) => setGenreResults(res.results ?? []))
      .catch(() => setGenreResults([]))
      .finally(() => setLoadingGenre(false));
  }, [selectedGenre]);

  // Animate mood pills once they mount (they sit behind the loading
  // skeleton). The pills are visible by default; the stagger only dips them
  // to opacity 0 if it actually runs.
  useEffect(() => {
    if (!pillsRef.current) return;
    revealStagger(Array.from(pillsRef.current.querySelectorAll("button")), {
      step: 30,
      y: 10,
      duration: 400,
    });
  }, [loading]);

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div className="text-center" style={{ maxWidth: "28rem" }}>
          <h2
            className="fw-extrabold text-white mb-3"
            style={{ fontSize: "1.875rem", letterSpacing: "-0.02em" }}
          >
            Something went wrong
          </h2>
          <p className="text-body-secondary" style={{ marginBottom: "2rem" }}>
            We couldn't load the content. Please check your internet connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="uf-btn uf-btn-md btn-gradient rounded-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-vh-100">
        <HeroSkeleton />
        <div className="page-container mt-5" style={{ paddingBottom: "8rem" }}>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <PageShell className="min-vh-100">
      <HeroBanner movies={trending} />

      <div className="page-container uf-overlap">
        {/* Mood pills */}
        <div
          ref={pillsRef}
          className="d-flex gap-2 overflow-x-auto scrollbar-hide py-3 mb-4"
        >
          {[{ id: null as number | null, name: "Everything" }, ...MOOD_PILLS].map((g) => (
            <button
              key={g.name}
              onClick={() => setSelectedGenre(g.id)}
              className={cn("uf-chip", selectedGenre === g.id && "active")}
            >
              {g.name}
            </button>
          ))}
        </div>

        {selectedGenre !== null ? (
          <div>
            {loadingGenre ? (
              <RowSkeleton />
            ) : (
              <ContentRow
                title={`${MOOD_PILLS.find((p) => p.id === selectedGenre)?.name} Spotlight`}
                kicker="Curated for you"
                movies={genreResults}
              />
            )}
          </div>
        ) : (
          <div>
            {continueList.length > 0 && <ContinueRow />}

            <ContentRow title="Trending This Week" kicker="Top 10" movies={trending} showRank exploreTo="/movies" />
            <ContentRow title="Popular Movies" kicker="Everyone is watching" movies={popular} exploreTo="/movies" />
            <ContentRow title="Top Rated Movies" kicker="Critically acclaimed" movies={topRated} exploreTo="/movies" />
            <ContentRow title="Popular TV Shows" kicker="Binge-worthy" movies={tvShows} type="tv" exploreTo="/tv" />
            <ContentRow title="Coming Soon" kicker="Fresh releases" movies={upcoming} exploreTo="/movies" />

            {recent.length > 0 && <ContentRow title="Recently Viewed" movies={recent} />}
          </div>
        )}
      </div>
    </PageShell>
  );
}
