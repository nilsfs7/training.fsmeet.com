"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/statistics", label: "Statistics", icon: StatisticsIcon },
];

export function Shell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFab = pathname === "/" || pathname === "/log" || pathname.startsWith("/edit") || pathname.startsWith("/statistics");

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <div className="app-frame">
      <a className="profile-link" href="/profile" aria-current={pathname === "/profile" ? "page" : undefined}>
        <PersonIcon />
        <span>{name}</span>
      </a>
      {children}
      {hideFab ? null : (
        <a className="fab" href="/log" aria-label="Log Training">
          +
        </a>
      )}
      <nav className="nav">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const current = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <a key={link.href} href={link.href} aria-current={current ? "page" : undefined}>
              <Icon />
              <span>{link.label}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <Icon>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </Icon>
  );
}

function HistoryIcon() {
  return (
    <Icon>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
    </Icon>
  );
}

function StatisticsIcon() {
  return (
    <Icon>
      <path d="M5 19V10M12 19V5M19 19v-7" />
    </Icon>
  );
}

function PersonIcon() {
  return (
    <Icon>
      <circle cx="12" cy="8" r="3" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </Icon>
  );
}
