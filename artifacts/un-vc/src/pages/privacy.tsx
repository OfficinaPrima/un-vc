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

export default function Privacy() {
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
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: August 3, 2026
        </p>

        <Section title="1. What We Collect">
          <p>
            When you use UN-VC, we may collect: your email address and display
            name (for your account), the wallet address you submit, your pitch
            materials and description, and your votes.
          </p>
        </Section>

        <Section title="2. On-Chain Data Is Public">
          <p>
            Contributions are made on a public blockchain. Wallet addresses and
            transactions are visible to anyone, by design — transparency is core
            to how UN-VC works. Do not submit information you need to keep private.
          </p>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>
            We use your data to run the platform: to create and secure your
            account, verify deposits, display submissions, tally votes, and
            prevent abuse.
          </p>
        </Section>

        <Section title="4. Service Providers">
          <p>
            We rely on third parties to operate: Supabase (accounts, database,
            storage), Render (backend hosting), GitHub Pages (site hosting), and
            Google (if you choose "Continue with Google"). Their handling of data
            is governed by their own privacy policies.
          </p>
        </Section>

        <Section title="5. Cookies and Local Storage">
          <p>
            We store a login session in your browser so you stay signed in. We do
            not use advertising or third-party tracking cookies.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We keep account and submission data while your account is active and
            as needed to operate the fund and meet legal obligations. On-chain
            data, by nature, is permanent and cannot be deleted.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            You may request access to or deletion of the personal data we hold
            about you (off-chain data). Contact us to make a request. Note that
            on-chain records cannot be removed.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We take reasonable measures to protect your data, but no system is
            perfectly secure. You are responsible for your account credentials
            and wallet.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>
            We may update this policy. Continued use after changes means you
            accept the updated policy.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about your privacy? Reach us through the contact method
            listed on the site.
          </p>
        </Section>
      </div>
    </div>
  );
}
