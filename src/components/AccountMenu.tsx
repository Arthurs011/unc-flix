import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, UserPlus, Cloud, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
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
    return <div className={cn("w-11 h-11 rounded-full bg-white/[0.06] ring-1 ring-white/10 animate-pulse", className)} />;
  }

  if (!user) {
    return (
      <Link
        to="/auth"
        state={{ from: location.pathname }}
        aria-label="Sign in"
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/[0.08] transition-all",
          className,
        )}
      >
        <UserPlus className="w-4 h-4" />
        Sign In
      </Link>
    );
  }

  const email = user.email ?? "";
  const displayName = profile.displayName || email.split("@")[0] || "Member";
  const initial = (displayName[0] ?? "?").toUpperCase();

  return (
    <div className={cn("relative", className)} ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-expanded={open}
        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-black shadow-glow-sm hover:scale-105 active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${profile.avatarColor}, ${profile.avatarColor}99)` }}
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-3 w-64 rounded-2xl glass-strong ring-1 ring-white/10 shadow-card-lg p-3 origin-top-right z-50"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 mb-1.5 px-1">
              Signed in
            </p>
            <p className="text-sm font-semibold text-white truncate px-1" title={email}>
              {displayName}
            </p>
            <p className="text-[11px] text-white/35 truncate px-1 mt-0.5" title={email}>
              {email}
            </p>

            <div className="mt-3 mb-2 flex items-start gap-2 px-2.5 py-2.5 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Cloud className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] text-white/60 leading-relaxed">
                Continue watching syncs across all your devices.
              </p>
            </div>

            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Account &amp; settings
            </Link>

            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
