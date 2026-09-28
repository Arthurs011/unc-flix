import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Clapperboard, Loader2, Mail, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle(mode === "signin" ? "Sign In" : "Create Account");

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (!loading && user && !sent) {
    navigate(from, { replace: true });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 6) return setError("Password needs to be at least 6 characters.");

    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        const { needsEmailConfirmation } = await signUp(email, password);
        if (needsEmailConfirmation) setSent(true);
        else navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full h-12 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-sm text-white placeholder:text-white/30 pl-11 pr-4 outline-none focus:ring-primary/60 transition-all";

  return (
    <PageShell className="min-h-screen flex items-center justify-center bg-background px-4 py-28">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 items-center justify-center text-white shadow-glow-sm mb-4">
            <Clapperboard className="w-6 h-6" />
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-white/40 mt-2">
            {mode === "signin"
              ? "Sign in to resume across all your devices."
              : "Sync your continue-watching between devices."}
          </p>
        </div>

        <div className="rounded-2xl glass-strong ring-1 ring-white/10 shadow-card-lg p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <p className="text-sm font-bold text-white mb-1.5">Check your inbox</p>
              <p className="text-xs text-white/40 leading-relaxed">
                We sent a confirmation link to <span className="text-white/70">{email}</span>. Click it
                to finish setting up your account.
              </p>
              <button
                onClick={() => { setSent(false); setMode("signin"); }}
                className="mt-6 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] ring-1 ring-white/10 mb-5">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null); }}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors",
                      mode === m ? "bg-white/[0.10] text-white" : "text-white/40 hover:text-white/70",
                    )}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={field}
                  />
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={field}
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="text-xs text-red-400 bg-red-500/10 ring-1 ring-red-500/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-[11px] text-white/30 leading-relaxed text-center">
                {mode === "signin" ? (
                  <>
                    No account yet?{" "}
                    <button
                      onClick={() => { setMode("signup"); setError(null); }}
                      className="text-primary font-bold hover:underline"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => { setMode("signin"); setError(null); }}
                      className="text-primary font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-white/25">
          <Link to="/" className="hover:text-white/50 transition-colors">Continue without an account</Link>
        </p>
      </div>
    </PageShell>
  );
}
