import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, UserPlus, Cloud, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { STATE_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function AccountMenu({ className }: { className?: string }) {
  const { user, loading, signOut } = useAuth();
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [location.pathname]);

  if (loading) {
    return (
      <div
        className={cn("rounded-circle flex-shrink-0", className)}
        style={{
          width: "2.75rem",
          height: "2.75rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          animation: "uf-pulse 1.5s ease-in-out infinite",
        }}
      />
    );
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        state={{ from: location.pathname }}
        aria-label="Sign in"
        className={cn("uf-chip uf-chip-sm rounded-pill text-decoration-none", className)}
      >
        <UserPlus size={15} />
        Sign In
      </Link>
    );
  }

  const email = user.email ?? "";
  const displayName = profile.displayName || email.split("@")[0] || "Member";
  const initial = (displayName[0] ?? "?").toUpperCase();

  return (
    <div className={cn("position-relative", className)} ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-expanded={open}
        className="uf-icon-btn rounded-circle border-0 fw-black text-white shadow-glow-sm"
        style={{
          width: "2.75rem",
          height: "2.75rem",
          fontSize: "0.875rem",
          background: `linear-gradient(135deg, ${profile.avatarColor}, ${profile.avatarColor}99)`,
        }}
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="uf-account-menu"
            className="uf-dropdown uf-dropdown-right glass-strong rounded-4 shadow-card-lg p-3"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={STATE_TRANSITION}
          >
            <p className="uf-dropdown-kicker px-1 mb-1 text-uppercase">Signed in</p>
            <p className="small fw-semibold text-white text-truncate px-1 mb-0" title={email}>
              {displayName}
            </p>
            <p className="px-1 mt-1 mb-0 text-truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }} title={email}>
              {email}
            </p>

            <div className="d-flex align-items-start gap-2 mt-3 mb-2 px-2 py-2 rounded-3"
              style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.22)" }}>
              <Cloud size={14} className="text-primary flex-shrink-0 mt-1" />
              <p className="mb-0" style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                Continue watching syncs across all your devices.
              </p>
            </div>

            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="uf-menu-item d-flex align-items-center gap-2 px-2 py-2 rounded-3 text-uppercase text-decoration-none"
              style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" }}
            >
              <Settings size={14} />
              Account &amp; settings
            </Link>

            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="uf-menu-item d-flex align-items-center gap-2 px-2 py-2 rounded-3 text-uppercase"
              style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
