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
    <div className="uf-suggestions z-50">
      {showSkeleton && (
        <div
          role="status"
          className="d-flex align-items-center gap-2 px-4 py-4 text-uppercase small fw-bold"
          style={{ letterSpacing: "0.12em", color: "var(--uf-muted)", fontSize: "0.75rem" }}
        >
          <Loader2 className="spin text-primary" size={16} />
          Searching
        </div>
      )}

      {showError && (
        <p role="status" className="d-flex align-items-center gap-2 px-4 py-4 mb-0 small" style={{ color: "#fde68a" }}>
          <WifiOff size={16} className="flex-shrink-0" />
          Could not reach search. Check your connection and try again.
        </p>
      )}

      {showIdle && (
        <p className="px-4 py-4 mb-0 small" style={{ color: "var(--uf-muted)" }}>
          Keep typing to search.
        </p>
      )}

      {showEmpty && (
        <p className="d-flex align-items-center gap-2 px-4 py-4 mb-0 small" style={{ color: "var(--uf-muted)" }}>
          <SearchX size={16} className="flex-shrink-0" />
          No results for &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {items.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="list-unstyled m-0 p-2 overflow-y-auto"
          style={{ maxHeight: "min(60vh, 26rem)", overscrollBehavior: "contain" }}
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
                className="rounded-3"
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
                  data-active={selected ? "true" : undefined}
                  className="uf-suggestion-row rounded-3 border-0"
                >
                  <span
                    className="d-flex align-items-center justify-content-center overflow-hidden rounded-2 flex-shrink-0"
                    style={{ width: "2.25rem", height: "3.25rem", background: "rgba(255,255,255,0.06)" }}
                  >
                    {item.poster_path ? (
                      <img src={posterUrl(item, "w92")} alt="" loading="lazy" className="uf-suggestion-poster" />
                    ) : isTV ? (
                      <Tv size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
                    ) : (
                      <Film size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
                    )}
                  </span>

                  <span className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className="d-block text-truncate small fw-semibold text-white">{getTitle(item)}</span>
                    <span className="d-flex align-items-center gap-2 mt-1">
                      {getYear(item) && (
                        <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--uf-muted)" }}>
                          {getYear(item)}
                        </span>
                      )}
                      <span
                        className="rounded-2 text-uppercase"
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          padding: "0.2rem 0.4rem",
                          background: isTV ? "rgba(99,102,241,0.15)" : "rgba(14,165,233,0.15)",
                          color: isTV ? "#a5b4fc" : "#7dd3fc",
                        }}
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
    </div>
  );
}
