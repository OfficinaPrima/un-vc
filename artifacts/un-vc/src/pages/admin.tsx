import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/config";
import { Button } from "@/components/ui/button";

type VoteCount = { submissionId: number; voteCount: number };

async function authFetch(path: string, options: RequestInit = {}) {
  const token = (await supabase.auth.getSession()).data.session?.access_token;
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const statusQ = useQuery({
    queryKey: ["admin-status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const res = await authFetch("/api/admin/status");
      return (await res.json()) as { isAdmin: boolean };
    },
  });
  const isAdmin = statusQ.data?.isAdmin ?? false;

  const subsQ = useQuery({
    queryKey: ["admin-subs"],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await authFetch("/api/admin/submissions");
      return (await res.json()) as any[];
    },
  });

  const votesQ = useQuery({
    queryKey: ["votes"],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/votes`);
      return (await res.json()) as VoteCount[];
    },
  });

  const voteCountFor = (id: number) =>
    votesQ.data?.find((v) => v.submissionId === id)?.voteCount ?? 0;

  const ranked = [...(subsQ.data ?? [])].sort(
    (a, b) => voteCountFor(b.id) - voteCountFor(a.id),
  );

  async function toggleRemoved(submissionId: number, removed: boolean) {
    try {
      const res = await authFetch("/api/admin/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, removed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update failed");
      }
      toast({ title: removed ? "Project booted" : "Project reinstated" });
      subsQ.refetch();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  }

  async function toggleWinner(submissionId: number, winner: boolean) {
    try {
      const res = await authFetch("/api/admin/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, winner }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update failed");
      }
      toast({ title: winner ? "Marked as winner" : "Winner removed" });
      subsQ.refetch();
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    }
  }

  if (loading || !user || statusQ.isLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xl font-bold uppercase tracking-tight">
          Not authorized
        </p>
        <p className="text-muted-foreground text-sm">
          This page is for administrators only.
        </p>
        <Link
          href="/"
          className="text-sm uppercase tracking-widest underline hover:text-white text-muted-foreground"
        >
          Back to site
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-10 uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2">
          Admin
        </h1>
        <p className="text-muted-foreground mb-12 text-sm">
          All submissions, ranked by votes. Mark the real-world lottery
          winner(s).
        </p>

        {subsQ.isLoading ? (
          <p className="text-muted-foreground text-sm animate-pulse">
            Loading submissions...
          </p>
        ) : ranked.length === 0 ? (
          <p className="text-muted-foreground text-sm">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {ranked.map((s, i) => (
              <div
                key={s.id}
                className={`border p-5 flex items-center gap-4 ${
                  s.removed
                    ? "border-red-500/40 bg-red-500/5 opacity-60"
                    : s.winner
                      ? "border-green-400/50 bg-green-400/5"
                      : "border-border"
                }`}
              >
                <span className="text-xs uppercase tracking-widest text-muted-foreground w-8 shrink-0">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-relaxed line-clamp-2">
                    {s.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <span>
                      {voteCountFor(s.id)}{" "}
                      {voteCountFor(s.id) === 1 ? "vote" : "votes"}
                    </span>
                    <a
                      href={s.deckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white"
                    >
                      Deck
                    </a>
                    {s.winner && (
                      <span className="text-green-400 font-bold inline-flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Winner
                      </span>
                    )}
                    {s.removed && (
                      <span className="text-red-400 font-bold">Booted</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    onClick={() => toggleWinner(s.id, !s.winner)}
                    variant="outline"
                    className="rounded-none h-9 border-white/20 uppercase tracking-widest text-xs font-bold"
                  >
                    {s.winner ? "Unmark" : "Mark Winner"}
                  </Button>
                  <Button
                    onClick={() => toggleRemoved(s.id, !s.removed)}
                    variant="outline"
                    className={`rounded-none h-9 uppercase tracking-widest text-xs font-bold ${
                      s.removed
                        ? "border-white/20"
                        : "border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    {s.removed ? "Reinstate" : "Boot"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
