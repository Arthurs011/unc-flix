import { Link, useLocation } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <PageShell className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-center">
      <div className="max-w-lg">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-primary"><Compass className="h-6 w-6" /></span>
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Error 404</p>
        <h1 className="text-balance text-4xl font-black leading-none tracking-[-0.06em] text-white sm:text-6xl">Lost in the archive.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/35">The path <span className="font-mono text-white/55">{pathname}</span> does not point to a title we know.</p>
        <Link to="/" className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#080a0f] transition-colors hover:bg-sky-100"><Home className="h-4 w-4" />Return home</Link>
      </div>
    </PageShell>
  );
}
