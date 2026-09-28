import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Play, Trash2, Tv } from "lucide-react";
import { getContinueWatching, removeContinueWatching, type ContinueItem } from "@/lib/storage";
import { EASE } from "@/lib/motion";
import { imgUrl } from "@/lib/tmdb";

export default function ContinueRow() {
  const [items, setItems] = useState<ContinueItem[]>(() => getContinueWatching().slice(0, 12));

  useEffect(() => {
    setItems(getContinueWatching().slice(0, 12));
  }, []);

  const remove = (item: ContinueItem) => {
    removeContinueWatching(item.id, item.type, item.season, item.episode);
    setItems(getContinueWatching().slice(0, 12));
  };

  if (!items.length) return null;

  return (
    <section className="py-9 sm:py-11" aria-labelledby="continue-watching-title">
      <div className="section-shell">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.26em] text-primary">Pick up where you left off</p>
            <h2 id="continue-watching-title" className="text-xl font-bold tracking-[-0.035em] text-white sm:text-2xl">
              Continue watching
            </h2>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">Your queue</span>
        </div>

        <div className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-3 sm:gap-4 sm:px-6 lg:px-10 xl:px-12">
          {items.map((item, index) => (
            <ContinueCard key={`${item.type}:${item.id}:${item.season ?? 0}:${item.episode ?? 0}:${index}`} item={item} onRemove={remove} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContinueCard({ item, onRemove }: { item: ContinueItem; onRemove: (item: ContinueItem) => void }) {
  const image = item.backdrop_path ?? item.poster_path;
  const resumeAt = Math.max(0, Math.floor(item.currentTime || 0));
  const params = new URLSearchParams();
  if (item.type === "tv" && item.season && item.episode) {
    params.set("season", String(item.season));
    params.set("episode", String(item.episode));
  }
  if (resumeAt > 0) params.set("t", String(resumeAt));
  const search = params.toString();
  const href = `${item.type === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`}${search ? `?${search}` : ""}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group relative w-[248px] shrink-0 snap-start sm:w-[286px]"
    >
      <Link to={href} className="block overflow-hidden rounded-xl border border-white/[0.07] bg-surface-raised shadow-card transition-colors hover:border-white/[0.14]">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-raised">
          {image ? (
            <img
              src={imgUrl(image, "w500")}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] font-black tracking-[0.22em] text-white/15">UNCFLIX</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 backdrop-blur-md">
            {item.type === "tv" ? <Tv className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
            {item.type === "tv" ? `S${item.season ?? 1} · E${item.episode ?? 1}` : "Film"}
          </span>
          <span className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <span className="min-w-0 truncate text-sm font-semibold text-white">{item.title}</span>
            <span className="flex shrink-0 items-center gap-2">
              {resumeAt > 0 && <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">Resume {formatTime(resumeAt)}</span>}
              <span className="text-[10px] font-bold text-white/55">{Math.round(item.progress)}%</span>
            </span>
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }} />
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => onRemove(item)}
        aria-label={`Remove ${item.title} from continue watching`}
        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-white/45 opacity-0 backdrop-blur-md transition-all hover:border-red-300/30 hover:bg-red-950/70 hover:text-red-200 focus:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.article>
  );
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = Math.floor(seconds % 60);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${minutes}:${String(remaining).padStart(2, "0")}`;
}
