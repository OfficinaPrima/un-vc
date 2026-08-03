import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/config";

type FundStatus = {
  balanceUsd: number;
  targetUsd: number;
  votingOpen: boolean;
};

export function FundProgress() {
  const { data, isError } = useQuery<FundStatus>({
    queryKey: ["fund-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/fund-status`);
      if (!res.ok) throw new Error("Failed to load fund status");
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const balance = data?.balanceUsd ?? 0;
  const target = data?.targetUsd ?? 5000;
  const pct = Math.min(100, Math.round((balance / target) * 100));

  return (
    <div className="border border-border bg-card p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
          Fund 1 Progress
        </span>
        {data?.votingOpen ? (
          <span className="text-xs uppercase tracking-widest text-green-400 font-bold">
            Voting Open
          </span>
        ) : (
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Voting opens at ${target.toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-4xl md:text-5xl font-bold text-white">
          ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span className="text-muted-foreground">
          / ${target.toLocaleString()}
        </span>
      </div>

      <div className="h-2 w-full bg-background border border-border overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground uppercase tracking-widest">
        {isError ? "Balance unavailable — retrying" : `${pct}% funded · live on-chain`}
      </p>
    </div>
  );
}
