import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";
import { EASE } from "@/lib/motion";

interface Props {
  to: string;
  label: string;
  title: string;
  badge?: string;
}

export default function WatchHeader({ to, label, title, badge }: Props) {
  const hidden = useAutoHideNav(120);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      {/* Cinematic top gradient vignette for crystal clear legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#06070a]/95 via-[#06070a]/60 to-transparent" />

      <div className="relative mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to={to}
            aria-label="Back to title details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#0c0d14]/70 text-white/70 shadow-lg backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.12] hover:text-white hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {label}
              </span>
              {badge && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                    {badge}
                  </span>
                </>
              )}
            </div>
            <h1 className="max-w-[18rem] truncate text-xs font-semibold text-white/85 sm:max-w-md md:max-w-xl md:text-sm">
              {title}
            </h1>
          </div>
        </div>

        <Link
          to="/"
          className="pointer-events-auto hidden items-center gap-2 text-xs font-black tracking-widest text-white/40 transition-colors hover:text-white sm:flex"
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          UNCFLIX
        </Link>
      </div>
    </motion.header>
  );
}

