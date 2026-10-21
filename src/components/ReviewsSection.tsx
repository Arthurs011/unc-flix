import { useState, useRef, useEffect } from "react";
import { Star, ChevronDown, User } from "lucide-react";
import { Review, imgUrl } from "@/lib/tmdb";
import { revealOnView, prefersReducedMotion } from "@/lib/anim";

interface Props {
  reviews: Review[] | undefined;
}

export default function ReviewsSection({ reviews }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const safeReviews = reviews ?? [];
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-reveal the section once; individual cards get a CSS stagger that
  // completes on its own.
  useEffect(() => revealOnView(sectionRef.current, { y: 24 }), [safeReviews.length]);

  if (!safeReviews.length) return null;

  const staggerDelay = (i: number) =>
    prefersReducedMotion() ? "0s" : `${Math.min(i * 0.05, 0.5)}s`;

  return (
    <section ref={sectionRef} className="mt-5 mt-md-5 pt-4" style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      <p className="kicker mb-2">Community</p>
      <h2 className="uf-section-title mb-4">
        Reviews <span className="fw-bold" style={{ color: "rgba(255,255,255,0.3)" }}>({safeReviews.length})</span>
      </h2>

      <div className="d-flex flex-column gap-3">
        {safeReviews.slice(0, 10).map((review, i) => {
          const isExpanded = expandedId === review.id;
          const isLong = review.content.length > 300;
          const avatarUrl = review.author_details.avatar_path
            ? review.author_details.avatar_path.startsWith("/http")
              ? review.author_details.avatar_path.slice(1)
              : imgUrl(review.author_details.avatar_path, "w185")
            : null;

          return (
            <div
              key={review.id}
              className="uf-review-card rounded-4 p-4"
              style={{ animationDelay: staggerDelay(i) }}
            >
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "2.5rem", height: "2.5rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={review.author}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <User size={20} style={{ color: "rgba(255,255,255,0.3)" }} />
                  )}
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="small fw-semibold text-white text-truncate mb-0">{review.author}</p>
                  <p className="mb-0 mt-1" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {review.author_details.rating && (
                  <div className="d-flex align-items-center gap-1 rounded-pill px-2 py-1 flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Star size={13} className="fill-warning text-warning" />
                    <span className="small fw-bold text-white">{review.author_details.rating}/10</span>
                  </div>
                )}
              </div>

              <p className="small mb-0" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {isExpanded || !isLong ? review.content : review.content.slice(0, 300) + "…"}
              </p>

              {isLong && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : review.id)}
                  className="d-inline-flex align-items-center gap-1 mt-1 border-0 px-2 py-1 rounded-2 small fw-semibold text-primary"
                  style={{ background: "transparent", minHeight: "2rem" }}
                >
                  {isExpanded ? "Show less" : "Read more"}
                  <ChevronDown
                    size={14}
                    style={{ transition: "transform 300ms ease", transform: isExpanded ? "rotate(180deg)" : "none" }}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
