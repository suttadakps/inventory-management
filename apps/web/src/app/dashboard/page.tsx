import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/session";
import { roleLabel } from "@/lib/auth/roles";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Dashboard · ARTIVERGES NEXT" };

/**
 * Placeholder protected landing. It exists only to prove that session
 * management + RBAC work end to end (a signed-in user reaches it; others are
 * redirected to /login by the middleware/requireUser).
 *
 * The real role-aware Dashboard module (docs/01_PRD.md §6.1) is NOT implemented
 * yet — only Authentication is in scope for this change.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="text-h3 font-bold text-primary-700">
            ARTIVERGES <span className="text-accent-600">NEXT</span>
          </div>
          <form action={logout}>
            <Button type="submit" variant="secondary" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-h1 font-bold text-text-primary">
          Welcome{user.fullName ? `, ${user.fullName}` : ""}
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          You are signed in. This is a placeholder landing page — feature
          modules are not built yet.
        </p>

        <dl className="mt-6 grid max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-surface p-4 shadow-1">
            <dt className="text-caption font-medium uppercase tracking-wide text-text-secondary">
              Signed in as
            </dt>
            <dd className="mt-1 text-body text-text-primary">{user.email}</dd>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 shadow-1">
            <dt className="text-caption font-medium uppercase tracking-wide text-text-secondary">
              Role
            </dt>
            <dd className="mt-1 text-body text-text-primary">
              {roleLabel(user.role)}
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}
