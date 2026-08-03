import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [, navigate] = useLocation();
  const { user, signOut, loading } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // If email confirmation is on, there's no session yet — user must verify.
        if (!data.session) {
          setConfirmSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) setError(error.message);
  }

  // After signup with email confirmation on — tell them to check their inbox.
  if (confirmSent) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-md space-y-6">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a confirmation link to{" "}
            <span className="text-white break-all">{email}</span>. Click it to
            activate your account, then come back and log in.
          </p>
          <Link
            href="/"
            className="inline-block text-sm uppercase tracking-widest underline text-muted-foreground hover:text-white"
          >
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  // Already signed in — show account state instead of the form.
  if (!loading && user) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Signed in as
          </p>
          <p className="text-xl font-bold break-all">{user.email}</p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/")}
              className="rounded-none h-12 bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
            >
              Go to site
            </Button>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="rounded-none h-12 uppercase tracking-widest text-xs font-bold border-white/20"
            >
              Log out
            </Button>
          </div>
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
          {mode === "login" ? "Log In" : "Create Account"}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          {mode === "login" ? "Welcome back." : "Join UN-VC as a founder."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-none h-12 bg-card border-border"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Password
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-none h-12 bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
          >
            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Log In"
                : "Create Account"}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full h-12 rounded-none border border-white/20 flex items-center justify-center gap-3 text-sm uppercase tracking-widest font-bold text-white hover:bg-white hover:text-black transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="text-white underline hover:no-underline"
          >
            {mode === "login" ? "Create one" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
