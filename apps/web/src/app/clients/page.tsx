import type { Metadata } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { canManageClients } from "@/lib/clients/permissions";
import { listClients, DEFAULT_PAGE_SIZE } from "@/lib/clients/repository";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = { title: "ลูกค้า · ARTIVERGES NEXT" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const result = await listClients({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const canManage = canManageClients(user.role);

  const hrefFor = (p: number) => (p > 1 ? `/clients?page=${p}` : "/clients");

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Link
            href="/clients/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            + เพิ่มลูกค้าใหม่
          </Link>
        </div>
      )}

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
