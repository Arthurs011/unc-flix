import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, SlidersHorizontal, Shield, Database,
  Check, Loader2, LogOut, Monitor,
} from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useProfile } from "@/hooks/useProfile";
import { updateProfile, AVATAR_COLORS } from "@/lib/profile";
import { clearLocalUserData } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { revealNow } from "@/lib/anim";
import "@/styles/watch.css";

function Card({
  icon: Icon, title, subtitle, children, delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="uf-card glass-strong content-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="uf-card-header">
        <span className="uf-card-icon">
          <Icon size={16} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h2 className="uf-card-title">{title}</h2>
          {subtitle && <p className="uf-card-sub">{subtitle}</p>}
        </div>
      </header>
      <div className="uf-card-body">{children}</div>
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
    <div className="uf-toggle-row">
      <div className="uf-toggle-copy">
        <p className="uf-toggle-label">{label}</p>
        <p className="uf-toggle-desc">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="uf-toggle"
      >
        <span className="uf-toggle-knob" />
      </button>
    </div>
  );
}

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  usePageTitle("Account");
  const pageRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(profile.displayName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [busyOthers, setBusyOthers] = useState(false);

  useEffect(() => setName(profile.displayName), [profile.displayName]);
  useEffect(() => {
    revealNow(pageRef.current, { y: 18, duration: 500 });
  }, []);

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
      <PageShell className="min-vh-100 d-flex align-items-center justify-content-center">
        <Loader2 size={24} className="spin" style={{ color: "rgba(255,255,255,0.4)" }} />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-4 px-3">
        <h1 className="fw-extrabold text-white" style={{ fontSize: "1.5rem" }}>Sign in to manage your account</h1>
        <Link
          to="/auth"
          className="uf-btn uf-btn-md btn-gradient rounded-pill px-4"
        >
          Sign In
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell className="min-vh-100 px-3" style={{ paddingTop: "7rem", paddingBottom: "6rem" }}>
      <div ref={pageRef} className="uf-account-wrap">
        <Link to="/" className="uf-back-link">
          <ArrowLeft size={14} />
          Back
        </Link>

        {/* Identity header */}
        <div className="uf-identity">
          <div
            className="uf-avatar"
            style={{ background: `linear-gradient(135deg, ${profile.avatarColor}, ${profile.avatarColor}99)` }}
          >
            {initial}
          </div>
          <div className="uf-identity-body">
            <h1 className="uf-identity-name">{displayName}</h1>
            <p className="uf-identity-email">{user.email}</p>
            {user.created_at && (
              <p className="uf-identity-since">
                Member since {new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        <div className="uf-account-stack">
          {/* Profile */}
          <Card icon={User} title="Profile" subtitle="How you appear across UNCFLIX" delay={40}>
            <form onSubmit={saveName} className="d-flex flex-column gap-4">
              <div>
                <label htmlFor="displayName" className="uf-field-label">
                  Display name
                </label>
                <div className="d-flex gap-2">
                  <input
                    id="displayName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={emailPrefix}
                    maxLength={40}
                    className="form-control uf-account-input flex-grow-1"
                  />
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="uf-account-btn"
                  >
                    {savingProfile ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                    Save
                  </button>
                </div>
              </div>

              <div>
                <p className="uf-field-label" style={{ marginBottom: "0.625rem" }}>
                  Avatar colour
                </p>
                <div className="uf-avatar-row">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Avatar colour ${c}`}
                      aria-pressed={profile.avatarColor === c}
                      onClick={() => updateProfile({ avatarColor: c })}
                      className={`uf-avatar-swatch${profile.avatarColor === c ? " active" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </form>
          </Card>

          {/* Playback */}
          <Card icon={SlidersHorizontal} title="Playback" subtitle="How titles behave on autoplay" delay={90}>
            <div className="uf-divide">
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
          <Card icon={Shield} title="Security" subtitle="Email address and password" delay={140}>
            <div className="d-flex flex-column gap-4">
              <form onSubmit={saveEmail} className="d-flex flex-column gap-2">
                <label htmlFor="newEmail" className="uf-field-label">
                  Email address
                </label>
                <div className="d-flex gap-2">
                  <input
                    id="newEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={user.email ?? ""}
                    className="form-control uf-account-input flex-grow-1"
                  />
                  <button
                    type="submit"
                    disabled={savingEmail}
                    className="uf-account-btn"
                  >
                    {savingEmail ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                    Update
                  </button>
                </div>
                <p className="uf-hint">Current: {user.email}</p>
              </form>

              <form onSubmit={savePassword} className="d-flex flex-column gap-2">
                <label htmlFor="newPassword" className="uf-field-label">
                  New password
                </label>
                <div className="d-flex gap-2">
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="form-control uf-account-input flex-grow-1"
                  />
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="uf-account-btn"
                  >
                    {savingPassword ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                    Change
                  </button>
                </div>
              </form>

              <button
                onClick={signOutOthers}
                disabled={busyOthers}
                className="uf-wide-btn"
              >
                {busyOthers ? <Loader2 size={14} className="spin" /> : <Monitor size={14} />}
                Sign out on all other devices
              </button>
            </div>
          </Card>

          {/* Data */}
          <Card icon={Database} title="Data" subtitle="What's stored on this device" delay={190}>
            <div className="d-flex flex-column gap-3">
              <div className="uf-data-tile">
                <p className="uf-data-title">Continue watching</p>
                <p className="uf-data-desc">
                  Synced to your account and available on every device you sign in on.
                </p>
              </div>
              <div className="uf-data-tile">
                <p className="uf-data-title">Watchlist &amp; recently viewed</p>
                <p className="uf-data-desc">
                  Stored only in this browser. Clearing them affects this device alone.
                </p>
              </div>
              <button
                onClick={() => {
                  clearLocalUserData();
                  toast.success("Local data cleared from this device");
                }}
                className="uf-wide-btn"
              >
                Clear local data on this device
              </button>
            </div>
          </Card>

          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="uf-danger-btn"
          >
            <LogOut size={14} />
            Sign out
          </button>

          <p className="uf-account-foot">
            UNCFLIX account &middot; {user.id.slice(0, 8)}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
