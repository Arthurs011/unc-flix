import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { Movie } from "@/lib/tmdb";
import { SUGGESTION_LIMIT, isSearchable, searchUrl, titlePath } from "@/lib/search";
import { optionDomId, useSearchComboboxIds } from "@/lib/searchIds";
import { useSearchResults } from "@/hooks/useSearchResults";
import SearchDropdown from "./SearchDropdown";

interface Props {
  /** The pill in the desktop nav collapses on submit; the mobile sheet does not. */
  variant: "pill" | "sheet";
  autoFocus?: boolean;
  /** Fired after a submit navigates, so the caller can close its shell. */
  onSubmitted?: () => void;
  /** Fired when the panel should close without navigating. */
  onDismiss?: () => void;
  /**
   * Optional controlled text. The mobile sheet passes this so it can show its
   * quick-genre chips while the field is empty.
   */
  query?: string;
  onQueryChange?: (value: string) => void;
}

/**
 * The search field, suggestions and keyboard handling as one unit.
 *
 * The desktop nav and the mobile sheet each carried their own copy of this,
 * including the same `navigate('/search?q=' + ...)` string, so the two could
 * drift. Both render this instead.
 */
export default function SearchBox({
  variant,
  autoFocus,
  onSubmitted,
  onDismiss,
  query: controlledQuery,
  onQueryChange,
}: Props) {
  const navigate = useNavigate();
  const { listboxId, inputId } = useSearchComboboxIds();
  const [internalQuery, setInternalQuery] = useState("");
  const query = controlledQuery ?? internalQuery;
  // Stable identity, so it is a safe effect dependency for the parent.
  const setQuery = useCallback(
    (value: string) => {
      if (onQueryChange) onQueryChange(value);
      else setInternalQuery(value);
    },
    [onQueryChange],
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    results,
    isLoading,
    isFetching,
    isError,
    hasSearched,
  } = useSearchResults(query);
  const suggestions = results.slice(0, SUGGESTION_LIMIT);
  const expanded = isSearchable(query);

  // A new term must not leave the highlight pointing past the end of the list.
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const close = () => {
    setQuery("");
    setActiveIndex(-1);
    onDismiss?.();
  };

  const openItem = (item: Movie) => {
    navigate(titlePath(item));
    close();
  };

  const submit = (e?: React.FormEvent) => {
    e.preventDefault();
    if (isSearchable(query)) {
      navigate(searchUrl(query));
      close();
      onSubmitted?.();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      inputRef.current?.blur();
      return;
    }
    if (!suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      // -1 means "nothing highlighted", so stepping down starts at the top.
      setActiveIndex((i) => (i < 0 ? 0 : (i + 1) % suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      // ...and stepping up from there starts at the bottom. Without this branch
      // the arithmetic wraps -1 to the first row instead of the last.
      setActiveIndex((i) => (i < 0 ? suggestions.length - 1 : (i - 1 + suggestions.length) % suggestions.length));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(suggestions.length - 1);
    } else if (e.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      // Only hijack Enter when a row is highlighted; otherwise let the form
      // submit so Enter still reaches the results page.
      e.preventDefault();
      openItem(suggestions[activeIndex]);
    }
  };

  // Keep the highlighted row on screen when arrowing through the list.
  useEffect(() => {
    if (activeIndex < 0) return;
    const row = document.getElementById(optionDomId(listboxId, suggestions[activeIndex]));
    // Not every environment implements scrollIntoView; the highlight still works.
    row?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, listboxId, suggestions]);

  const pill = variant === "pill";

  return (
    <form onSubmit={submit} role="search" className={pill ? "uf-search-form" : "w-100"}>
      <div className="position-relative">
        <Search size={pill ? 16 : 20} className="uf-search-icon" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && suggestions[activeIndex]
              ? optionDomId(listboxId, suggestions[activeIndex])
              : undefined
          }
          aria-label="Search movies and series"
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={pill ? "Search titles..." : "Movies, series..."}
          className={`uf-search-input ${pill ? "" : "uf-search-sheet"}`}
        />
      </div>

      {/* Absolutely positioned on the pill, where the wrapper is already
          relative. In the sheet it flows, because that container scrolls. */}
      <div className={pill ? "uf-search-anchor-pill" : "mt-3"}>
        {expanded && (
          <SearchDropdown
            query={query}
            items={suggestions}
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            hasSearched={hasSearched}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onSelect={openItem}
            listboxId={listboxId}
          />
        )}
      </div>
    </form>
  );
}