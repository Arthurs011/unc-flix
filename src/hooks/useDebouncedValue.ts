import { useEffect, useState } from "react";

/**
 * Trailing debounce. Returns `value` once it has stopped changing for `delay`.
 *
 * Resetting on every change is what keeps a fast typist to one request instead
 * of one per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}