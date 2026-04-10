import { Link } from "react-router-dom";
import { Play, X } from "lucide-react";
import { getContinueWatching, removeContinueWatching, ContinueItem } from "@/lib/storage";
import { imgUrl } from "@/lib/tmdb";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ContinueRow() {
  const [items, setItems] = useState<ContinueItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(getContinueWatching());
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  const remove = (id: number) => {
    removeContinueWatching(id);
    setItems(getContinueWatching());
  };

  if (!items.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 px-4 sm:px-0">
        Continue Watching
      </h2>
      <div className="relative group/row">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-background/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-background/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-0 pb-2"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[260px] sm:w-[300px] group relative"
            >
              <Link
                to={
                  item.type === "tv"
                    ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`
                    : `/watch/movie/${item.id}`
                }
                className="block"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
                  <img
                    src={imgUrl(item.backdrop_path || item.poster_path, "w780")}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-2">{item.title}</p>
                      {/* Progress bar */}
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                    <Play className="w-8 h-8 text-foreground ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); remove(item.id); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/70 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
