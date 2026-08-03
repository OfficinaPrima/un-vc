import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { FundProgress } from "@/components/fund-progress";
import { ArrowRight, DollarSign, CheckCircle2 } from "lucide-react";

const FadeIn = ({ children, delay = 0, className = "", direction = "up" }: any) => {
  const yOffset = direction === "up" ? 24 : direction === "down" ? -24 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("0xaA3d8243453c7d9c50726B9570cb6740a3b2931C");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Address Copied",
      description: "USDC deposit address copied to clipboard.",
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 mix-blend-difference">
        <div className="font-display font-bold text-2xl tracking-tighter text-white">UN-VC</div>
        <div className="flex items-center gap-4">
          <Link href="/manifesto">
            <Button
              variant="ghost"
              className="rounded-none text-white hover:bg-white hover:text-black transition-colors"
            >
              Manifesto
            </Button>
          </Link>
          <Link href={user ? "/profile" : "/login"}>
            <Button
              variant="ghost"
              className="rounded-none text-white hover:bg-white hover:text-black transition-colors"
            >
              {user ? "Account" : "Log In"}
            </Button>
          </Link>
          <Link href="/submissions">
            <Button
              variant="ghost"
              className="rounded-none text-white hover:bg-white hover:text-black transition-colors"
            >
              Submissions
            </Button>
          </Link>
          <Link href="/apply">
            <Button
              variant="outline"
              className="rounded-none border-white/20 text-white hover:bg-white hover:text-black transition-colors"
            >
              Apply to Pitch
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-32 pb-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-5xl relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 border border-border px-3 py-1 mb-8">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Pre-Launch / Door is Open</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="font-display text-5xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter uppercase leading-[0.85] text-white">
              Real<br/>Innovation.<br/>Real Chance.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2} className="mt-12 max-w-2xl">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
              UN-VC is a new kind of venture fund — one built on transparency, entropy, and a single belief: that the next transformative idea could come from anyone, anywhere, regardless of who they know or where they came from. Every dollar is on-chain. Every vote counts equally. No gatekeepers.
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light mt-4">
              The fund is pre-launch. The door is open now for USDC deposits.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/apply">
              <Button 
                size="lg" 
                className="rounded-none bg-white text-black hover:bg-white/90 h-14 px-8 text-sm uppercase tracking-widest font-semibold"
              >
                Apply to Pitch <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-none h-14 px-8 text-sm uppercase tracking-widest font-semibold border-border hover:bg-secondary"
              onClick={() => scrollToSection("deposit")}
            >
              Deposit USDC
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="px-6 md:px-12 lg:px-24 py-32 border-b border-border">
        <div className="max-w-4xl">
          <FadeIn>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-8">
              VC Has Drifted.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-2xl md:text-4xl text-muted-foreground leading-snug font-light">
              It no longer backs the unknown. It backs the connected. The safe. The pre-validated. 
              There is no room for ideas that don't fit the mold.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="mt-8">
            <p className="text-lg text-muted-foreground/60 max-w-2xl">
              Venture Capital has its methodology; this is simply a different road. A road built on pure entropy rather than pedigree.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* How it works Section */}
      <section className="px-6 md:px-12 lg:px-24 py-32 border-b border-border bg-card/50">
        <FadeIn>
          <div className="flex items-center gap-4 mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tighter uppercase text-white">
              The Mechanics
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {[
            { title: "The Stake", desc: "Anyone looking to raise contributes $50 in USDC into a fully transparent, publicly auditable crypto wallet. Every cent is on-chain." },
            { title: "The Threshold", desc: "Once the fund reaches its target — $5,000 for Fund 1 — it's ready to make its first investment." },
            { title: "One Vote", desc: "Every contributor — whether they put in $50 or $10,000 — gets exactly ONE vote. Capital does not buy influence here." },
            { title: "The Lottery", desc: "A random number is assigned to each participant. A lottery determines who even gets to pitch — preventing anyone from gaming the system." },
            { title: "Pure Innovation", desc: "The community then votes on the best ideas, based purely on innovation and execution potential." },
            { title: "Self-Sustaining", desc: "The fund takes equity in funded companies. Successful exits reinvest back into the pool — self-sustaining by design." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.05} className="bg-background p-8 md:p-12 flex flex-col group">
              <span className="text-xs uppercase tracking-widest text-muted-foreground mb-6 font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-xl font-bold uppercase text-white mb-4 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground font-light leading-relaxed mt-auto">
                {item.desc}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* The Principles Section */}
      <section className="px-6 md:px-12 lg:px-24 py-40 border-b border-border text-center flex flex-col items-center">
        <FadeIn>
          <span className="text-xs uppercase tracking-widest text-muted-foreground mb-8 block">The Principles</span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[1.1] text-white max-w-5xl">
            No criteria based on gender, race, background, religious creed, or network. None.
          </h2>
          <div className="mt-16 inline-block border border-border px-8 py-4 bg-card">
            <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-widest text-white">
              Pure Entropy + Technology
            </span>
          </div>
          <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            This fund is not built to generate wealth for the wealthy — it is built to ensure real innovation has room to grow.
          </p>
        </FadeIn>
      </section>

      {/* Note to Investors Section */}
      <section className="px-6 md:px-12 lg:px-24 py-32 border-b border-border bg-white text-black">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="text-xs uppercase tracking-widest text-black/50 mb-8 block font-bold">A Note To Investors</span>
            <p className="font-display text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-[1.1]">
              This fund does not optimize for your exit strategy.
            </p>
            <p className="mt-8 text-xl text-black/70 font-medium">
              You have no shortage of places that do. This one is for the founders.
            </p>
            <p className="mt-8 text-base text-black/60 font-light max-w-2xl mx-auto leading-relaxed">
              But if you simply want to back it — no terms, no strings — the door is open. The fund's deposit address accepts any amount, so angels and accredited investors can contribute beyond the $50. Contributing doesn't buy votes or influence — voting belongs to founders who've submitted — but every dollar is on-chain, public, and fuels real innovation.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* $50 On Yourself Section */}
      <section className="px-6 md:px-12 lg:px-24 py-40 border-b border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <FadeIn className="flex-1 text-center md:text-left">
            <h2 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase text-white mb-8 leading-[0.85]">
              $50<br/>On<br/>Yourself.
            </h2>
          </FadeIn>
          <FadeIn delay={0.2} className="flex-1">
            <p className="text-3xl md:text-5xl text-muted-foreground leading-snug font-light mb-8">
              If you won't bet $50 on your own idea, why would anyone else?
            </p>
            <p className="text-xl text-muted-foreground/60 mb-12">
              This is the entry point. The stake is symbolic AND real.
            </p>
            <Button 
              size="lg" 
              className="rounded-none bg-white text-black hover:bg-white/90 h-16 px-12 text-sm uppercase tracking-widest font-bold w-full md:w-auto"
              onClick={() => scrollToSection("deposit")}
            >
              Stake Now
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* USDC Deposits Section */}
      <section id="deposit" className="px-6 md:px-12 lg:px-24 py-32 border-b border-border bg-card/30 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="flex-1">
                <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter uppercase text-white mb-6">
                  USDC Deposits
                </h2>
                <p className="text-xl text-muted-foreground font-light mb-8">
                  The fund is accepting USDC deposits now. Secure your place in the initial pool.
                </p>
                <div className="p-6 border border-border bg-card space-y-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest">Official Wallet Address</p>
                  <div className="flex items-center gap-2 p-4 bg-background border border-border">
                    <code className="text-sm md:text-base text-white truncate flex-1 font-mono">
                      0xaA3d8243453c7d9c50726B9570cb6740a3b2931C
                    </code>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="rounded-none uppercase tracking-widest text-xs h-10 px-4"
                      onClick={copyToClipboard}
                    >
                      {isCopied ? <CheckCircle2 className="w-4 h-4" /> : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-[320px] shrink-0">
                <div className="aspect-square w-full bg-background flex items-center justify-center border border-border p-6">
                  <img
                    src={`${import.meta.env.BASE_URL}qr-code.png`}
                    alt="USDC Deposit QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="mt-2 text-xs text-center text-muted-foreground uppercase tracking-widest">
                  Scan to deposit USDC
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Fund Progress */}
      <section className="px-6 md:px-12 lg:px-24 py-20 border-b border-border">
        <div className="max-w-3xl mx-auto">
          <FundProgress />
        </div>
      </section>

      {/* Apply to Pitch Section */}
      <section id="apply" className="px-6 md:px-12 lg:px-24 py-32 border-b border-border scroll-mt-24">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary mb-8 text-xs uppercase tracking-widest font-bold">
              Live Now
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter uppercase text-white mb-6">
              Apply to Pitch
            </h2>
            <p className="text-lg text-muted-foreground font-light mb-12 leading-relaxed">
              The $50 USDC deposit is your entry ticket. Submit your deck, get verified, and let the community vote.
              The top 10 projects enter the real-world random selection process.
            </p>

            <Link href="/apply">
              <Button
                size="lg"
                className="rounded-none bg-white text-black hover:bg-white/90 h-16 px-8 text-sm uppercase tracking-widest font-bold"
              >
                Submit Your Deck <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <p className="mt-6 text-xs text-muted-foreground uppercase tracking-widest">
              Wallet verification and deposit check are live.
            </p>
            <div className="mt-12 border-t border-border pt-8 max-w-2xl mx-auto">
              <p className="text-white font-bold uppercase tracking-widest text-sm mb-2">
                You don't have to submit a deck to be part of the movement.
              </p>
              <p className="text-muted-foreground font-light text-sm leading-relaxed">
                Create a free account to follow along and stand behind real innovation. Submitting a deck — with the $50 deposit — is what puts you in the pool and earns you a vote.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs uppercase tracking-widest text-muted-foreground border-t border-border">
        <div>© {new Date().getFullYear()} UN-VC. All rights reserved.</div>
        <div className="flex gap-8">
          <Link href="/manifesto" className="hover:text-white transition-colors">Manifesto</Link>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
