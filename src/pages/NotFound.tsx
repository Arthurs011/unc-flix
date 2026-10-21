import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageShell from "@/components/PageShell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageShell className="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div className="text-center">
        <p className="kicker mb-3">Error 404</p>
        <h1
          className="fw-black text-white mb-3"
          style={{ fontSize: "clamp(3rem, 10vw, 6rem)", lineHeight: 1, letterSpacing: "-0.05em" }}
        >
          Lost in the void
        </h1>
        <p className="mb-0" style={{ marginBottom: "2.5rem", color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="uf-btn uf-btn-md btn-gradient rounded-pill text-decoration-none"
        >
          Return Home
        </a>
      </div>
    </PageShell>
  );
};

export default NotFound;
