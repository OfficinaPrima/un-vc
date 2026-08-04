import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [, navigate] = useLocation();

  // A recovery link signs the user in; only then can the password be changed.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setReady(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update your password.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-md space-y-6">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter">
            Password updated
          </h1>
          <p className="text-muted-foreground text-sm">
            You&apos;re signed in with your new password.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="rounded-none h-12 bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
          >
            Go to site
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-10 uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="font-display text-4xl font-bold uppercase tracking-tighter mb-2">
          Set a new password
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          {ready
            ? "Choose a new password for your account."
            : "Open this page from the reset link in your email."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              New password
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="rounded-none h-12 bg-card border-border"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Confirm password
            </label>
            <Input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat it"
              className="rounded-none h-12 bg-card border-border"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={busy || !ready}
            className="w-full rounded-none h-12 bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
          >
            {busy ? "Saving..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
