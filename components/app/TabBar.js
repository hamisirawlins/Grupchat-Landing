"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, FolderOpen, House } from "lucide-react";

const TABS = [
  { href: "/home", label: "Home", icon: House, match: (p) => p === "/home" || p.startsWith("/admin") },
  { href: "/plans", label: "Plans", icon: FolderOpen, match: (p) => p.startsWith("/plans") },
  { href: "/discover", label: "Discover", icon: Compass, match: (p) => p.startsWith("/discover") },
  { href: "/notifications", label: "Alerts", icon: Bell, match: (p) => p.startsWith("/notifications") },
];

/** iOS-style bottom tab bar for phones; hidden from 640px up where the header carries navigation. */
export function TabBar() {
  const pathname = usePathname() || "";
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.08] bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-3xl grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 active:scale-95 ${
                  active ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
