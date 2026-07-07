import { unstable_cache } from "next/cache";
import type { Prisma } from "@artiverges/database";

import { prisma } from "@/lib/db";

/**
 * Dashboard data layer. All reads here are global aggregates (not scoped to
 * the viewing user — every internal user sees the same company-wide numbers),
 * so they're safe to cache without a per-user key. Wrapped in unstable_cache
 * with a short revalidate window: the values only need to be "fresh within a
 * few seconds," not real-time, and caching avoids re-running the same
 * aggregate/count queries on every dashboard view/navigation. The period
 * (from/to) is part of the cache key, so each selected range gets its own
 * cached entry.
 *
 * Query shape favors DB-side aggregation (count/aggregate + bounded, sorted,
 * select-pruned findMany) over fetching full row sets and filtering/slicing
 * in JS, so cost stays flat as the projects table grows.
 */

export type DashboardRange = { from?: Date; to?: Date };

const num = (d: unknown): number => {
  if (!d) return 0;
  if (typeof d === "number") return d;
  if (typeof d === "string") return parseFloat(d);
  if (typeof d === "object" && d !== null && "toNumber" in d) {
    return (d as { toNumber: () => number }).toNumber();
  }
  return 0;
};

/** Inclusive [from, to] date filter, end-of-day on `to` so the selected day
 * is fully included. Undefined on both ends means "no filter" (all-time). */
function dateFilter(
  fromISO: string | null,
  toISO: string | null
): { gte?: Date; lte?: Date } | undefined {
  if (!fromISO && !toISO) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (fromISO) filter.gte = new Date(fromISO);
  if (toISO) {
    const end = new Date(toISO);
    end.setHours(23, 59, 59, 999);
    filter.lte = end;
  }
  return filter;
}

function upcomingDeadlineWindow() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in14 = new Date(todayStart.getTime() + 14 * 86_400_000);
  return { todayStart, in14 };
}

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
  /** Whether deadlineCount/list mean "due within the selected period" (a range
   * is active) or the default "due in the next 14 days" (no range selected). */
  deadlineIsPeriodScoped: boolean;
};

async function loadKpis(
  fromISO: string | null,
  toISO: string | null
): Promise<DashboardKpis> {
  const range = dateFilter(fromISO, toISO);
  const projectCreatedFilter = range ? { createdAt: range } : {};

  let deadlineWhere: Prisma.ProjectWhereInput;
  let deadlineIsPeriodScoped: boolean;
  if (range) {
    // A period is selected: "deadline" becomes "due within that period".
    deadlineWhere = {
      deletedAt: null,
      status: { notIn: ["completed", "closed"] },
      endDate: range,
    };
    deadlineIsPeriodScoped = true;
  } else {
    // No period selected: default rolling "due in the next 14 days" view.
    const { todayStart, in14 } = upcomingDeadlineWindow();
    deadlineWhere = {
      deletedAt: null,
      status: { notIn: ["completed", "closed"] },
      endDate: { gte: todayStart, lte: in14 },
    };
    deadlineIsPeriodScoped = false;
  }

  const [projectCount, inProgress, deadlineCount, projAgg, salesAgg, receivedAgg] =
    await Promise.all([
      prisma.project.count({ where: { deletedAt: null, ...projectCreatedFilter } }),
      prisma.project.count({
        where: { deletedAt: null, status: "active", ...projectCreatedFilter },
      }),
      prisma.project.count({ where: deadlineWhere }),
      prisma.project.aggregate({
        where: { deletedAt: null, ...projectCreatedFilter },
        _sum: { contractValue: true, actualCost: true },
      }),
      prisma.contract.aggregate({
        where: {
          deletedAt: null,
          status: { in: ["approved", "signed", "completed"] },
          ...(range ? { createdAt: range } : {}),
        },
        _sum: { value: true },
      }),
      prisma.payment.aggregate({
        where: {
          direction: "incoming",
          ...(range ? { paidAt: range } : {}),
        },
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
    deadlineIsPeriodScoped,
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

async function loadLists(
  fromISO: string | null,
  toISO: string | null
): Promise<DashboardLists> {
  const range = dateFilter(fromISO, toISO);
  const projectCreatedFilter = range ? { createdAt: range } : {};

  const deadlineDateFilter = range
    ? range
    : (() => {
        const { todayStart, in14 } = upcomingDeadlineWindow();
        return { gte: todayStart, lte: in14 };
      })();

  // Only the fields actually rendered (name/client/status/progress, or
  // name/endDate) are selected; both lists are bounded and DB-sorted so
  // sizing/ordering never depends on fetching+filtering the full table.
  const [ongoingRows, deadlineRows] = await Promise.all([
    prisma.project.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ["completed", "closed"] },
        ...projectCreatedFilter,
      },
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
        endDate: deadlineDateFilter,
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

// 30s revalidate per (from, to) pair: numbers stay effectively live while
// collapsing repeat views of the same period onto one shared cached read.
const cachedLoadKpis = unstable_cache(loadKpis, ["dashboard-kpis"], {
  revalidate: 30,
});
const cachedLoadLists = unstable_cache(loadLists, ["dashboard-lists"], {
  revalidate: 30,
});

function isoOrNull(d: Date | undefined): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

export function getDashboardKpis(range: DashboardRange = {}) {
  return cachedLoadKpis(isoOrNull(range.from), isoOrNull(range.to));
}

export function getDashboardLists(range: DashboardRange = {}) {
  return cachedLoadLists(isoOrNull(range.from), isoOrNull(range.to));
}
