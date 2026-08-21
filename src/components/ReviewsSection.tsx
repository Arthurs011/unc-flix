import { useState } from "react";
import { Star, ChevronDown, User } from "lucide-react";
import { Review, imgUrl } from "@/lib/tmdb";
import { motion, AnimatePresence } from "motion/react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

interface Props {
  reviews: Review[] | undefined;
}

export default function ReviewsSection({ reviews }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const safeReviews = reviews ?? [];

  if (!safeReviews.length) return null;

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-16 mb-16"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-1.5">
        Community
      </p>
      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-6">
        Reviews <span className="text-white/30 font-bold">({safeReviews.length})</span>
      </h2>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {safeReviews.slice(0, 10).map((review) => {
          const isExpanded = expandedId === review.id;
          const isLong = review.content.length > 300;
          const avatarUrl = review.author_details.avatar_path
            ? review.author_details.avatar_path.startsWith("/http")
              ? review.author_details.avatar_path.slice(1)
              : imgUrl(review.author_details.avatar_path, "w185")
            : null;

          return (
            <motion.div
              key={review.id}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0 },
              }}
              className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] p-5 hover:ring-white/[0.12] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={review.author}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-white/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{review.author}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {review.author_details.rating && (
                  <div className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 ring-1 ring-white/10">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-white">
                      {review.author_details.rating}/10
                    </span>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={isExpanded ? "full" : "short"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm text-white/60 leading-relaxed whitespace-pre-line"
                >
                  {isExpanded || !isLong ? review.content : review.content.slice(0, 300) + "…"}
                </motion.p>
              </AnimatePresence>

              {isLong && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary hover:text-sky-300 transition-colors"
                >
                  {isExpanded ? "Show less" : "Read more"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
