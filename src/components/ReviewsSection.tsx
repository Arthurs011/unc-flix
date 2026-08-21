import { useState } from "react";
import { Star, ChevronDown, ChevronUp, User } from "lucide-react";
import { Review, imgUrl } from "@/lib/tmdb";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  reviews: Review[] | undefined;
}

export default function ReviewsSection({ reviews }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const safeReviews = reviews ?? [];

  if (!safeReviews.length) return null;

  return (
    <section className="mt-12 mb-16">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Reviews ({safeReviews.length})
      </h2>
      <div className="space-y-4">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/50 backdrop-blur-sm rounded-xl p-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={review.author}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {review.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {review.author_details.rating && (
                  <div className="flex items-center gap-1 bg-background/60 rounded-md px-2 py-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-foreground">
                      {review.author_details.rating}/10
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="text-sm text-muted-foreground leading-relaxed">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={isExpanded ? "full" : "short"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-pre-line"
                  >
                    {isExpanded || !isLong
                      ? review.content
                      : review.content.slice(0, 300) + "…"}
                  </motion.p>
                </AnimatePresence>
              </div>

              {isLong && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  className="flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
