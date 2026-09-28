import { useEffect, useState } from "react";
import { getContinueWatching, subscribeContinueWatching, type ContinueItem } from "@/lib/storage";

/** Continue-watching list that stays in step with account sync. */
export function useContinueWatching(): ContinueItem[] {
  const [items, setItems] = useState<ContinueItem[]>(getContinueWatching);

  useEffect(() => {
    setItems(getContinueWatching());
    return subscribeContinueWatching(() => setItems(getContinueWatching()));
  }, []);

  return items;
}
