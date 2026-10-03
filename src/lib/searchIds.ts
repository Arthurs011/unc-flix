import { useId } from "react";
import { searchResultKey } from "./search";
import type { Movie } from "./tmdb";

/** What the suggestion list needs from the search field that owns it. */
export interface SuggestionState {
  query: string;
  items: Movie[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasSearched: boolean;
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (item: Movie) => void;
  listboxId: string;
}

/**
 * DOM ids for the search combobox.
 *
 * Kept out of the component files so they can export these without tripping the
 * fast-refresh rule, and so the input, the listbox and the active option
 * cannot drift onto different id schemes.
 */
export function useSearchComboboxIds() {
  const uid = useId();
  return {
    listboxId: `${uid}-listbox`,
    inputId: `${uid}-input`,
  };
}

/** The id of one option row, referenced by aria-activedescendant. */
export function optionDomId(listboxId: string, item: Movie): string {
  return `${listboxId}-option-${searchResultKey(item).replace(":", "-")}`;
}
