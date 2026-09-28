import { supabase } from "./supabase";

const PROFILE_KEY = "uncflix_profile";

export interface Profile {
  displayName: string;
  avatarColor: string;
  autoplayNext: boolean;
  autoplayTrailers: boolean;
}

export const AVATAR_COLORS = [
  "#0ea5e9", "#6366f1", "#a855f7", "#ec4899",
  "#ef4444", "#f59e0b", "#10b981", "#64748b",
];

export const DEFAULT_PROFILE: Profile = {
  displayName: "",
  avatarColor: AVATAR_COLORS[0],
  autoplayNext: true,
  autoplayTrailers: false,
};

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  avatar_color: string;
  autoplay_next: boolean;
  autoplay_trailers: boolean;
}

let cache: Profile | null = null;
let userId: string | null = null;
const listeners = new Set<() => void>();

function commit(next: Profile) {
  cache = next;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or full quota - keep the in-memory value.
  }
  listeners.forEach((l) => l());
}

export function getProfile(): Profile {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    cache = raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE };
  } catch {
    cache = { ...DEFAULT_PROFILE };
  }
  return cache;
}

export function subscribeProfile(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Load the account's saved profile, falling back to local values. */
export async function loadProfile(id: string): Promise<Profile> {
  userId = id;
  const { data, error } = await supabase
    .from("account_profiles")
    .select("display_name,avatar_color,autoplay_next,autoplay_trailers")
    .maybeSingle();

  if (error || !data) {
    // No saved row yet - create one from whatever this device has.
    const local = getProfile();
    await pushProfile(id, local);
    return local;
  }

  const row = data as Omit<ProfileRow, "user_id">;
  const next: Profile = {
    displayName: row.display_name ?? "",
    avatarColor: row.avatar_color || DEFAULT_PROFILE.avatarColor,
    autoplayNext: row.autoplay_next,
    autoplayTrailers: row.autoplay_trailers,
  };
  commit(next);
  return next;
}

async function pushProfile(id: string, p: Profile) {
  const { error } = await supabase.from("account_profiles").upsert({
    user_id: id,
    display_name: p.displayName || null,
    avatar_color: p.avatarColor,
    autoplay_next: p.autoplayNext,
    autoplay_trailers: p.autoplayTrailers,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const next = { ...getProfile(), ...patch };
  commit(next);
  if (!userId) return;
  try {
    await pushProfile(userId, next);
  } catch (e) {
    console.error("profile save failed", e);
  }
}

export function clearProfile() {
  cache = null;
  userId = null;
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
