import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

interface Props {
  title: string;
  movies: Movie[] | undefined;
  type?: "movie" | "tv";
  showRank?: boolean;
}

export default function ContentRow({ title, movies, type, showRank }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeMovies = movies ?? [];

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scroll(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scroll(-1);
    }
  };

  if (!safeMovies.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 px-4 sm:px-0">
        {title}
      </h2>
      <div className="relative group/row">
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-background/80 to-transparent opacity-0 group-hover/row:opacity-100 tv-show-always transition-opacity focus-visible:opacity-100"
        >
          <ChevronLeft className="w-7 h-7 text-foreground" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-background/80 to-transparent opacity-0 group-hover/row:opacity-100 tv-show-always transition-opacity focus-visible:opacity-100"
        >
          <ChevronRight className="w-7 h-7 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          onKeyDown={handleKeyDown}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-2"
        >
          {safeMovies.map((m, i) => (
            <MovieCard key={m.id} movie={m} type={type} rank={showRank ? i + 1 : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}
