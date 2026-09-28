function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/[0.035] ${className ?? ""}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[82svh] min-h-[42rem] max-h-[58rem] w-full overflow-hidden" aria-busy="true" aria-label="Loading featured film">
      <Shimmer className="absolute inset-0 rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/45 to-transparent" />
      <div className="section-shell absolute inset-x-0 bottom-0 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-2xl space-y-5">
          <Shimmer className="h-3 w-32" />
          <Shimmer className="h-14 w-4/5 sm:h-20" />
          <Shimmer className="h-4 w-full max-w-lg" />
          <Shimmer className="h-4 w-2/3 max-w-md" />
          <div className="flex gap-2 pt-3">
            <Shimmer className="h-12 w-32" />
            <Shimmer className="h-12 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <section className="py-10" aria-busy="true" aria-label="Loading content row">
      <div className="section-shell mb-6 space-y-2">
        <Shimmer className="h-2.5 w-20" />
        <Shimmer className="h-7 w-52" />
      </div>
      <div className="no-scrollbar flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-10 xl:px-12">
        {Array.from({ length: 8 }).map((_, index) => (
          <Shimmer key={index} className="aspect-[2/3] w-[132px] shrink-0 sm:w-[158px] lg:w-[172px]" />
        ))}
      </div>
    </section>
  );
}

export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-busy="true" aria-label="Loading titles">
      {Array.from({ length: count }).map((_, index) => (
        <Shimmer key={index} className="aspect-[2/3]" />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading title details">
      <Shimmer className="h-[62vh] rounded-none" />
      <div className="section-shell relative z-10 -mt-40">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:gap-9">
          <Shimmer className="mx-auto aspect-[2/3] w-44 rounded-xl sm:mx-0 sm:w-56 lg:w-64" />
          <div className="flex-1 space-y-5 pb-1">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-12 w-4/5 max-w-xl" />
            <div className="flex gap-2">
              <Shimmer className="h-7 w-20" />
              <Shimmer className="h-7 w-20" />
              <Shimmer className="h-7 w-20" />
            </div>
            <Shimmer className="h-20 w-full max-w-2xl" />
            <div className="flex gap-2 pt-2">
              <Shimmer className="h-12 w-36" />
              <Shimmer className="h-12 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
