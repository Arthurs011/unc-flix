export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] bg-secondary animate-pulse" />
  );
}

export function RowSkeleton() {
  return (
    <section className="mb-10">
      <div className="h-7 w-48 bg-secondary rounded-lg mb-4 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[160px] sm:w-[180px] aspect-[2/3] bg-secondary rounded-xl animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="h-[50vh] bg-secondary animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 space-y-4">
        <div className="h-10 w-96 bg-secondary rounded animate-pulse" />
        <div className="h-4 w-64 bg-secondary rounded animate-pulse" />
        <div className="h-24 w-full max-w-2xl bg-secondary rounded animate-pulse" />
      </div>
    </div>
  );
}
