import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManagePriceCatalog } from "@/lib/price-catalog/permissions";
import { getPriceCatalogItem } from "@/lib/price-catalog/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { PriceCatalogForm } from "@/components/price-catalog/PriceCatalogForm";
import { DeletePriceCatalogItemButton } from "@/components/price-catalog/DeletePriceCatalogItemButton";
import type { PriceCatalogFormInput } from "@/lib/price-catalog/actions";

export const metadata: Metadata = { title: "ราคากลาง · ARTIVERGES NEXT" };

export default async function PriceCatalogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const canManage = canManagePriceCatalog(user.role);

  const { id } = await params;
  const item = await getPriceCatalogItem(id);
  if (!item) notFound();

  const initial: Partial<PriceCatalogFormInput> = {
    name: item.name,
    unit: item.unit ?? "",
    materialCost: String(item.materialCost),
    laborCost: String(item.laborCost),
    category: item.category ?? "",
    note: item.note ?? "",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/price-catalog"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← กลับไปหน้าราคากลาง
        </Link>
        {canManage && <DeletePriceCatalogItemButton id={id} />}
      </div>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          {item.name}
        </h2>
        {canManage ? (
          <PriceCatalogForm mode="edit" itemId={id} initial={initial} />
        ) : (
          <p className="text-body-sm text-text-secondary">
            ไม่มีสิทธิ์แก้ไขรายการนี้
          </p>
        )}
      </ContentCard>
    </div>
  );
}
