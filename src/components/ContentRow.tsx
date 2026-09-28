import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/lib/tmdb";

interface Props {
  title: string;
  results: Movie[];
  type?: "movie" | "tv";
  description?: string;
  eyebrow?: string;
}

export default function ContentRow({ title, results, type, description, eyebrow }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    rowRef.current?.scrollBy({ left: direction * Math.min(rowRef.current.clientWidth * 0.8, 760), behavior: "smooth" });
  };

  if (!results.length) return null;

  return (
    <section className="group/section py-7 sm:py-9" aria-labelledby={`row-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="section-shell">
        <div className="mb-4 flex items-end justify-between gap-5 sm:mb-5">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/85">
                {eyebrow}
              </p>
            )}
            <h2
              id={`row-${title.replace(/\s+/g, "-").toLowerCase()}`}
              className="text-balance text-lg font-bold tracking-tight text-white sm:text-2xl"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 max-w-2xl text-xs text-white/45 sm:text-sm">
                {description}
              </p>
            )}
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover/section:opacity-100 lg:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={`Scroll ${title} left`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={`Scroll ${title} right`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#06070a] to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#06070a] to-transparent sm:w-16" />
        <div
          ref={rowRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 sm:gap-4 sm:px-6 lg:px-10 xl:px-12"
          role="region"
          aria-label={title}
          tabIndex={0}
        >
          {results.map((movie, index) => (
            <MovieCard
              key={`${movie.media_type ?? type ?? "m"}:${movie.id}:${index}`}
              movie={movie}
              type={type}
              className="w-[150px] shrink-0 snap-start sm:w-[172px] md:w-[188px] lg:w-[200px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
