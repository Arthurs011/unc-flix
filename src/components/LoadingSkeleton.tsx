export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[90vh] bg-secondary overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 space-y-4">
        <div className="h-4 w-32 bg-muted/20 rounded" />
        <div className="h-16 w-full max-w-2xl bg-muted/20 rounded" />
        <div className="h-6 w-full max-w-lg bg-muted/20 rounded" />
        <div className="flex gap-4 pt-4">
          <div className="h-14 w-40 bg-muted/20 rounded-full" />
          <div className="h-14 w-40 bg-muted/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <section className="mb-12">
      <div className="h-8 w-64 bg-secondary/50 rounded-lg mb-6 relative overflow-hidden px-4 sm:px-0">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="flex gap-4 sm:gap-6 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[140px] sm:w-[180px] aspect-[2/3] bg-secondary/50 rounded-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-[60vh] bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="h-12 w-full max-w-xl bg-secondary rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          </div>
          <div className="h-6 w-48 bg-secondary rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>
        <div className="h-32 w-full max-w-3xl bg-secondary rounded overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-secondary rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          </div>
          <div className="h-12 w-32 bg-secondary rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
