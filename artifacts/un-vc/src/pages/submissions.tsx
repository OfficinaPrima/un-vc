import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Wallet, CheckCircle2, CircleDashed } from "lucide-react";
import { useGetSubmissions } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/config";

const FadeIn = ({ children, delay = 0, className = "" }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

function truncateWallet(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

type VoteCount = { submissionId: number; voteCount: number };

export default function Submissions() {
  const { data: submissions, isLoading, isError } = useGetSubmissions();
  const { user } = useAuth();
  const { toast } = useToast();
  const [voting, setVoting] = useState<number | null>(null);

  const votesQuery = useQuery({
    queryKey: ["votes"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/votes`);
      if (!res.ok) throw new Error("Failed to load votes");
      return (await res.json()) as VoteCount[];
    },
    refetchInterval: 30000,
  });

  const fundQuery = useQuery({
    queryKey: ["fund-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/fund-status`);
      if (!res.ok) throw new Error("Failed to load fund status");
      return (await res.json()) as { votingOpen: boolean };
    },
  });

  const myVoteQuery = useQuery({
    queryKey: ["my-vote", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${API_BASE}/api/votes/mine`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return { submissionId: null as number | null };
      return (await res.json()) as { submissionId: number | null };
    },
  });

  const votingOpen = fundQuery.data?.votingOpen ?? false;
  const myVote = myVoteQuery.data?.submissionId ?? null;

  const voteCountFor = (id: number) =>
    votesQuery.data?.find((v) => v.submissionId === id)?.voteCount ?? 0;

  // Rank submissions by votes (most first) so the top 10 rise to the top.
  const ranked = [...((submissions as any[]) ?? [])].sort(
    (a, b) => voteCountFor(b.id) - voteCountFor(a.id),
  );

  async function castVote(submissionId: number) {
    setVoting(submissionId);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch(`${API_BASE}/api/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ submissionId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not cast your vote.");
      }
      toast({ title: "Vote cast", description: "Thanks — your vote is in." });
      votesQuery.refetch();
      myVoteQuery.refetch();
    } catch (err) {
      toast({
        title: "Vote failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setVoting(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="px-6 md:px-12 lg:px-24 py-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-sm tracking-tight uppercase hover:opacity-80 transition-opacity">
          UN-VC
        </Link>
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-16 max-w-6xl mx-auto">
        <FadeIn>
          <div className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary mb-8 text-xs uppercase tracking-widest font-bold">
            Public Gallery
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-6">
            Submissions.
          </h1>
          <p className="text-lg text-muted-foreground font-light mb-12 leading-relaxed max-w-2xl">
            Browse all submissions, ranked by community votes. When voting opens, the top 10 advance to the real-world lottery.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          {isLoading && (
            <div className="text-muted-foreground text-center py-24">
              <CircleDashed className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading submissions...
            </div>
          )}

          {isError && (
            <div className="text-center py-24 text-muted-foreground">
              Failed to load submissions. Please try again.
            </div>
          )}

          {submissions && submissions.length === 0 && (
            <div className="text-center py-24 border border-border">
              <p className="text-muted-foreground text-lg mb-4">
                No submissions yet.
              </p>
              <Link href="/apply">
                <Button className="rounded-none bg-white text-black hover:bg-white/90 h-14 px-8 text-sm uppercase tracking-widest font-bold">
                  Be the First
                </Button>
              </Link>
            </div>
          )}

          {ranked.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ranked.map((sub: any, rank: number) => (
                <div
                  key={sub.id}
                  className="border border-border bg-card p-6 flex flex-col gap-4 hover:border-white/30 transition-colors"
                >
                  {voteCountFor(sub.id) > 0 && rank < 10 && (
                    <span className="self-start text-xs uppercase tracking-widest font-bold text-black bg-white px-2 py-1">
                      #{rank + 1} · Top 10
                    </span>
                  )}
                  {sub.thumbnailUrl && (
                    <img
                      src={sub.thumbnailUrl}
                      alt=""
                      className="w-full h-32 object-cover border border-border"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wallet className="w-4 h-4" />
                      <span className="font-mono">{truncateWallet(sub.walletAddress)}</span>
                    </div>
                    {sub.depositVerified === "true" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Submitted
                      </span>
                    )}
                  </div>

                  <p className="text-white text-sm leading-relaxed line-clamp-3">
                    {sub.description}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-border mt-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        {voteCountFor(sub.id)} {voteCountFor(sub.id) === 1 ? "vote" : "votes"}
                      </span>
                      {!user ? (
                        <Link
                          href="/login"
                          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white underline"
                        >
                          Log in to vote
                        </Link>
                      ) : myVote === sub.id ? (
                        <span className="text-xs uppercase tracking-widest text-green-400 font-bold">
                          Voted ✓
                        </span>
                      ) : myVote !== null ? (
                        <span className="text-xs uppercase tracking-widest text-muted-foreground/50">
                          Vote used
                        </span>
                      ) : (
                        <button
                          onClick={() => castVote(sub.id)}
                          disabled={voting !== null}
                          className="text-xs uppercase tracking-widest font-bold text-white border border-white/30 px-3 py-1 hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        >
                          {voting === sub.id ? "Voting..." : "Vote"}
                        </button>
                      )}
                    </div>
                    <a
                      href={sub.deckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-white hover:underline uppercase tracking-widest"
                    >
                      View Deck <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
