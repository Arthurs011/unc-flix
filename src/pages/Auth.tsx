import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { pushLocalToCloud, syncFromCloud } from "@/lib/storage";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Name is required").max(80).optional();

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from || "/";

  useEffect(() => {
    if (!authLoading && user) navigate(from, { replace: true });
  }, [user, authLoading, navigate, from]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsedEmail = emailSchema.safeParse(email);
      if (!parsedEmail.success) {
        toast.error(parsedEmail.error.errors[0].message);
        return;
      }
      const parsedPwd = passwordSchema.safeParse(password);
      if (!parsedPwd.success) {
        toast.error(parsedPwd.error.errors[0].message);
        return;
      }

      if (mode === "signup") {
        const parsedName = nameSchema.safeParse(name || undefined);
        if (!parsedName.success) {
          toast.error(parsedName.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: parsedPwd.data,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: parsedName.data || parsedEmail.data.split("@")[0] },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("This email is already registered. Try signing in.");
          } else toast.error(error.message);
          return;
        }
        toast.success("Account created! Syncing your data…");
        await pushLocalToCloud();
        await syncFromCloud();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail.data,
          password: parsedPwd.data,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back!");
        await pushLocalToCloud();
        await syncFromCloud();
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth",
        },
      });
      if (error) toast.error(error.message || "Google sign-in failed");
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16"
    >
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 border border-border/40">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground">
            Uncle<span className="text-primary">flix</span>
          </Link>
          <h1 className="text-xl font-semibold text-foreground mt-4">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Sign in to sync your watchlist across devices"
              : "Save your watchlist and progress across devices"}
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium rounded-xl py-3 hover:bg-white/90 transition disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8L6 32.7C9.3 39.2 16.1 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.2 35.8 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary/60 text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-secondary/60 text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-secondary/60 text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-medium rounded-xl py-3 hover:bg-primary/90 transition disabled:opacity-50"
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? "Don't have an account? " : "Already have one? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
