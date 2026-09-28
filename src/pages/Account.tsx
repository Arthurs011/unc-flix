import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, SlidersHorizontal, Shield, Database,
  Check, Loader2, LogOut, Monitor,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useProfile } from "@/hooks/useProfile";
import { updateProfile, AVATAR_COLORS, DEFAULT_PROFILE } from "@/lib/profile";
import { clearLocalUserData } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

function Card({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl glass-strong ring-1 ring-white/10 shadow-card-lg overflow-hidden">
      <header className="flex items-start gap-3 px-5 py-4 border-b border-white/[0.07]">
        <span className="w-9 h-9 rounded-xl bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white">{title}</h2>
          {subtitle && <p className="text-[11px] text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Toggle({
  label, description, checked, onChange, disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/90">{label}</p>
        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 rounded-full shrink-0 transition-colors disabled:opacity-40",
          checked ? "bg-gradient-to-r from-sky-500 to-indigo-600" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  usePageTitle("Account");

  const [name, setName] = useState(profile.displayName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [busyOthers, setBusyOthers] = useState(false);

  useEffect(() => setName(profile.displayName), [profile.displayName]);

  const emailPrefix = (user?.email ?? "").split("@")[0];
  const displayName = profile.displayName || emailPrefix || "Member";
  const initial = (displayName[0] ?? "?").toUpperCase();

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ displayName: name.trim() });
    setSavingProfile(false);
    toast.success("Profile updated");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password needs at least 6 characters");
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) return toast.error(error.message);
    setPassword("");
    toast.success("Password changed");
  };

  const saveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Enter a valid email address");
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: email.trim() });
    setSavingEmail(false);
    if (error) return toast.error(error.message);
    setEmail("");
    toast.success("Check your inbox to confirm the new address");
  };

  const signOutOthers = async () => {
    setBusyOthers(true);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setBusyOthers(false);
    toast[error ? "error" : "success"](
      error ? error.message : "Signed out on all other devices",
    );
  };

  if (loading) {
    return (
      <PageShell className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background px-4">
        <h1 className="text-2xl font-extrabold text-white">Sign in to manage your account</h1>
        <Link
          to="/auth"
          className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-glow hover:scale-105 transition-transform"
        >
          Sign In
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell className="min-h-screen bg-background px-4 pt-28 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Identity header */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-glow-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${profile.avatarColor}, ${profile.avatarColor}99)` }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">{displayName}</h1>
            <p className="text-sm text-white/40 truncate">{user.email}</p>
            {user.created_at && (
              <p className="text-[11px] text-white/25 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Profile */}
          <Card icon={User} title="Profile" subtitle="How you appear across UNCFLIX">
            <form onSubmit={saveName} className="space-y-5">
              <div>
                <label htmlFor="displayName" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  Display name
                </label>
                <div className="flex gap-2">
                  <input
                    id="displayName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={emailPrefix}
                    maxLength={40}
                    className="flex-1 h-11 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-sm text-white placeholder:text-white/25 px-4 outline-none focus:ring-primary/60 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 rounded-xl bg-white/[0.08] ring-1 ring-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/[0.14] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>

              <div>
                <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2.5">
                  Avatar colour
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Avatar colour ${c}`}
                      aria-pressed={profile.avatarColor === c}
                      onClick={() => updateProfile({ avatarColor: c })}
                      className={cn(
                        "w-9 h-9 rounded-xl transition-transform hover:scale-110",
                        profile.avatarColor === c ? "ring-2 ring-white scale-105" : "ring-1 ring-white/20",
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </form>
          </Card>

          {/* Playback */}
          <Card icon={SlidersHorizontal} title="Playback" subtitle="How titles behave on autoplay">
            <div className="divide-y divide-white/[0.07]">
              <Toggle
                label="Autoplay next episode"
                description="Roll into the next episode automatically when one finishes."
                checked={profile.autoplayNext}
                onChange={(v) => updateProfile({ autoplayNext: v })}
              />
              <Toggle
                label="Autoplay trailers"
                description="Play title trailers automatically on detail pages."
                checked={profile.autoplayTrailers}
                onChange={(v) => updateProfile({ autoplayTrailers: v })}
              />
            </div>
          </Card>

          {/* Security */}
          <Card icon={Shield} title="Security" subtitle="Email address and password">
            <div className="space-y-5">
              <form onSubmit={saveEmail} className="space-y-2">
                <label htmlFor="newEmail" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Email address
                </label>
                <div className="flex gap-2">
                  <input
                    id="newEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={user.email ?? ""}
                    className="flex-1 h-11 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-sm text-white placeholder:text-white/25 px-4 outline-none focus:ring-primary/60 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={savingEmail}
                    className="px-5 rounded-xl bg-white/[0.08] ring-1 ring-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/[0.14] transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {savingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Update
                  </button>
                </div>
                <p className="text-[11px] text-white/25">Current: {user.email}</p>
              </form>

              <form onSubmit={savePassword} className="space-y-2">
                <label htmlFor="newPassword" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  New password
                </label>
                <div className="flex gap-2">
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="flex-1 h-11 rounded-xl bg-white/[0.06] ring-1 ring-white/10 text-sm text-white placeholder:text-white/25 px-4 outline-none focus:ring-primary/60 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 rounded-xl bg-white/[0.08] ring-1 ring-white/10 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/[0.14] transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Change
                  </button>
                </div>
              </form>

              <button
                onClick={signOutOthers}
                disabled={busyOthers}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/[0.12] hover:text-white transition-all disabled:opacity-50"
              >
                {busyOthers ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Monitor className="w-3.5 h-3.5" />}
                Sign out on all other devices
              </button>
            </div>
          </Card>

          {/* Data */}
          <Card icon={Database} title="Data" subtitle="What's stored on this device">
            <div className="space-y-4">
              <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-3.5">
                <p className="text-sm font-semibold text-white/90">Continue watching</p>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                  Synced to your account and available on every device you sign in on.
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-3.5">
                <p className="text-sm font-semibold text-white/90">Watchlist &amp; recently viewed</p>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                  Stored only in this browser. Clearing them affects this device alone.
                </p>
              </div>
              <button
                onClick={() => {
                  clearLocalUserData();
                  toast.success("Local data cleared from this device");
                }}
                className="w-full rounded-xl bg-white/[0.06] ring-1 ring-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/[0.12] hover:text-white transition-all"
              >
                Clear local data on this device
              </button>
            </div>
          </Card>

          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 ring-1 ring-red-500/25 px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>

          <p className="text-center text-[11px] text-white/20 pt-2">
            UNCFLIX account &middot; {user.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
