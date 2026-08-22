import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";

interface Props {
  to: string;
  label: string;
  title: string;
  badge?: string;
}

export default function WatchHeader({ to, label, title, badge }: Props) {
  const hidden = useAutoHideNav();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -90 : 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-3 md:top-4 left-3 right-3 md:left-0 md:right-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2 md:gap-3 h-14 md:h-16 pl-2 pr-4 md:pl-3 md:pr-5 rounded-full glass-strong ring-1 ring-white/10 shadow-card max-w-[92vw] md:max-w-none">
        <Link
          to={to}
          aria-label="Back to details"
          className="w-11 h-11 md:w-11 md:h-11 rounded-full bg-white/[0.06] hover:bg-primary hover:shadow-glow-sm transition-all flex items-center justify-center shrink-0 group active:bg-white/[0.12]"
        >
          <ArrowLeft className="w-5 h-5 text-white/80 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
        </Link>

        <span className="hidden sm:block w-px h-6 bg-white/10" />

        <div className="min-w-0">
          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-primary leading-none mb-1">
            {label}
            {badge && <span className="text-white/40 ml-2">{badge}</span>}
          </p>
          <h1 className="text-xs md:text-sm font-semibold truncate tracking-tight text-white/90 leading-none">
            {title}
          </h1>
        </div>
      </div>
    </motion.header>
  );
}
