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
import ErrorState from "@/components/ErrorState";
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
  // Which rails failed. One dead endpoint must not blank the whole home page.
  const [failed, setFailed] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);

  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const requests: [string, () => Promise<{ results?: Movie[] }>][] = [
      ["trending", () => tmdb.trending()],
      ["popular", () => tmdb.popular()],
      ["topRated", () => tmdb.topRated()],
      ["tv", () => tmdb.tvPopular()],
      ["upcoming", () => tmdb.upcoming()],
    ];

    // Promise.all used to reject on the first failure, which emptied every
    // rail because one endpoint had a bad day. Settled results let each rail
    // stand or fall on its own.
    Promise.allSettled(requests.map(([, run]) => run())).then((results) => {
      if (cancelled) return;

      const broken: string[] = [];
      results.forEach((result, i) => {
        const name = requests[i][0];
        if (result.status === "rejected") {
          console.error(`TMDB fetch failed: ${name}`, result.reason);
          broken.push(name);
          return;
        }
        const list = result.value?.results ?? [];
        if (name === "trending") setTrending(list);
        if (name === "popular") setPopular(list);
        if (name === "topRated") setTopRated(list);
        if (name === "tv") setTvShows(list);
        if (name === "upcoming") setUpcoming(list);
      });

      setFailed(broken);
      setError(broken.length === requests.length);
      setRecent(getRecentlyViewed() || []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

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
      <PageShell className="min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div style={{ maxWidth: "32rem" }}>
          <ErrorState
            title="The catalogue did not load"
            message="We couldn't reach the movie service. This is usually temporary — check your connection and try again."
            onRetry={() => setAttempt((a) => a + 1)}
          />
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell className="min-vh-100">
        <HeroSkeleton />
        <div className="page-container mt-5" style={{ paddingBottom: "8rem" }}>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="min-vh-100">
      <HeroBanner movies={trending} />

      <div className="page-container uf-overlap">
        {failed.length > 0 && (
          <div className="mb-4">
            <ErrorState
              compact
              message={`Some rows did not load (${failed.length} of 5). The rest of the page is live.`}
              onRetry={() => setAttempt((a) => a + 1)}
            />
          </div>
        )}

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
