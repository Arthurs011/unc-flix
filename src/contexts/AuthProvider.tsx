import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setRemoteUser, syncContinueWatchingForUser } from "@/lib/storage";
import { loadProfile, clearProfile } from "@/lib/profile";
import { AuthContext, type AuthContextValue } from "@/contexts/auth";

function friendly(error: { message: string } | null): Error {
  if (!error) return new Error("Something went wrong. Please try again.");
  if (/invalid login credentials/i.test(error.message)) {
    return new Error("That email and password don't match an account.");
  }
  if (/already registered|already been registered/i.test(error.message)) {
    return new Error("An account already exists for that email. Try signing in.");
  }
  if (/password should be at least/i.test(error.message)) {
    return new Error("Password needs to be at least 6 characters.");
  }
  if (/over_email_send_rate_limit|email rate limit/i.test(error.message)) {
    return new Error("Too many attempts. Wait a moment and try again.");
  }
  return new Error(error.message);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      // Keep this callback free of data calls - Supabase holds an auth lock
      // here, and the continue-watching sync runs from an effect instead.
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setRemoteUser(null);
      return;
    }
    let cancelled = false;
    syncContinueWatchingForUser(userId)
      .catch((e) => console.error("continue-watching sync failed", e))
      .finally(() => {
        if (!cancelled) setRemoteUser(userId);
      });
    loadProfile(userId).catch((e) => console.error("profile load failed", e));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw friendly(error);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) throw friendly(error);
    return { needsEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    setRemoteUser(null);
    clearProfile();
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, loading, signIn, signUp, signOut }),
    [session, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
