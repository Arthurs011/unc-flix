function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-white/[0.05] ${className ?? ""}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full animate-shimmer" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[80vh] sm:h-[85vh]">
      <Shimmer className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20 space-y-5">
        <Shimmer className="h-3 w-28 rounded-full" />
        <Shimmer className="h-12 sm:h-16 w-full max-w-2xl rounded-2xl" />
        <Shimmer className="h-4 w-full max-w-lg rounded-full" />
        <div className="flex gap-3 pt-4">
          <Shimmer className="h-13 w-40 rounded-full" />
          <Shimmer className="h-13 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <section className="mb-14">
      <div className="mb-5 px-4 sm:px-0 space-y-2">
        <Shimmer className="h-2.5 w-24 rounded-full" />
        <Shimmer className="h-6 w-52 rounded-lg" />
      </div>
      <div className="flex gap-4 sm:gap-5 overflow-hidden px-4 sm:px-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <Shimmer
            key={i}
            className="flex-shrink-0 w-[136px] sm:w-[172px] aspect-[2/3] rounded-2xl"
          />
        ))}
      </div>
    </section>
  );
}

export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="aspect-[2/3] rounded-2xl" />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Shimmer className="h-[55vh]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8">
          <Shimmer className="w-44 sm:w-60 aspect-[2/3] rounded-3xl mx-auto sm:mx-0" />
          <div className="flex-1 pt-4 space-y-5">
            <Shimmer className="h-3 w-24 rounded-full" />
            <Shimmer className="h-12 w-full max-w-xl rounded-2xl" />
            <div className="flex gap-3">
              <Shimmer className="h-7 w-20 rounded-full" />
              <Shimmer className="h-7 w-20 rounded-full" />
              <Shimmer className="h-7 w-20 rounded-full" />
            </div>
            <Shimmer className="h-20 w-full max-w-2xl rounded-2xl" />
            <div className="flex gap-3 pt-2">
              <Shimmer className="h-13 w-44 rounded-full" />
              <Shimmer className="h-13 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
