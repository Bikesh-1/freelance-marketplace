import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Freelanzo",
  description: "How Freelanzo handles account and marketplace information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] px-4 pb-16 pt-28 text-[#111] sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-red-600 hover:underline">← Back to Freelanzo</Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-red-500">Legal</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: October 20, 2026</p>
        <p className="mt-7 leading-7 text-neutral-700">This page is starter copy for the Freelanzo prototype. Before public launch, the operator must review it against actual data flows, vendors, retention practices, and applicable law.</p>
        <div className="mt-8 space-y-7">
          <section><h2 className="text-xl font-bold">Information we handle</h2><p className="mt-2 leading-7 text-neutral-700">Depending on use, we may process account details such as name, email, role, profile information, portfolio and skills, job applications, messages, reviews, notifications, and marketplace activity. Wallet addresses and blockchain transaction identifiers may be processed when blockchain features are used. Do not submit information you do not want to share with other marketplace users.</p></section>
          <section><h2 className="text-xl font-bold">How information is used</h2><p className="mt-2 leading-7 text-neutral-700">Information may be used to create and secure accounts, operate profiles and job workflows, enable communication, manage marketplace transactions, prevent abuse, troubleshoot errors, and improve the service.</p></section>
          <section><h2 className="text-xl font-bold">Sharing and service providers</h2><p className="mt-2 leading-7 text-neutral-700">Profile details and content you publish may be visible to other users. Hosting, database, file storage, analytics, monitoring, email, and blockchain providers may process information when integrations are enabled. The operator should list the actual providers and purposes before production release.</p></section>
          <section><h2 className="text-xl font-bold">Retention and security</h2><p className="mt-2 leading-7 text-neutral-700">Information should be retained only as long as needed for the stated purpose, legal obligations, dispute handling, and security. Reasonable safeguards are used, but no service can guarantee absolute security. Public blockchain records may be permanent and cannot necessarily be deleted.</p></section>
          <section><h2 className="text-xl font-bold">Your choices and account deletion</h2><p className="mt-2 leading-7 text-neutral-700">You may request access, correction, or deletion of account information by contacting the platform operator. Some records may need to be retained for legal, security, financial, or dispute-resolution reasons. Add a monitored privacy contact and jurisdiction-specific rights before launch.</p></section>
          <section><h2 className="text-xl font-bold">Changes and contact</h2><p className="mt-2 leading-7 text-neutral-700">This policy may be updated when product features or data practices change. Replace this section with the legal entity's name and a working privacy contact before treating this policy as final.</p></section>
        </div>
      </article>
    </main>
  );
}
