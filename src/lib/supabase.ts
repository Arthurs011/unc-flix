import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * False on a deployment where the VITE_SUPABASE_* variables were never set.
 * The app still renders in that case - auth is simply inert and reports a
 * clear error instead of white-screening the whole bundle.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey);

const MISSING_CONFIG = { message: "Supabase is not configured on this deployment." };

/** Mirrors only the query chains this app uses, resolving to an error. */
function inertQuery(): Record<string, unknown> {
  const node: Record<string, unknown> = {};
  return new Proxy(node, {
    get(_target, prop) {
      if (prop === "then") {
        return (resolve: (value: unknown) => void) =>
          resolve({ data: null, error: MISSING_CONFIG });
      }
      return () => inertQuery();
    },
  });
}

const inertClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe() {} } },
      error: null,
    }),
    signInWithPassword: async () => ({ data: {}, error: MISSING_CONFIG }),
    signUp: async () => ({ data: {}, error: MISSING_CONFIG }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ data: {}, error: MISSING_CONFIG }),
  },
  from: () => inertQuery(),
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "uncflix.auth",
      },
    })
  : inertClient;
