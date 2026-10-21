import { useRef, useEffect } from "react";
import { revealNow } from "@/lib/anim";

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Route-level wrapper with a mount fade. The entrance is applied by anime.js
 * after mount — the content is visible by default, so a failed or skipped
 * animation can never leave the page blank.
 */
export default function PageShell({ children, className, style }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    revealNow(ref.current, { y: 18, duration: 400 });
  }, []);
  return (
    // `id="main-content"` is the skip link's target (App.tsx). Without it the
    // link pointed at nothing and the browser had nowhere to jump to, which
    // Lighthouse reports as "skip links are not focusable". `tabIndex={-1}`
    // makes the landmark programmatically focusable so the jump lands on it.
    <main id="main-content" tabIndex={-1} ref={ref} className={className} style={style}>
      {children}
    </main>
  );
}
