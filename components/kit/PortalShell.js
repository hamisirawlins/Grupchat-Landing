"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useRequireAuth } from "@/components/app/AppShell";
import { SPRING } from "@/lib/motion";

/**
 * The shell for working surfaces: the provider portal and the admin console
 * (KB 25 §Scheme). From 960px a 248px sidebar with labels; from 640px a 76px
 * icon rail; on phones a top bar and a bottom tab bar, so nothing important
 * is ever more than a thumb away. The active item's highlight slides between
 * items instead of jumping.
 *
 * `theme="dark"` paints the admin console's ground; content stays light.
 */
const THEMES = {
  light: {
    side: "bg-white border-r border-line",
    brand: "text-ink",
    item: "text-ink hover:bg-soft",
    itemOn: "text-action-strong",
    pill: "bg-action-tint",
    icon: "text-ink-2",
    iconOn: "text-action",
    count: "bg-soft text-ink-2",
    countOn: "bg-action text-white",
    bar: "bg-white/90 border-line",
    tabOn: "text-action",
    tab: "text-ink-3",
  },
  dark: {
    side: "bg-ground-dark",
    brand: "text-ink-dark",
    item: "text-ink-2-dark hover:bg-surface-dark",
    itemOn: "text-ink-dark",
    pill: "bg-action-tint-dark",
    icon: "text-ink-2-dark",
    iconOn: "text-action-dark",
    count: "bg-raised-dark text-ink-dark",
    countOn: "bg-action text-white",
    bar: "bg-ground-dark/95 border-white/[0.09]",
    tabOn: "text-action-dark",
    tab: "text-ink-2-dark",
  },
};

function isActive(item, pathname) {
  return item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Brand({ href, tag, t }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 px-2 ${t.brand}`}>
      <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full" priority />
      <span className="hidden items-center gap-2 lg:inline-flex">
        <span className="text-lg font-extrabold tracking-[-0.01em]">GrupChat</span>
        {tag}
      </span>
      <span className="sr-only lg:hidden">GrupChat</span>
    </Link>
  );
}

function SideNav({ nav, pathname, t, reduce, id }) {
  return (
    <LayoutGroup id={id}>
      <nav aria-label="Sections" className="flex flex-col gap-0.5">
        {nav.map((item) => {
          const on = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              aria-current={on ? "page" : undefined}
              title={item.label}
              className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors duration-200 ${on ? `${t.itemOn} font-bold` : `${t.item} font-semibold`} justify-center lg:justify-start`}
            >
              {on && (
                <motion.span
                  layoutId={`${id}-pill`}
                  className={`absolute inset-0 rounded-xl ${t.pill}`}
                  transition={reduce ? { duration: 0 } : SPRING.ui}
                />
              )}
              <Icon aria-hidden="true" className={`relative h-[22px] w-[22px] shrink-0 ${on ? t.iconOn : t.icon}`} strokeWidth={on ? 2.25 : 1.75} />
              <span className="relative hidden lg:inline">{item.label}</span>
              {item.count > 0 && (
                <span className={`relative ml-auto hidden h-[22px] min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold lg:inline-flex ${on ? t.countOn : t.count}`}>{item.count}</span>
              )}
              {item.count > 0 && <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 rounded-full bg-action lg:hidden" />}
            </Link>
          );
        })}
      </nav>
    </LayoutGroup>
  );
}

export default function PortalShell({ theme = "light", brandHref, tag, cta, nav, footer, children, maxWidth = "max-w-[1120px]", id = "portal" }) {
  const { ready } = useRequireAuth();
  const pathname = usePathname() || "";
  const reduce = useReducedMotion();
  const t = THEMES[theme] ?? THEMES.light;
  if (!ready) return <div className="min-h-screen bg-white" aria-busy="true" />;
  const CtaIcon = cta?.icon;

  return (
    <div className="flex min-h-screen bg-white text-ink">
      {/* Sidebar and rail: 640px and up */}
      <aside className={`sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col gap-5 px-3 py-6 sm:flex lg:w-[248px] lg:px-4 ${t.side}`}>
        <Brand href={brandHref} tag={tag} t={t} />
        {cta && (
          <Link href={cta.href} aria-label={cta.label} title={cta.label} className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-action text-[15px] font-bold text-white transition-colors duration-200 hover:bg-action-strong active:scale-[0.98]">
            {CtaIcon && <CtaIcon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2.25} />}
            <span className="hidden lg:inline">{cta.label}</span>
          </Link>
        )}
        <SideNav nav={nav} pathname={pathname} t={t} reduce={reduce} id={`${id}-side`} />
        <div className="flex-1" />
        {footer}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phones: top bar */}
        <header className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur sm:hidden ${t.bar}`}>
          <Link href={brandHref} className={`flex items-center gap-2 ${t.brand}`}>
            <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
            <span className="text-base font-extrabold tracking-[-0.01em]">GrupChat</span>
            {tag}
          </Link>
          {cta && (
            <Link href={cta.href} aria-label={cta.label} className="flex h-10 w-10 items-center justify-center rounded-full bg-action text-white active:scale-95">
              {CtaIcon && <CtaIcon aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />}
            </Link>
          )}
        </header>

        <main className="min-w-0 flex-1">
          <div className={twMerge("mx-auto flex w-full flex-col gap-7 px-5 pb-32 pt-6 sm:px-8 sm:pb-16 sm:pt-10 lg:px-12", maxWidth)}>{children}</div>
        </main>

        {/* Phones: bottom tabs */}
        <LayoutGroup id={`${id}-tabs`}>
          <nav aria-label="Sections" className={`fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden ${t.bar}`}>
            <ul className="grid h-16" style={{ gridTemplateColumns: `repeat(${Math.min(nav.length, 5)}, minmax(0, 1fr))` }}>
              {nav.slice(0, 5).map((item) => {
                const on = isActive(item, pathname);
                const Icon = item.icon;
                return (
                  <li key={item.href + item.label}>
                    <Link href={item.href} aria-current={on ? "page" : undefined} className={`relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold active:scale-95 ${on ? t.tabOn : t.tab}`}>
                      {on && <motion.span layoutId={`${id}-tab-dot`} className="absolute top-1.5 h-1 w-6 rounded-full bg-current" transition={reduce ? { duration: 0 } : SPRING.ui} />}
                      <span className="relative">
                        <Icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={on ? 2.25 : 1.75} />
                        {item.count > 0 && <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-action px-1 text-[10px] font-bold text-white">{item.count}</span>}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </LayoutGroup>
      </div>
    </div>
  );
}
