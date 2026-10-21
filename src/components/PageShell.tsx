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
    <main ref={ref} className={className} style={style}>
      {children}
    </main>
  );
}
