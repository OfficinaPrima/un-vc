import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/config";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Wallet,
  Send,
  CheckCircle2,
  Activity,
  Fuel,
  Clock,
  Gauge,
  AlertTriangle,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useCreateSubmission } from "@workspace/api-client-react";

const FUND_ADDRESS = "0xaA3d8243453c7d9c50726B9570cb6740a3b2931C";

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

interface NetworkStatus {
  safeGasPrice: number;
  proposeGasPrice: number;
  fastGasPrice: number;
  baseFee: number;
  congestion: "calm" | "moderate" | "busy" | "congested";
  estimatedConfirmMinutes: number;
  lastUpdated: string;
}

const congestionConfig = {
  calm: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", label: "Calm" },
  moderate: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Moderate" },
  busy: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "Busy" },
  congested: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Congested" },
};

function NetworkStatusWidget() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<NetworkStatus>({
    queryKey: ["network-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/network-status`);
      if (!res.ok) throw new Error("Failed to fetch network status");
      return res.json();
    },
    refetchInterval: 30000, // refresh every 30s
    staleTime: 15000,
  });

  const config = data ? congestionConfig[data.congestion] : congestionConfig.calm;

  return (
    <div className="border border-border bg-card/50 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-white" />
          <span className="text-sm text-white uppercase tracking-widest font-bold">Network Status</span>
        </div>
        <button
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-white transition-colors"
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground animate-pulse">Loading Ethereum network data...</div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Network data unavailable. Try refreshing.</span>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Congestion badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.bg} ${config.border} border`}>
            <Gauge className={`w-4 h-4 ${config.color}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">~{data.estimatedConfirmMinutes} min confirmation</span>
          </div>

          {/* Gas prices */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-border bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Safe</p>
              <p className="text-lg font-bold text-white">{data.safeGasPrice.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">gwei</p>
            </div>
            <div className="border border-border bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Standard</p>
              <p className="text-lg font-bold text-white">{data.proposeGasPrice.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">gwei</p>
            </div>
            <div className="border border-border bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Fast</p>
              <p className="text-lg font-bold text-white">{data.fastGasPrice.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">gwei</p>
            </div>
          </div>

          {/* Base fee */}
          <div className="flex items-center justify-between border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">Base Fee</span>
            </div>
            <span className="text-sm font-bold text-white">{data.baseFee.toFixed(3)} gwei</span>
          </div>

          <p className="text-xs text-muted-foreground text-right">
            Updated {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Apply() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Submitting requires an account — redirect anonymous visitors to login.
  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const [submitted, setSubmitted] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [deckUrl, setDeckUrl] = useState("");
  const [description, setDescription] = useState("");
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(FUND_ADDRESS);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ title: "Address Copied", description: "Fund address copied to clipboard." });
  };

  const mutation = useCreateSubmission({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        toast({
          title: "Submitted & Verified",
          description: "Your deposit was verified and your deck is now in the gallery.",
        });
      },
      onError: (error: any) => {
        const data = error?.data || {};
        const msg = data.error || error?.message || "Submission failed.";
        const detail = data.detail || "";
        const retry = data.retry;

        toast({
          title: msg,
          description: detail || (retry ? "Check your deposit and try again." : "Please try again later."),
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !description || (!deckUrl && !deckFile)) {
      toast({
        title: "Missing fields",
        description:
          "Fill in your wallet and a description, and either upload a deck or paste a link.",
        variant: "destructive",
      });
      return;
    }

    let finalDeckUrl = deckUrl;

    // If a file was chosen, validate and upload it to Supabase Storage.
    if (deckFile) {
      if (deckFile.type !== "application/pdf") {
        toast({
          title: "PDF only",
          description: "Please upload your deck as a PDF file.",
          variant: "destructive",
        });
        return;
      }
      if (deckFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Your deck must be 10MB or smaller.",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      try {
        const safeName = deckFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        // Random folder — keeps the account's user id out of the public URL.
        const path = `${crypto.randomUUID()}/${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("decks")
          .upload(path, deckFile, {
            contentType: "application/pdf",
            upsert: false,
          });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("decks").getPublicUrl(path);
        finalDeckUrl = pub.publicUrl;
      } catch (err) {
        setUploading(false);
        toast({
          title: "Upload failed",
          description:
            err instanceof Error
              ? err.message
              : "Could not upload your deck. Please try again.",
          variant: "destructive",
        });
        return;
      }
      setUploading(false);
    }

    mutation.mutate({
      data: {
        walletAddress,
        deckUrl: finalDeckUrl,
        description,
        teamSize: 1,
      },
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-6 md:px-12 lg:px-24 py-12 max-w-3xl mx-auto text-center">
          <FadeIn>
            <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-8" strokeWidth={1} />
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-6">
              Submission Verified.
            </h1>
            <p className="text-lg text-muted-foreground font-light mb-8 leading-relaxed">
              Your $50 USDC deposit was verified and your pitch deck has been submitted.
              The community will review it soon. You will be notified when voting begins.
            </p>
            <Link href="/submissions">
              <Button className="rounded-none bg-white text-black hover:bg-white/90 h-14 px-8 text-sm uppercase tracking-widest font-bold mr-4">
                View Gallery
              </Button>
            </Link>
            <Link href="/">
              <Button className="rounded-none border border-white text-white hover:bg-white hover:text-black h-14 px-8 text-sm uppercase tracking-widest font-bold">
                Back to Home
              </Button>
            </Link>
          </FadeIn>
        </div>
      </div>
    );
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

      <div className="px-6 md:px-12 lg:px-24 py-16 max-w-3xl mx-auto">
        <FadeIn>
          <div className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary mb-8 text-xs uppercase tracking-widest font-bold">
            Apply to Pitch
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-6">
            Submit Your Deck.
          </h1>
          <p className="text-lg text-muted-foreground font-light mb-12 leading-relaxed">
            Send $50 USDC to the fund address below, then submit your deck. We verify your deposit automatically before saving.
          </p>
        </FadeIn>

        {/* Network Status Widget */}
        <FadeIn delay={0.05}>
          <div className="mb-12">
            <NetworkStatusWidget />
          </div>
        </FadeIn>

        {/* Deposit Instructions */}
        <FadeIn delay={0.08}>
          <div className="border border-border bg-card/50 p-6 md:p-8 space-y-8 mb-12">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-white" />
              <span className="text-sm text-white uppercase tracking-widest font-bold">Deposit $50 USDC</span>
            </div>

            {/* Address + Copy */}
            <div className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Fund Address</p>
              <div className="flex items-center gap-3">
                <code className="text-sm md:text-base text-white font-mono truncate flex-1">{FUND_ADDRESS}</code>
                <button
                  onClick={copyAddress}
                  className="p-2.5 text-muted-foreground hover:text-white transition-colors border border-border hover:border-white shrink-0"
                >
                  {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QR Code — centered, prominent */}
            <div className="flex flex-col items-center">
              <div className="w-[180px] h-[180px] bg-background flex items-center justify-center border border-border p-3">
                <img
                  src={`${import.meta.env.BASE_URL}qr-code.png`}
                  alt="USDC Deposit QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground uppercase tracking-widest">
                Scan to deposit USDC
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3 text-sm text-muted-foreground border-t border-border pt-6">
              <p className="flex items-start gap-3">
                <span className="text-white font-bold shrink-0 w-5">1.</span>
                Send exactly <span className="text-white font-bold">$50 USDC</span> on Ethereum mainnet to the address above.
              </p>
              <p className="flex items-start gap-3">
                <span className="text-white font-bold shrink-0 w-5">2.</span>
                Wait for the transaction to confirm (~1–5 minutes depending on congestion).
              </p>
              <p className="flex items-start gap-3">
                <span className="text-white font-bold shrink-0 w-5">3.</span>
                Fill in the form below and submit. We verify your deposit automatically.
              </p>
              <p className="text-xs text-muted-foreground/70 leading-relaxed pt-4 border-t border-border mt-4">
                Network fees are not included in any transaction. For any funds leaving the UN-VC fund — whether a disbursement or a refund — the network fee is absorbed by that transaction and deducted from the amount sent. UN-VC does not pay network fees on top of the stated dollar amounts.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Wallet Address */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Address
              </label>
              <Input
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="rounded-none h-14 bg-card border-border text-white px-6 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white"
              />
              <p className="text-xs text-muted-foreground">
                The wallet you deposited $50 USDC from. Must match the sender address exactly.
              </p>
            </div>

            {/* Deck URL */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                Deck URL
              </label>
              <Input
                placeholder="https://youtube.com/... or https://docsend.com/..."
                value={deckUrl}
                onChange={(e) => setDeckUrl(e.target.value)}
                className="rounded-none h-14 bg-card border-border text-white px-6 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white"
              />
              <p className="text-xs text-muted-foreground">
                Link to your pitch deck (YouTube, DocSend, or any publicly accessible URL) — or upload a PDF below.
              </p>
            </div>

            {/* Deck file upload */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                Or Upload Deck (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setDeckFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:border file:border-border file:bg-card file:text-white file:uppercase file:tracking-widest file:text-xs file:font-bold hover:file:bg-white hover:file:text-black file:cursor-pointer cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                PDF only, 10MB max.{" "}
                {deckFile
                  ? `Selected: ${deckFile.name}`
                  : "Upload a file or paste a link above — either works."}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                Project Description
              </label>
              <Textarea
                placeholder="Describe your project in 250 characters or less. What problem are you solving?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={250}
                className="rounded-none min-h-[120px] bg-card border-border text-white px-6 py-4 placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white"
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/250
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending || uploading}
                className="rounded-none bg-white text-black hover:bg-white/90 h-14 px-8 text-sm uppercase tracking-widest font-bold w-full sm:w-auto"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading deck...
                  </span>
                ) : mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying deposit...
                  </span>
                ) : (
                  <>
                    Submit Deck <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
              {mutation.isPending && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Checking your USDC deposit on-chain. This may take 10–30 seconds.
                </p>
              )}
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
