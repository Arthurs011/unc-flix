import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageShell from "@/components/PageShell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageShell className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3">Error 404</p>
        <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-none mb-4">Lost in the void</h1>
        <p className="text-white/40 mb-10 text-sm">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-flex px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow hover:scale-105 active:scale-95 transition-transform"
        >
          Return Home
        </a>
      </div>
    </PageShell>
  );
};

export default NotFound;
