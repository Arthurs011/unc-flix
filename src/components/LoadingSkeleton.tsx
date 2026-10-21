/** Shared shimmer block used by every skeleton screen. */
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`uf-shimmer position-relative overflow-hidden ${className ?? ""}`} style={style} />
  );
}

export function HeroSkeleton() {
  return (
    <div className="position-relative w-100" style={{ height: "85vh" }}>
      <Shimmer className="position-absolute top-0 bottom-0 start-0 end-0" />
      <div className="position-absolute bottom-0 start-0 end-0 p-3 p-sm-5 p-lg-5 d-flex flex-column gap-4">
        <Shimmer style={{ height: "0.75rem", width: "7rem", borderRadius: "9999px" }} />
        <Shimmer style={{ height: "4rem", width: "100%", maxWidth: "42rem", borderRadius: "1rem" }} />
        <Shimmer style={{ height: "1rem", width: "100%", maxWidth: "32rem", borderRadius: "9999px" }} />
        <div className="d-flex gap-3 pt-2">
          <Shimmer style={{ height: "3.25rem", width: "10rem", borderRadius: "1rem" }} />
          <Shimmer style={{ height: "3.25rem", width: "8rem", borderRadius: "1rem" }} />
        </div>
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <section className="mb-5" style={{ marginBottom: "3.5rem" }}>
      <div className="mb-4 px-3 px-sm-0 d-flex flex-column gap-2">
        <Shimmer style={{ height: "0.625rem", width: "6rem", borderRadius: "9999px" }} />
        <Shimmer style={{ height: "1.5rem", width: "13rem", borderRadius: "0.5rem" }} />
      </div>
      <div className="d-flex gap-4 overflow-hidden px-3 px-sm-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <Shimmer
            key={i}
            className="flex-shrink-0"
            style={{ width: "160px", aspectRatio: "2 / 3", borderRadius: "1rem" }}
          />
        ))}
      </div>
    </section>
  );
}

export function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className="row g-3 g-lg-4 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">
      {Array.from({ length: count }).map((_, i) => (
        <div className="col" key={i}>
          <Shimmer style={{ aspectRatio: "2 / 3", borderRadius: "1rem" }} />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="min-vh-100">
      <Shimmer style={{ height: "55vh", borderRadius: 0 }} />
      <div className="page-container position-relative z-1" style={{ marginTop: "-9rem" }}>
        <div className="d-flex flex-column flex-sm-row gap-4 gap-lg-5">
          <Shimmer
            className="flex-shrink-0 mx-auto mx-sm-0"
            style={{ width: "15rem", aspectRatio: "2 / 3", borderRadius: "1.5rem" }}
          />
          <div className="flex-grow-1 pt-3 d-flex flex-column gap-4">
            <Shimmer style={{ height: "0.75rem", width: "6rem", borderRadius: "9999px" }} />
            <Shimmer style={{ height: "3.5rem", width: "100%", maxWidth: "36rem", borderRadius: "1rem" }} />
            <div className="d-flex gap-3">
              <Shimmer style={{ height: "1.75rem", width: "5rem", borderRadius: "9999px" }} />
              <Shimmer style={{ height: "1.75rem", width: "5rem", borderRadius: "9999px" }} />
              <Shimmer style={{ height: "1.75rem", width: "5rem", borderRadius: "9999px" }} />
            </div>
            <Shimmer style={{ height: "5rem", width: "100%", maxWidth: "42rem", borderRadius: "1rem" }} />
            <div className="d-flex gap-3 pt-2">
              <Shimmer style={{ height: "3.25rem", width: "11rem", borderRadius: "1rem" }} />
              <Shimmer style={{ height: "3.25rem", width: "9rem", borderRadius: "1rem" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
