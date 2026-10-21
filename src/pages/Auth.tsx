import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Clapperboard, Loader2, Mail, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { revealNow } from "@/lib/anim";
import { PRESS_SCALE, PRESS_TRANSITION } from "@/lib/motion";
import "@/styles/watch.css";

type Mode = "signin" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle(mode === "signin" ? "Sign In" : "Create Account");

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  useEffect(() => {
    revealNow(shellRef.current, { y: 18, duration: 500 });
  }, []);

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

  return (
    <PageShell className="min-vh-100 d-flex align-items-center justify-content-center px-3" style={{ paddingTop: "7rem", paddingBottom: "7rem" }}>
      <div ref={shellRef} className="uf-auth-wrap">
        <div className="text-center mb-4">
          <span className="uf-auth-tile">
            <Clapperboard size={24} />
          </span>
          <h1 className="uf-auth-title">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="uf-auth-sub">
            {mode === "signin"
              ? "Sign in to resume across all your devices."
              : "Sync your continue-watching between devices."}
          </p>
        </div>

        <div className="uf-auth-card glass-strong">
          {sent ? (
            <div className="uf-auth-sent">
              <CheckCircle2 className="uf-auth-sent-icon" />
              <p className="fw-bold text-white mb-1" style={{ fontSize: "0.875rem" }}>Check your inbox</p>
              <p className="mb-0" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                We sent a confirmation link to <span style={{ color: "rgba(255,255,255,0.7)" }}>{email}</span>. Click it
                to finish setting up your account.
              </p>
              <button
                onClick={() => { setSent(false); setMode("signin"); }}
                className="uf-auth-back"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div className="uf-auth-tabs">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null); }}
                    className={`uf-auth-tab${mode === m ? " active" : ""}`}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="d-flex flex-column gap-3" noValidate>
                <div className="uf-auth-field">
                  <Mail className="uf-auth-icon" />
                  <label htmlFor="email" className="visually-hidden">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="form-control uf-auth-input"
                  />
                </div>

                <div className="uf-auth-field">
                  <KeyRound className="uf-auth-icon" />
                  <label htmlFor="password" className="visually-hidden">Password</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-control uf-auth-input"
                  />
                </div>

                {error && (
                  <p role="alert" className="uf-auth-error">
                    {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={busy}
                  className="uf-btn uf-btn-md btn-gradient uf-auth-submit"
                  whileTap={busy ? undefined : { scale: PRESS_SCALE }}
                  transition={PRESS_TRANSITION}
                >
                  {busy ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="uf-auth-foot">
                {mode === "signin" ? (
                  <>
                    No account yet?{" "}
                    <button
                      onClick={() => { setMode("signup"); setError(null); }}
                      className="uf-auth-link"
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => { setMode("signin"); setError(null); }}
                      className="uf-auth-link"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>

        <p className="uf-auth-footnote">
          <Link to="/" className="uf-auth-link">Continue without an account</Link>
        </p>
      </div>
    </PageShell>
  );
}
