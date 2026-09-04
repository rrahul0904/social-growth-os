"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

const navigation: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/dashboard", label: "Command Center", icon: "grid" },
  { href: "/agent", label: "Growth Agent", icon: "spark" },
  { href: "/workflows", label: "Workflows", icon: "flow" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/library", label: "Library", icon: "image" },
  { href: "/analytics", label: "Analytics", icon: "chart" },
  { href: "/integrations", label: "Integrations", icon: "plug" },
];

function initials(label: string) {
  return label.split(/[@\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "GO";
}

export function AppShell({ children, workspaceName, role, userLabel, demo }: { children: ReactNode; workspaceName: string; role: string; userLabel: string; demo: boolean }) {
  const pathname = usePathname();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand-mark"><span className="brand-glyph">G</span><span><strong>GrowthOS</strong><small>Autonomous social growth</small></span></Link>
        <nav className="nav-list" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} className={active ? "nav-item active" : "nav-item"}><Icon name={item.icon} width={18} height={18}/><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="autonomy-card"><div className="autonomy-title"><span className="live-dot"/>Autonomy guarded</div><p>Agent can plan and draft. Publishing still requires a persisted approval.</p></div>
          <Link href="/settings" className={pathname === "/settings" ? "nav-item active" : "nav-item"}><Icon name="settings" width={18} height={18}/><span>Settings</span></Link>
          {!demo ? <form action="/auth/signout" method="post"><button className="nav-item shell-signout" type="submit"><span>Sign out</span></button></form> : null}
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div><span className="eyebrow">Workspace · {role}</span><strong>{workspaceName}</strong></div>
          <div className="topbar-actions"><span className="environment-pill"><span className="live-dot"/> {demo ? "Demo data" : "Live workspace"}</span><div className="avatar" title={userLabel}>{initials(userLabel)}</div></div>
        </header>
        <div className="page-wrap">{children}</div>
      </main>
    </div>
  );
}
