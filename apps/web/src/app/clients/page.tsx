import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { canManageClients } from "@/lib/clients/permissions";
import { listClients, DEFAULT_PAGE_SIZE } from "@/lib/clients/repository";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = { title: "Clients · ARTIVERGES NEXT" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const q = sp.q?.trim() || undefined;
  const includeArchived = sp.archived === "1";
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const result = await listClients({
    q,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    includeArchived,
  });
  const canManage = canManageClients(user.role);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (includeArchived) params.set("archived", "1");
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/clients?${qs}` : "/clients";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Clients</h1>
          <p className="text-body-sm text-text-secondary">
            {result.total} {result.total === 1 ? "client" : "clients"}
            {includeArchived ? " (including archived)" : ""}
          </p>
        </div>
        {canManage && (
          <Link
            href="/clients/new"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-primary-600 px-4 text-body font-medium text-white hover:bg-primary-700"
          >
            New client
          </Link>
        )}
      </div>

      {/* Search (server-driven GET form; resets to page 1) */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
      >
        <div className="min-w-48 flex-1 space-y-1.5">
          <label htmlFor="q" className="text-body-sm font-medium">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Company, contact, email, or tax ID"
          />
        </div>
        <label className="flex h-10 items-center gap-2 text-body-sm text-text-secondary">
          <input
            type="checkbox"
            name="archived"
            value="1"
            defaultChecked={includeArchived}
            className="h-4 w-4 rounded-sm border-border text-primary-600"
          />
          Show archived
        </label>
        <button
          type="submit"
          className="h-10 rounded-sm border border-border bg-surface px-4 text-body-sm font-medium text-text-primary hover:bg-primary-100"
        >
          Search
        </button>
      </form>

      <ClientsTable items={result.items} />

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
        hrefFor={hrefFor}
      />
    </div>
  );
}
