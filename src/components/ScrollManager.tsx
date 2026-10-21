import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "uf:scroll:";

/**
 * Scroll restoration.
 *
 * The home page is a stack of rails, so "where you were" is a rail, not a
 * pixel offset from the top. Without this, opening a title and pressing back
 * dropped the visitor on the hero with every row below the fold again.
 *
 * Pushing a new page starts at the top; going back (POP) returns to the
 * offset the page was left at. The offsets live in sessionStorage, so they
 * last as long as the tab and never leak between users of the same browser.
 */
export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.key;

  // The offset of the page we are on right now. It is tracked on every scroll
  // event rather than read at navigation time: by the time a route change has
  // rendered, the browser may already have clamped the old offset to the
  // height of the new page, which would save the wrong number.
  const positionRef = useRef(0);
  const keyRef = useRef(key);

  useEffect(() => {
    const onScroll = () => {
      positionRef.current = window.scrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const previousKey = keyRef.current;
    if (previousKey !== key) {
      try {
        sessionStorage.setItem(STORAGE_PREFIX + previousKey, String(positionRef.current));
      } catch {
        // A storage failure only costs the position, never the page.
      }
    }
    keyRef.current = key;

    if (navigationType === "POP") {
      let saved: string | null = null;
      try {
        saved = sessionStorage.getItem(STORAGE_PREFIX + key);
      } catch {
        saved = null;
      }
      if (saved !== null) {
        const top = Number(saved) || 0;
        // The new page has to be laid out before it can be scrolled to.
        requestAnimationFrame(() => {
          if (canScroll()) window.scrollTo(0, top);
        });
        return;
      }
    }

    // A new page starts at the top.
    if (canScroll()) window.scrollTo(0, 0);
  }, [key, navigationType]);

  return null;
}

/** Whether the document is long enough to scroll at all. */
function canScroll(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.scrollHeight > window.innerHeight + 1;
}
