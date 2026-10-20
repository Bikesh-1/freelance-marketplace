import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Freelanzo",
  description: "Starter terms for using the Freelanzo marketplace.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] px-4 pb-16 pt-28 text-[#111] sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-red-600 hover:underline">← Back to Freelanzo</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-red-500">Legal</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: October 20, 2026</p>
        <p className="mt-7 leading-7 text-neutral-700">These are starter terms for a prototype, not legal advice. The operator should obtain legal review and fill in legal entity, governing law, support contact, dispute process, and payment/refund rules before production launch.</p>
        <div className="mt-8 space-y-7">
          <section><h2 className="text-xl font-bold">Using the platform</h2><p className="mt-2 leading-7 text-neutral-700">Provide accurate account information, keep your credentials secure, and use the marketplace lawfully. You are responsible for activity through your account and should promptly report suspected unauthorized access.</p></section>
          <section><h2 className="text-xl font-bold">Accounts and eligibility</h2><p className="mt-2 leading-7 text-neutral-700">Do not impersonate another person, misrepresent qualifications, bypass access controls, or create accounts for fraudulent purposes. The operator may restrict access when reasonably necessary for security, compliance, or abuse prevention.</p></section>
          <section><h2 className="text-xl font-bold">Jobs, proposals, and communications</h2><p className="mt-2 leading-7 text-neutral-700">Clients and freelancers are responsible for agreeing on scope, deliverables, deadlines, and acceptance criteria. Do not use the service to transmit unlawful, deceptive, abusive, or infringing material. Platform features and availability may change over time.</p></section>
          <section><h2 className="text-xl font-bold">Wallet and blockchain features</h2><p className="mt-2 leading-7 text-neutral-700">Blockchain actions may be irreversible, depend on third-party networks, and require network fees. Verify network, recipient, and transaction details before signing. Never share private keys or recovery phrases. A displayed status does not guarantee that a transaction can be reversed or recovered.</p></section>
          <section><h2 className="text-xl font-bold">Fees, disputes, and availability</h2><p className="mt-2 leading-7 text-neutral-700">Fees, escrow release conditions, refunds, dispute-handling timelines, and limits of liability must be clearly documented by the operator before accepting real payments. Uninterrupted availability is not guaranteed.</p></section>
          <section><h2 className="text-xl font-bold">Suspension and termination</h2><p className="mt-2 leading-7 text-neutral-700">The operator may suspend or terminate access for material violations or security risks, subject to applicable law. Users may request account closure, but records needed for legitimate legal and dispute purposes may be retained.</p></section>
          <section><h2 className="text-xl font-bold">Contact and governing terms</h2><p className="mt-2 leading-7 text-neutral-700">Before production launch, replace this section with the operator's legal name, support contact, governing law, and a complete, legally reviewed dispute-resolution process.</p></section>
        </div>
      </article>
    </main>
  );
}
