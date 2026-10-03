import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Film, Loader2, SearchX, Tv, WifiOff } from "lucide-react";
import { getTitle, getYear, posterUrl, type Movie } from "@/lib/tmdb";
import { searchResultKey, titleType } from "@/lib/search";
import { optionDomId, type SuggestionState } from "@/lib/searchIds";

/**
 * The suggestion list. Presentational: SearchBox owns the input, the data and
 * the keyboard, so the desktop nav and the mobile sheet share one
 * implementation instead of two that drift.
 *
 * Renders in normal flow. The caller positions it, because the old hardcoded
 * `absolute top-full` resolved against the bottom of the mobile sheet and
 * pushed the whole panel below the viewport.
 */
export default function SearchDropdown({
  query,
  items,
  isLoading,
  isFetching,
  isError,
  hasSearched,
  activeIndex,
  onHover,
  onSelect,
  listboxId,
}: SuggestionState) {
  const showSkeleton = isLoading || (isFetching && items.length === 0);
  const showError = isError;
  const showEmpty =
    hasSearched && !showSkeleton && !isError && items.length === 0;
  const showIdle = !showSkeleton && !showError && items.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16 }}
      className="z-50 overflow-hidden rounded-2xl bg-background/95 backdrop-blur-2xl ring-1 ring-white/10 shadow-card-lg"
    >
      {showSkeleton && (
        <div
          role="status"
          className="flex items-center gap-2.5 px-4 py-4 text-xs font-semibold uppercase tracking-widest text-white/40"
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Searching
        </div>
      )}

      {showError && (
        <p
          role="status"
          className="flex items-center gap-2.5 px-4 py-4 text-sm text-amber-200/90"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          Could not reach search. Check your connection and try again.
        </p>
      )}

      {showIdle && <p className="px-4 py-4 text-sm text-white/35">Keep typing to search.</p>}

      {showEmpty && (
        <p className="flex items-center gap-3 px-4 py-4 text-sm text-white/40">
          <SearchX className="h-4 w-4 shrink-0" />
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {items.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-1.5"
        >
          {items.map((item, i) => {
            const isTV = titleType(item) === "tv";
            const selected = i === activeIndex;
            return (
              <li
                key={searchResultKey(item)}
                id={optionDomId(listboxId, item)}
                role="option"
                aria-selected={selected}
                className={selected ? "rounded-xl bg-white/[0.06]" : undefined}
              >
                <button
                  // Without type="button" this submits the search form on tap,
                  // which on touch sent users to /search?q=... instead of the title.
                  type="button"
                  // Stop the input losing focus first, which would close the list
                  // before the click landed. Selection happens on click so that
                  // mouse, touch, pen and assistive tech all activate it.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(item)}
                  onPointerEnter={() => onHover(i)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left"
                >
                  <span className="flex h-[54px] w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.06]">
                    {item.poster_path ? (
                      <img
                        src={posterUrl(item, "w92")}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : isTV ? (
                      <Tv className="h-4 w-4 text-white/30" />
                    ) : (
                      <Film className="h-4 w-4 text-white/30" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">
                      {getTitle(item)}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      {getYear(item) && (
                        <span className="text-[10px] font-medium tracking-wide text-white/40">
                          {getYear(item)}
                        </span>
                      )}
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isTV ? "bg-indigo-500/15 text-indigo-300" : "bg-sky-500/15 text-sky-300"
                        }`}
                      >
                        {isTV ? "Series" : "Movie"}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}