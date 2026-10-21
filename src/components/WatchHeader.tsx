import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";
import { revealNow } from "@/lib/anim";

interface Props {
  to: string;
  label: string;
  title: string;
  badge?: string;
}

export default function WatchHeader({ to, label, title, badge }: Props) {
  const hidden = useAutoHideNav();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    revealNow(ref.current, { y: -60, duration: 500 });
  }, []);

  return (
    <header
      ref={ref}
      className={`uf-watch-header position-fixed top-0 start-0 end-0 z-50 d-flex justify-content-center pointer-events-none pt-3 ${
        hidden ? "uf-watch-header-hidden" : ""
      }`}
    >
      <div className="pointer-events-auto d-flex align-items-center gap-2 gap-md-3 glass-strong rounded-pill shadow-card px-2 px-md-3 py-2" style={{ maxWidth: "92vw", height: "3.5rem" }}>
        <Link
          to={to}
          aria-label="Back to details"
          className="uf-icon-btn rounded-circle border-0 flex-shrink-0 text-white-75"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <ArrowLeft size={20} />
        </Link>

        <span className="d-none d-sm-block flex-shrink-0" style={{ width: 1, height: "1.5rem", background: "rgba(255,255,255,0.1)" }} />

        <div style={{ minWidth: 0 }}>
          <p className="kicker mb-1 lh-1" style={{ fontSize: "9px" }}>
            {label}
            {badge && <span className="ms-2" style={{ color: "rgba(255,255,255,0.4)" }}>{badge}</span>}
          </p>
          <h1 className="mb-0 text-truncate fw-semibold text-white-90" style={{ fontSize: "0.8rem", letterSpacing: "-0.01em" }}>
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
