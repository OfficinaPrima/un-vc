import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold uppercase tracking-tight text-white mb-3">
        {title}
      </h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-10 uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: August 3, 2026
        </p>

        <Section title="1. What UN-VC Is">
          <p>
            UN-VC is an experimental, community-driven venture fund. Founders
            contribute $50 in USDC to a transparent, on-chain wallet, submit a
            pitch, and the community votes. A real-world random selection
            determines which of the most-voted projects receive funding. UN-VC
            is not a bank, broker, or registered investment adviser.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years old and legally able to enter this
            agreement in your jurisdiction. You are responsible for ensuring
            your participation is lawful where you live.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p>
            You are responsible for your account credentials and all activity
            under your account. One account per person. We may suspend or remove
            accounts that violate these terms.
          </p>
        </Section>

        <Section title="4. Contributions, Fees, and Refunds">
          <p>
            The $50 USDC contribution is a stake required to submit a pitch. All
            contributions are recorded on-chain and are publicly visible.
          </p>
          <p>
            <strong className="text-white">Network fees are not included in any transaction.</strong>{" "}
            For any funds leaving the UN-VC fund — whether a disbursement or a
            refund — the network fee is absorbed by that transaction and
            deducted from the amount sent. UN-VC does not pay network fees on top
            of stated amounts.
          </p>
        </Section>

        <Section title="5. Voting and Selection">
          <p>
            Voting is reserved for founders who have submitted. Each account gets
            one vote. Final selection among the most-voted projects is made by a
            real-world random draw. Submitting, being voted for, or being
            selected does not guarantee funding, and UN-VC makes no promise of
            any outcome, return, or profit.
          </p>
        </Section>

        <Section title="6. No Investment Advice or Guarantee">
          <p>
            Nothing here is financial, investment, legal, or tax advice. UN-VC is
            experimental. Participation may result in the total loss of your
            contribution. Do not contribute more than you can afford to lose.
          </p>
        </Section>

        <Section title="7. Crypto Risks">
          <p>
            Blockchain transactions are irreversible. Digital asset values are
            volatile. You are solely responsible for the security of your wallet
            and for sending funds to the correct address.
          </p>
        </Section>

        <Section title="8. Acceptable Use">
          <p>
            You may not create multiple accounts, manipulate voting, submit
            fraudulent or infringing content, or attempt to game the system. We
            may boot submissions and ban accounts that do so, at our discretion.
          </p>
        </Section>

        <Section title="9. Your Content">
          <p>
            You retain ownership of the pitch materials you submit. By submitting,
            you grant UN-VC a license to display them publicly within the platform
            for voting and transparency.
          </p>
        </Section>

        <Section title="10. Disclaimers and Liability">
          <p>
            The service is provided "as is," without warranties of any kind. To
            the fullest extent permitted by law, UN-VC is not liable for any
            losses arising from your use of the platform, including lost funds,
            missed selections, or downtime.
          </p>
        </Section>

        <Section title="11. Changes">
          <p>
            We may update these terms. Continued use after changes means you
            accept the updated terms.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these terms? Reach us through the contact method
            listed on the site.
          </p>
        </Section>
      </div>
    </div>
  );
}
