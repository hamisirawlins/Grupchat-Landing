import Image from "next/image";
import Link from "next/link";

/**
 * Provider terms (KB D-043, D-046). Plain-language commitments a provider accepts
 * when they send an application (clickwrap, as D-009 does for sign-up).
 * "Responsibility" was confirmed by the owner on 11 Oct 2026. A section is a
 * paragraph, or a list when it is a set of separate commitments.
 */
const SECTIONS = [
  ["Who these terms are for", "These terms apply to businesses and people who list experiences on GrupChat (\"providers\"). They sit alongside our Terms of Service and Privacy Policy. By sending an application you accept them for your business."],
  ["Your application", "Tell us the truth about your business and send documents that are yours and current. We review every application against the checklist for your country before you go live, and we may ask for more, ask you to fix something, or decline. If something changes, such as your registration or your bank account, tell us."],
  ["Your listings", "Describe each experience honestly: what's included, where it starts, how long it takes, what it costs and how many places there are. Use photos of your own experience. Keep dates and places current, and pause a listing you can't run. Once approved, you publish listings yourself; we can pause any listing that breaks these terms or that guests report, and we'll tell you why."],
  ["Running the experience", "Honour every ticket sold for a date you listed, and keep guests safe: on the water, that means a life jacket for every guest and a licensed boat. If you have to cancel a date, tell us and your guests as early as you can."],
  ["Responsibility", [
    ["You run the experience.", "GrupChat lists it and sells tickets for it. We don't organise, run or supervise it."],
    ["Safety, licences and insurance are yours.", "You keep guests safe and hold every licence, permit and insurance the law and your activity require. We check your business registration and payout account only; that is not an inspection or an endorsement of your experience. We strongly recommend public liability insurance."],
    ["Incidents.", "Tell us within 24 hours of any accident or injury involving a guest, at info@grupchat.net."],
    ["Indemnity.", "You cover GrupChat for claims by guests or others that come from your experience, or from you breaking these terms or the law, except to the extent GrupChat caused them."],
    ["Our limit.", "GrupChat's liability to you is capped at the provider charges we kept from your sales in the 12 months before the claim. Nothing in these terms limits liability that the law does not allow to be limited."],
  ]],
  ["Payment", "Guests pay through our payment provider when they book. Each sale is split at checkout: your share is paid by the payment provider straight to the account you gave us, and GrupChat keeps its provider charges. Your portal shows what you will receive for every ticket before you publish. GrupChat does not hold your share."],
  ["Cancellations and refunds", "Each listing carries the cancellation policy you choose, and you honour it. If you cancel a date, guests get a full refund. Refunds are paid back through the payment provider."],
  ["Guests' information", "You see the names of the guests booked on your dates and their ticket codes, to check them in. Use them only to run the experience."],
  ["Ending", "You can stop listing at any time; dates already booked still need to be honoured or refunded. We can suspend or remove a provider who breaks these terms, after telling you why."],
  ["Questions", "Write to info@grupchat.net."],
];

export default function ProviderTerms() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-5 pb-24 pt-10 sm:px-8">
        <Link href="/providers" className="inline-flex items-center gap-2.5 self-start">
          <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-full" />
          <span className="text-lg font-extrabold tracking-[-0.01em]">GrupChat</span>
        </Link>
        <header className="flex flex-col gap-2">
          <h1 className="text-[32px] font-black leading-[38px] tracking-[-0.03em] sm:text-4xl">Provider terms</h1>
          <p className="text-[15px] text-ink-3">Last updated 11 October 2026</p>
        </header>
        {SECTIONS.map(([title, body]) => (
          <section key={title} className="flex flex-col gap-2 border-t border-line pt-6">
            <h2 className="text-lg font-extrabold">{title}</h2>
            {Array.isArray(body) ? (
              <ol className="flex list-decimal flex-col gap-2.5 pl-5 text-base leading-7 text-ink-2 marker:font-bold marker:text-ink">
                {body.map(([lead, text]) => (
                  <li key={lead} className="pl-1"><span className="font-bold text-ink">{lead}</span> {text}</li>
                ))}
              </ol>
            ) : (
              <p className="text-base leading-7 text-ink-2">{body}</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
