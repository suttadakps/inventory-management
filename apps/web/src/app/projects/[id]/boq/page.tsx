import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageBoq } from "@/lib/boq/permissions";
import { listBoqsForProject } from "@/lib/boq/repository";
import {
  createBoqAction,
  duplicateBoqAction,
  newVersionBoqAction,
} from "@/lib/boq/actions";
import { BoqStatusBadge } from "@/components/boq/BoqStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatMoney, formatPct } from "@/lib/format";

export const metadata: Metadata = { title: "BOQs · ARTIVERGES NEXT" };

export default async function ProjectBoqListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id: projectId } = await params;

  const data = await listBoqsForProject(user, projectId);
  if (!data) notFound();

  const canManage = canManageBoq(user.role);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← {data.project.name}
        </Link>
        <h1 className="mt-1 text-h1 font-bold text-text-primary">
          Bills of Quantities
        </h1>
        <p className="font-mono text-body-sm text-text-secondary">
          {data.project.code} · {data.project.clientName}
        </p>
      </div>

      {canManage && (
        <form
          action={createBoqAction}
          className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <div className="min-w-56 flex-1 space-y-1.5">
            <label htmlFor="title" className="text-body-sm font-medium">
              New BOQ title
            </label>
            <Input id="title" name="title" placeholder="e.g. Main BOQ" />
          </div>
          <Button type="submit">Create BOQ</Button>
        </form>
      )}

      {data.boqs.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-body-sm text-text-secondary">
          No BOQs yet for this project.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-border bg-bg text-caption uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium">BOQ</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                  Cost
                </th>
                <th className="px-4 py-3 text-right font-medium">Selling</th>
                <th className="hidden px-4 py-3 text-right font-medium md:table-cell">
                  Margin
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.boqs.map((b) => (
                <tr key={b.id} className="hover:bg-primary-100/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${projectId}/boq/${b.id}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {b.title ?? `BOQ v${b.version}`}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-caption text-text-secondary">
                      <span>v{b.version}</span>
                      {b.isLatest && <Badge tone="info">Latest</Badge>}
                      <span>· {b.totals.itemCount} items</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <BoqStatusBadge status={b.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-text-secondary sm:table-cell">
                    {formatMoney(b.totals.costTotal, true)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-text-primary">
                    {formatMoney(b.totals.sellingTotal, true)}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-text-primary md:table-cell">
                    {formatPct(b.totals.marginPct)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects/${projectId}/boq/${b.id}`}
                        className="text-body-sm font-medium text-primary-600 hover:underline"
                      >
                        Open
                      </Link>
                      {canManage && (
                        <>
                          <form action={duplicateBoqAction}>
                            <input type="hidden" name="boqId" value={b.id} />
                            <button
                              type="submit"
                              className="text-body-sm text-text-secondary hover:underline"
                            >
                              Duplicate
                            </button>
                          </form>
                          <form action={newVersionBoqAction}>
                            <input type="hidden" name="boqId" value={b.id} />
                            <button
                              type="submit"
                              className="text-body-sm text-text-secondary hover:underline"
                            >
                              New version
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
