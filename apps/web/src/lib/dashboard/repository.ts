import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

/**
 * Dashboard data layer. All reads here are global aggregates (not scoped to
 * the viewing user — every internal user sees the same company-wide numbers),
 * so they're safe to cache without a per-user key. Wrapped in unstable_cache
 * with a short revalidate window: the values only need to be "fresh within a
 * few seconds," not real-time, and caching avoids re-running the same
 * aggregate/count queries on every dashboard view/navigation.
 *
 * Query shape favors DB-side aggregation (count/aggregate + bounded, sorted,
 * select-pruned findMany) over fetching full row sets and filtering/slicing
 * in JS, so cost stays flat as the projects table grows.
 */

const num = (d: unknown): number => {
  if (!d) return 0;
  if (typeof d === "number") return d;
  if (typeof d === "string") return parseFloat(d);
  if (typeof d === "object" && d !== null && "toNumber" in d) {
    return (d as { toNumber: () => number }).toNumber();
  }
  return 0;
};

export type DashboardKpis = {
  totalSales: number;
  projectValue: number;
  totalCost: number;
  received: number;
  outstanding: number;
  grossProfit: number;
  margin: number;
  projectCount: number;
  inProgress: number;
  deadlineCount: number;
};

function deadlineWindow() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in14 = new Date(todayStart.getTime() + 14 * 86_400_000);
  return { todayStart, in14 };
}

async function loadKpis(): Promise<DashboardKpis> {
  const { todayStart, in14 } = deadlineWindow();

  const [projectCount, inProgress, deadlineCount, projAgg, salesAgg, receivedAgg] =
    await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null, status: "active" } }),
      prisma.project.count({
        where: {
          deletedAt: null,
          status: { notIn: ["completed", "closed"] },
          endDate: { gte: todayStart, lte: in14 },
        },
      }),
      prisma.project.aggregate({
        where: { deletedAt: null },
        _sum: { contractValue: true, actualCost: true },
      }),
      prisma.contract.aggregate({
        where: {
          deletedAt: null,
          status: { in: ["approved", "signed", "completed"] },
        },
        _sum: { value: true },
      }),
      prisma.payment.aggregate({
        where: { direction: "incoming" },
        _sum: { amount: true },
      }),
    ]);

  const projectValue = num(projAgg._sum.contractValue);
  const totalCost = num(projAgg._sum.actualCost);
  // Sold value = signed/approved contracts; fall back to project pipeline value
  // when no contracts exist yet so the KPI still reflects real data.
  const contractSales = num(salesAgg._sum.value);
  const totalSales = contractSales > 0 ? contractSales : projectValue;
  const received = num(receivedAgg._sum.amount);
  const outstanding = Math.max(0, totalSales - received);
  const grossProfit = totalSales - totalCost;
  const margin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  return {
    totalSales,
    projectValue,
    totalCost,
    received,
    outstanding,
    grossProfit,
    margin,
    projectCount,
    inProgress,
    deadlineCount,
  };
}

export type DashboardOngoingRow = {
  id: string;
  name: string;
  clientName: string;
  status: string;
  progress: number;
};

export type DashboardDeadlineRow = {
  id: string;
  name: string;
  endDate: string | null;
};

export type DashboardLists = {
  ongoing: DashboardOngoingRow[];
  deadlines: DashboardDeadlineRow[];
};

async function loadLists(): Promise<DashboardLists> {
  const { todayStart, in14 } = deadlineWindow();

  // Only the fields actually rendered (name/client/status/progress, or
  // name/endDate) are selected; both lists are bounded and DB-sorted so
  // sizing/ordering never depends on fetching+filtering the full table.
  const [ongoingRows, deadlineRows] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null, status: { notIn: ["completed", "closed"] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        status: true,
        progressPct: true,
        client: { select: { name: true } },
      },
    }),
    prisma.project.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ["completed", "closed"] },
        endDate: { gte: todayStart, lte: in14 },
      },
      orderBy: { endDate: "asc" },
      take: 10,
      select: { id: true, name: true, endDate: true },
    }),
  ]);

  return {
    ongoing: ongoingRows.map((p) => ({
      id: p.id,
      name: p.name,
      clientName: p.client.name,
      status: p.status,
      progress: num(p.progressPct),
    })),
    deadlines: deadlineRows.map((p) => ({
      id: p.id,
      name: p.name,
      endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
    })),
  };
}

// 30s revalidate: numbers stay effectively live while collapsing repeat
// dashboard views/navigations onto one shared cached read.
export const getDashboardKpis = unstable_cache(loadKpis, ["dashboard-kpis"], {
  revalidate: 30,
});
export const getDashboardLists = unstable_cache(loadLists, ["dashboard-lists"], {
  revalidate: 30,
});
