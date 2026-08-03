import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MySubmission = {
  id: number;
  deckUrl: string;
  description: string;
  status: string;
  createdAt: string;
};

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subs, setSubs] = useState<MySubmission[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  // Not logged in → send to the login page.
  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  // Seed the name field from the account's saved display name.
  useEffect(() => {
    if (user) {
      setDisplayName((user.user_metadata?.display_name as string) ?? "");
    }
  }, [user]);

  // Load this account's submissions.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setSubsLoading(true);
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (active) setSubsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/submissions/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && active) setSubs((await res.json()) as MySubmission[]);
      } catch {
        /* leave list empty on error */
      } finally {
        if (active) setSubsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  async function saveName() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-10 uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2">
          Your Profile
        </h1>
        <p className="text-muted-foreground mb-12 text-sm">
          Manage your founder account.
        </p>

        {/* Account details */}
        <section className="border border-border p-8 mb-8 space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Email
            </label>
            <p className="text-lg break-all">{user.email}</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
              Display name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How your name appears"
              className="rounded-none h-12 bg-card border-border"
            />
            <div className="flex items-center gap-4 mt-3">
              <Button
                onClick={saveName}
                disabled={saving}
                className="rounded-none h-11 bg-white text-black hover:bg-white/90 uppercase tracking-widest text-xs font-bold"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              {saved && (
                <span className="text-xs uppercase tracking-widest text-green-400">
                  Saved
                </span>
              )}
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
          </div>
        </section>

        {/* Submissions */}
        <section className="border border-border p-8 mb-8">
          <h2 className="text-sm uppercase tracking-widest font-bold mb-6">
            Your Submissions
          </h2>

          {subsLoading ? (
            <p className="text-muted-foreground text-sm animate-pulse">
              Loading your submissions...
            </p>
          ) : subs.length === 0 ? (
            <>
              <p className="text-muted-foreground text-sm mb-6">
                You haven&apos;t submitted a deck yet. Your submissions will
                appear here.
              </p>
              <Link href="/apply">
                <Button
                  variant="outline"
                  className="rounded-none h-11 border-white/20 uppercase tracking-widest text-xs font-bold"
                >
                  Submit a Deck
                </Button>
              </Link>
            </>
          ) : (
            <div className="space-y-4">
              {subs.map((s) => (
                <div key={s.id} className="border border-border p-5">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-bold text-white border border-border px-2 py-1">
                      {s.status}
                    </span>
                  </div>
                  <p className="text-white text-sm mb-2 leading-relaxed">
                    {s.description}
                  </p>
                  <a
                    href={s.deckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white underline break-all"
                  >
                    View deck
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        <Button
          onClick={() => signOut()}
          variant="outline"
          className="rounded-none h-11 border-white/20 uppercase tracking-widest text-xs font-bold"
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
