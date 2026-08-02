import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="py-16 border-b border-white/10">
    <FadeIn>
      <span className="text-xs uppercase tracking-widest text-white/30 font-mono block mb-6">{label}</span>
    </FadeIn>
    {children}
  </div>
);

const Heading = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <FadeIn>
    <h2 className={`font-display text-3xl md:text-5xl font-bold tracking-tighter uppercase text-white leading-tight mb-8 ${className}`}>
      {children}
    </h2>
  </FadeIn>
);

const Body = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <FadeIn delay={0.1}>
    <p className={`text-lg text-white/60 leading-relaxed font-light ${className}`}>{children}</p>
  </FadeIn>
);

const Pull = ({ children }: { children: React.ReactNode }) => (
  <FadeIn delay={0.1}>
    <blockquote className="border-l-2 border-white/20 pl-8 my-10">
      <p className="text-2xl md:text-3xl text-white/80 font-light leading-snug italic">{children}</p>
    </blockquote>
  </FadeIn>
);

export default function Manifesto() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 md:px-12 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-widest font-mono">
          <ArrowLeft className="w-4 h-4" />
          UN-VC
        </Link>
        <span className="text-xs uppercase tracking-widest text-white/30 font-mono hidden md:block">
          Manifesto — Version 1.0
        </span>
      </nav>

      {/* Header */}
      <div className="px-6 md:px-12 lg:px-24 pt-24 pb-16 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-xs uppercase tracking-widest text-white/30 font-mono block mb-6">
            The UN-VC Manifesto
          </span>
          <h1 className="font-display text-5xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter uppercase leading-[0.85] text-white max-w-6xl">
            A New<br />Road.
          </h1>
          <p className="mt-12 text-xl md:text-2xl text-white/50 font-light max-w-2xl leading-relaxed">
            A full accounting of how UN-VC works, why it was built this way, 
            and what it intends to change — for founders, not funds.
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <div className="px-6 md:px-12 lg:px-24 max-w-4xl">

        {/* I. The Problem */}
        <Section label="I — The Problem">
          <Heading>Venture Capital Has Drifted.</Heading>
          <Body className="mb-6">
            The premise of venture capital was always elegant: find people with extraordinary ideas before the world recognizes them, provide the capital and confidence they need to build, and share in the outcome. Risk tolerance was the asset. The willingness to back an unknown was the edge.
          </Body>
          <Body className="mb-6">
            That is no longer how it works.
          </Body>
          <Body className="mb-6">
            Since the mid-2000s, venture capital has undergone a quiet but profound transformation. The asset class that once prided itself on backing the improbable has become increasingly conservative — backing companies with proven revenue, warm introductions from within tight networks, and founders who look, speak, and move in exactly the same circles as the people writing the checks.
          </Body>
          <Pull>
            The system no longer rewards ideas. It rewards access.
          </Pull>
          <Body className="mb-6">
            Criteria shift constantly — sometimes it is traction, sometimes it is team pedigree, sometimes it is the particular narrative that is fashionable this quarter. But the one constant is who gets in the room. If you do not know someone who knows someone, the probability of getting funded is functionally zero — regardless of how extraordinary your idea is.
          </Body>
          <Body>
            This is not a conspiracy. It is not malice. It is the natural result of a system optimizing for the wrong thing: investor return protection over human innovation. We are not here to condemn that. We are here to offer a different road.
          </Body>
        </Section>

        {/* II. The Premise */}
        <Section label="II — The Premise">
          <Heading>Innovation Is Distributed. Capital Is Not.</Heading>
          <Body className="mb-6">
            The next transformative idea could come from anywhere. It has always been this way. The people who will change the world are not concentrated in a few zip codes, a few universities, or a few LinkedIn networks. They are everywhere — and most of them have never had a real shot at funding.
          </Body>
          <Body className="mb-6">
            UN-VC is built on a simple premise: if we remove the gatekeepers, trust the community, and let entropy do its work, real innovation will surface. Not every round will produce a unicorn. But every round will give ideas that deserved a chance an actual chance.
          </Body>
          <Pull>
            This fund is not built to make money. It is built to make progress.
          </Pull>
          <Body>
            The distinction matters. A fund built to maximize return will always — eventually — find ways to concentrate capital, reduce risk, and favor the familiar. A fund built to maximize progress will do the opposite. It will seek the unfamiliar, embrace entropy, and measure success differently.
          </Body>
        </Section>

        {/* III. The Mechanics */}
        <Section label="III — How It Works">
          <Heading>The Mechanism, In Full.</Heading>

          <FadeIn delay={0.05} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">The $50 Stake</h3>
            <Body className="mb-0">
              Every person looking to raise contributes $50 in USDC into the fund's transparent on-chain wallet before anything else happens. This is not a fee. It is a stake — a declaration of skin in the game. If you are not willing to bet $50 on your own idea, why would anyone else? The $50 is visible to everyone, auditable by everyone, and immutable on-chain. No one can claim they contributed more or less than they did. Transparency is structural, not policy.
            </Body>
          </FadeIn>

          <FadeIn delay={0.1} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">The Threshold</h3>
            <Body className="mb-0">
              The fund does not act until a meaningful pool exists. Fund 1's target is $5,000 — enough to help someone start something real — with later funds scaling up to $15,000, then $25,000 across 2026–2027. Reaching the target creates urgency for participants to recruit others who believe in the project, and makes the first investment meaningful rather than symbolic.
            </Body>
          </FadeIn>

          <FadeIn delay={0.15} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">One Person, One Vote</h3>
            <Body className="mb-0">
              Every contributor — regardless of how much they contributed — receives exactly one vote. An investor who deposits $10,000 has the same voting weight as someone who deposited $50. Capital does not buy influence in this fund. This is not a concession or a compromise. It is the point. The moment capital concentration translates into decision-making power, you have rebuilt the very system you were trying to escape.
            </Body>
          </FadeIn>

          <FadeIn delay={0.2} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">The Selection Process</h3>
            <Body className="mb-0">
              After community voting, the top 10 projects are assigned numbers 1 through 10. The winner is determined through a series of real-world random events — no code, no algorithms, no one in control. This is not a lottery you run on a computer. It is a lottery you run on reality.
            </Body>
          </FadeIn>

          <FadeIn delay={0.25} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">Round 1 — The Coin Flip</h3>
            <Body className="mb-0">
              A live coin flip eliminates half the field. Odd numbers (1, 3, 5, 7, 9) face one side; even numbers (2, 4, 6, 8, 10) face the other. Whatever the coin lands on, those five candidates move forward. The result is broadcast publicly. No one can predict it. No one can influence it.
            </Body>
          </FadeIn>

          <FadeIn delay={0.3} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">Round 2 — The Weather</h3>
            <Body className="mb-0">
              The remaining five candidates are assigned weather conditions — rain, sun, snow, wind, clouds. We pick a random city anywhere in the world, and check the weather at a predetermined time. Whichever candidate matches the actual weather in that city at that moment moves forward. The weather is not rigged. The city is not rigged. The time is not rigged. It is what it is.
            </Body>
          </FadeIn>

          <FadeIn delay={0.35} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">Round 3 — The Market</h3>
            <Body className="mb-0">
              The final two candidates are assigned outcomes: one gets "stock market up," the other gets "stock market down." We check the S&P 500 at market close on a predetermined day. Whichever direction the market moves, that candidate wins. The market does not care about your pitch deck. It does not care about your connections. It moves on its own logic — and that is exactly why it is fair.
            </Body>
          </FadeIn>

          <FadeIn delay={0.4} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">Why Real-World Randomness</h3>
            <Body className="mb-0">
              A computer-generated lottery could be audited, but it could also be gamed. A real-world random event cannot be gamed by anyone — not us, not you, not a hacker. The coin flip is a coin flip. The weather is the weather. The stock market is the stock market. The randomness is not in our code. It is in the world itself. That is the most transparent mechanism possible: reality as the oracle.
            </Body>
          </FadeIn>

          <FadeIn delay={0.45} className="mb-10">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">Community Voting</h3>
            <Body className="mb-0">
              Once pitches are heard, the community votes. One ID, one vote. The decision belongs to the crowd — the same crowd that has put skin in the game. Voting is based purely on innovation and execution potential, not on the presenter's track record or relatability to the average investor. The community is the filter. The community bears the outcome.
            </Body>
            <p className="text-sm text-white/50 font-light mt-4">
              Why only founders vote: a vote that costs nothing can be faked a thousand times over. Voting is reserved for those who&apos;ve submitted — a $50 on-chain deposit and a real project on the line. Skin in the game keeps the outcome real, and every deposit is public and auditable.
            </p>
          </FadeIn>

          <FadeIn delay={0.5}>
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-4">Self-Sustaining by Design</h3>
            <Body className="mb-0">
              The fund takes equity in every company it backs. When exits occur — acquisitions, IPOs, secondary sales — a portion of the proceeds returns to the fund pool. The rest cycles back to contributors. New entrants continue to contribute $50 in USDC. The fund does not need a single wealthy sponsor or anchor investor to operate indefinitely. Its design is self-reinforcing: every success creates fuel for the next round.
            </Body>
          </FadeIn>
        </Section>

        {/* IV. No Token */}
        <Section label="IV — On Tokens and Fraud">
          <Heading>We Will Not Issue a Token. Here Is Why.</Heading>
          <Body className="mb-6">
            This question will come up, so we are addressing it directly and without ambiguity: UN-VC will never issue its own coin, token, or digital asset. Not now. Not in a future version. Not as a "utility token." Not as a "governance token." Never.
          </Body>
          <Pull>
            The fastest way to corrupt a mission is to create a financial instrument tied to its success.
          </Pull>
          <Body className="mb-6">
            Issuing a proprietary token is how most crypto-adjacent fraud operates — not always intentionally, but systematically. Here is the mechanism: a team creates a token, retains a percentage at low or zero cost, drives demand through narrative and community enthusiasm, and then profits from the spread between their cost basis and the market price. The token becomes the product. The stated mission becomes the marketing.
          </Body>
          <Body className="mb-6">
            Even when the intent is honest, the incentive structure corrupts. When the people running a fund also hold a large position in its native token, every decision they make is colored by what maximizes the token's value — not what maximizes innovation. These are not the same thing. They frequently conflict.
          </Body>
          <Body className="mb-6">
            More practically: Bitcoin already exists. Stablecoins already exist. They are settled infrastructure. USDC is the most secure, most widely distributed, most auditable store of value ever created. It requires no trust in the issuer because there is no issuer. The blockchain is the ledger. Everyone can read it. No one can alter it.
          </Body>
          <Body className="mb-6">
            There is no financial or operational problem that issuing a UN-VC token would solve that USDC and stablecoins do not already solve — except enriching the people who hold the token before anyone else. That is precisely the dynamic we are here to dismantle.
          </Body>
          <Pull>
            We use USDC because it requires no trust in us. That is the correct design.
          </Pull>
          <Body>
            Every cent that enters this fund is on-chain and visible to the public. No token launch. No private sale. No whitelist for insiders. No transaction fee extraction mechanism. The fund operates on transparent, existing infrastructure — because the mission does not require anything else, and creating anything else would serve only those who created it.
          </Body>
        </Section>

        {/* V. Principles */}
        <Section label="V — The Principles">
          <Heading>Non-Negotiable.</Heading>
          <Body className="mb-10">
            These are not aspirations. They are constraints built into the architecture.
          </Body>

          {[
            ["Zero Demographic Criteria", "No decisions — funding, lottery entry, voting weight, or access — will ever be made on the basis of gender, race, ethnicity, national origin, religious creed, sexual orientation, age, or any other identity characteristic. This is not a diversity initiative. It is the absence of criteria. The system is blind to everything except the idea and the entropy."],
            ["No Network Advantage", "Knowing someone inside the fund does not help you. Contributing more does not help you. Having a platform or audience does not help you. The random assignment and lottery mechanism exist specifically to neutralize these advantages."],
            ["Full On-Chain Transparency", "Every dollar that enters the fund is publicly visible on the blockchain. Every disbursement will be documented. No private wallets, no off-chain movements, no exceptions."],
            ["Founder First", "Every structural decision prioritizes the founder's experience over the investor's comfort. Investors have vast resources and sophisticated alternatives. Founders without networks have this. That asymmetry is intentional."],
          ].map(([title, text], i) => (
            <FadeIn key={i} delay={i * 0.06} className="mb-10 pl-6 border-l border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">{title}</h3>
              <p className="text-white/60 leading-relaxed font-light">{text}</p>
            </FadeIn>
          ))}
        </Section>

        {/* VI. What This Is Not */}
        <Section label="VI — What This Is Not">
          <Heading>To Be Clear.</Heading>
          <Body className="mb-6">
            UN-VC is not a platform play. We are not building an ecosystem, a marketplace, or a token economy. We are not competing with existing VCs or trying to out-sophisticated them. We are not the next generation of the same model.
          </Body>
          <Body className="mb-6">
            UN-VC is not a charity. The companies we fund are expected to build real things and generate real outcomes. The equity stake is real. The accountability is real. The community that votes on investments is also the community that lives with the results.
          </Body>
          <Body className="mb-6">
            UN-VC is not an angel syndicate with a democratic veneer. The randomness is genuine. The one-vote-per-person rule is genuine. If these mechanisms ever become optional or subject to override, the fund ceases to be what it claims.
          </Body>
          <Pull>
            This is a different road. Not a better version of the same road.
          </Pull>
        </Section>

        {/* VII. The Invitation */}
        <Section label="VII — The Invitation">
          <Heading>You Are Invited.</Heading>
          <Body className="mb-6">
            If you have an idea that deserves a real shot — not a shot contingent on your address, your alumni network, your Twitter following, or your last name — this fund was built for you.
          </Body>
          <Body className="mb-6">
            The $50 stake is not a barrier. It is the signal. It is the first act of believing in yourself publicly. If that feels like too much to risk, ask yourself honestly whether the idea is ready. If it is ready, $50 is nothing compared to what you are asking anyone else to believe.
          </Body>
          <Body className="mb-6">
            If you are an investor accustomed to shaping terms, picking winners based on access, and expecting deference from founders — this is not the right vehicle for you, and we say that without hostility. Your methodology is valid in its own context. This context is different.
          </Body>
          <Body className="mb-10">
            If you believe that the next generation of human progress will come from unexpected places — and you are willing to let entropy, community, and transparency determine where capital flows — then you are in exactly the right place.
          </Body>

          <FadeIn delay={0.15}>
            <div className="border border-white/10 p-10 mt-8 bg-white/[0.02]">
              <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-4">The Fund Is Pre-Launch</p>
              <p className="text-xl text-white/80 font-light mb-8">
                USDC deposits are open now. When Fund 1 reaches its $5,000 target, voting will commence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="inline-flex items-center justify-center h-14 px-8 border border-white/20 text-white text-sm uppercase tracking-widest font-semibold hover:bg-white/5 transition-colors">
                  Back to UN-VC
                </Link>
              </div>
            </div>
          </FadeIn>
        </Section>

      </div>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 mt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs uppercase tracking-widest text-white/30 font-mono">
        <div>© {new Date().getFullYear()} UN-VC. All rights reserved.</div>
        <div className="flex gap-8">
          <Link href="/manifesto" className="hover:text-white transition-colors">Manifesto</Link>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
