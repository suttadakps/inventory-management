"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/lib/auth/actions";
import { roleLabel, type Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/clients", label: "Clients" },
];

function NavLink({
  href,
  label,
  onDark = false,
}: {
  href: string;
  label: string;
  onDark?: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  if (onDark) {
    return (
      <Link
        href={href}
        className={cn(
          "rounded-sm px-3 py-1.5 text-body-sm font-medium",
          active
            ? "bg-primary-600 text-white"
            : "text-primary-100 hover:bg-primary-600/60 hover:text-white"
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-sm px-3 py-2 text-body-sm font-medium",
        active
          ? "bg-primary-100 text-primary-700"
          : "text-text-secondary hover:bg-primary-100 hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: { email: string; fullName: string | null; role: Role };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-primary-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-h3 font-bold">
              ARTIVERGES <span className="text-accent-600">NEXT</span>
            </Link>
            {/* Mobile / inline nav */}
            <nav className="flex items-center gap-1 md:hidden">
              {NAV.map((n) => (
                <NavLink key={n.href} {...n} onDark />
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-body-sm font-medium leading-tight">
                {user.fullName ?? user.email}
              </div>
              <div className="text-caption text-primary-100">
                {roleLabel(user.role)}
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-sm border border-primary-100/40 px-3 py-1.5 text-body-sm font-medium text-white hover:bg-primary-600"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1">
            {NAV.map((n) => (
              <NavLink key={n.href} {...n} />
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
