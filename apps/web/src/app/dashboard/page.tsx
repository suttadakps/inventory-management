import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard · ARTIVERGES NEXT" };

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-primary-600 bg-primary-50"
          : "border-border bg-surface"
      }`}
    >
      <div className="text-caption font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </div>
      <div
        className={`mt-2 text-h2 font-bold tabular-nums ${
          accent ? "text-primary-700" : "text-text-primary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function num(d: any): number {
  if (!d) return 0;
  if (typeof d === "number") return d;
  if (typeof d === "string") return parseFloat(d);
  if (d.toNumber) return d.toNumber();
  return 0;
}

export default async function DashboardPage() {
  const user = await requireUser();

  // Fetch aggregated stats
  const [
    totalProjects,
    activeProjects,
    totalClients,
    totalQuotations,
    approvedQuotations,
    totalContracts,
    signedContracts,
    totalBudget,
  ] = await Promise.all([
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.project.count({
      where: { deletedAt: null, status: "active" },
    }),
    prisma.client.count({ where: { deletedAt: null } }),
    prisma.quotation.count({ where: { deletedAt: null } }),
    prisma.quotation.count({
      where: { status: "approved", deletedAt: null },
    }),
    prisma.contract.count({ where: { deletedAt: null } }),
    prisma.contract.count({
      where: { status: "signed", deletedAt: null },
    }),
    prisma.project.aggregate({
      where: { deletedAt: null },
      _sum: { budgetCost: true },
    }),
  ]);

  const budget = totalBudget._sum.budgetCost ? num(totalBudget._sum.budgetCost) : 0;

  // Recent projects
  const recentProjects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      code: true,
      name: true,
      status: true,
      client: { select: { name: true } },
    },
  });

  // Recent quotations
  const recentQuotations = await prisma.quotation.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      quotationNo: true,
      status: true,
      total: true,
      project: { select: { name: true } },
    },
  });

  // Recent contracts
  const recentContracts = await prisma.contract.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      contractNo: true,
      status: true,
      value: true,
      project: { select: { name: true } },
    },
  });

  const statusColor: Record<string, string> = {
    active: "bg-success/10 text-success",
    completed: "bg-neutral/10 text-neutral",
    on_hold: "bg-warning/10 text-warning",
    cancelled: "bg-danger/10 text-danger",
    draft: "bg-neutral/10 text-neutral",
    sent: "bg-info/10 text-info",
    approved: "bg-success/10 text-success",
    signed: "bg-success/10 text-success",
    pending_approval: "bg-warning/10 text-warning",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-text-primary">
          Welcome back, {user.fullName || user.email}
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total projects" value={totalProjects} />
        <StatCard label="Active projects" value={activeProjects} accent />
        <StatCard label="Total clients" value={totalClients} />
        <StatCard label="Total budget" value={formatMoney(budget, true)} />
      </div>

      {/* Commercial overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Quotations" value={totalQuotations} />
        <StatCard label="Approved" value={approvedQuotations} accent />
        <StatCard label="Pending" value={totalQuotations - approvedQuotations} />
      </div>

      {/* Contracts overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total contracts" value={totalContracts} />
        <StatCard label="Signed" value={signedContracts} accent />
        <StatCard
          label="In progress"
          value={totalContracts - signedContracts}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent projects */}
        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h3 font-semibold text-text-primary">
              Recent projects
            </h2>
            <Link
              href="/projects"
              className="text-caption font-medium text-primary-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-body-sm text-text-secondary">No projects yet</p>
          ) : (
            <ul className="space-y-3">
              {recentProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-start justify-between gap-2 hover:underline"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-text-primary">
                        {p.name}
                      </div>
                      <div className="text-caption text-text-secondary">
                        {p.client.name}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-sm px-2 py-1 text-caption font-medium capitalize ${
                        statusColor[p.status] || "bg-neutral/10"
                      }`}
                    >
                      {p.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent quotations */}
        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h3 font-semibold text-text-primary">
              Recent quotations
            </h2>
            <Link
              href="/projects"
              className="text-caption font-medium text-primary-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentQuotations.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              No quotations yet
            </p>
          ) : (
            <ul className="space-y-3">
              {recentQuotations.map((q) => (
                <li
                  key={q.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-text-primary">
                      {q.quotationNo}
                    </div>
                    <div className="text-caption text-text-secondary">
                      {q.project.name}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-body-sm text-text-primary">
                      {formatMoney(num(q.total), true)}
                    </div>
                    <span
                      className={`text-caption font-medium capitalize ${
                        statusColor[q.status] || "bg-neutral/10"
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent contracts */}
        <section className="rounded-lg border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h3 font-semibold text-text-primary">
              Recent contracts
            </h2>
            <Link
              href="/contracts"
              className="text-caption font-medium text-primary-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {recentContracts.length === 0 ? (
            <p className="text-body-sm text-text-secondary">
              No contracts yet
            </p>
          ) : (
            <ul className="space-y-3">
              {recentContracts.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-text-primary">
                      {c.contractNo}
                    </div>
                    <div className="text-caption text-text-secondary">
                      {c.project.name}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-body-sm text-text-primary">
                      {formatMoney(num(c.value), true)}
                    </div>
                    <span
                      className={`text-caption font-medium capitalize ${
                        statusColor[c.status] || "bg-neutral/10"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-h3 font-semibold text-text-primary">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/projects/new"
            className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-center font-medium text-primary-700 hover:bg-primary-100"
          >
            New project
          </Link>
          <Link
            href="/clients/new"
            className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-center font-medium text-primary-700 hover:bg-primary-100"
          >
            New client
          </Link>
          <Link
            href="/projects"
            className="rounded-lg border border-border bg-surface px-4 py-3 text-center font-medium text-text-primary hover:bg-primary-100"
          >
            Browse projects
          </Link>
          <Link
            href="/contracts"
            className="rounded-lg border border-border bg-surface px-4 py-3 text-center font-medium text-text-primary hover:bg-primary-100"
          >
            Browse contracts
          </Link>
        </div>
      </section>
    </div>
  );
}
