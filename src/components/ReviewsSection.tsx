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
      className="my-16 sm:my-20"
      aria-labelledby="reviews-heading"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.28em] text-primary">From the community</p>
          <h2 id="reviews-heading" className="text-xl font-bold tracking-[-0.035em] text-white sm:text-2xl">
            Reviews <span className="font-medium text-white/25">{safeReviews.length}</span>
          </h2>
        </div>
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25 sm:block">Reader notes</span>
      </div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 lg:grid-cols-2">
        {safeReviews.slice(0, 10).map((review) => {
          const isExpanded = expandedId === review.id;
          const isLong = review.content.length > 300;
          const avatarUrl = review.author_details.avatar_path
            ? review.author_details.avatar_path.startsWith("/http")
              ? review.author_details.avatar_path.slice(1)
              : imgUrl(review.author_details.avatar_path, "w185")
            : null;

          return (
            <motion.article
              key={review.id}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.13] sm:p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(event) => { event.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <User className="h-4 w-4 text-white/25" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white/82">{review.author}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                    {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                {review.author_details.rating ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200/15 bg-amber-200/[0.06] px-2 py-1 text-[10px] font-bold text-amber-100/80">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                    {review.author_details.rating}
                  </span>
                ) : null}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={isExpanded ? "full" : "short"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm leading-7 text-white/50"
                >
                  {isExpanded || !isLong ? review.content : `${review.content.slice(0, 300)}…`}
                </motion.p>
              </AnimatePresence>

              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-sky-200"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? "Show less" : "Read full review"}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
