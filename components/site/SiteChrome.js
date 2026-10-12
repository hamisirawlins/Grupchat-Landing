import Image from "next/image";
import Link from "next/link";

/**
 * Header and footer for the public reading pages (the blog, experiences). Server components with
 * no script: these pages are for search engines and first visits, so they ship words, not bundles.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2.5">
          <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full" priority />
          <span className="text-base font-extrabold tracking-[-0.01em] text-ink">GrupChat</span>
        </Link>
        <nav aria-label="Site" className="flex items-center gap-1 text-sm font-semibold sm:gap-2">
          <Link href="/blog" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:text-ink min-[420px]:inline">Blog</Link>
          <Link href="/experiences" className="hidden rounded-full px-3 py-2 text-ink-2 transition-colors hover:text-ink min-[420px]:inline">Experiences</Link>
          <Link href="/sign-up" className="inline-flex h-10 items-center rounded-full bg-action px-4 text-white transition-colors hover:bg-action-strong">Join free</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const links = [
    ["Blog", "/blog"], ["Experiences", "/experiences"], ["List your experiences", "/providers"],
    ["How we write", "/blog/how-we-write"], ["Privacy", "/privacy-policy"], ["Terms", "/terms-of-service"],
  ];
  return (
    <footer className="border-t border-line bg-sheet">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="flex max-w-sm flex-col gap-2">
          <span className="text-base font-extrabold text-ink">GrupChat</span>
          <p className="text-sm leading-6 text-ink-2">Plan with your group, pool the money in one place, and book experiences from local providers.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
          {links.map(([name, href]) => <Link key={href} href={href} className="text-ink-2 transition-colors hover:text-ink">{name}</Link>)}
        </nav>
      </div>
      <p className="mx-auto w-full max-w-[1120px] px-5 pb-8 text-xs text-ink-3 sm:px-8">© {new Date().getFullYear()} GrupChat</p>
    </footer>
  );
}
