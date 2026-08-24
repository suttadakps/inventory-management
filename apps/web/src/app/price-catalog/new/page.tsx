import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManagePriceCatalog } from "@/lib/price-catalog/permissions";
import { ContentCard } from "@/components/ui/ContentCard";
import { PriceCatalogForm } from "@/components/price-catalog/PriceCatalogForm";

export const metadata: Metadata = { title: "เพิ่มรายการราคากลาง · ARTIVERGES NEXT" };

export default async function PriceCatalogNewPage() {
  const user = await requireUser();
  if (!canManagePriceCatalog(user.role)) notFound();

  return (
    <div className="space-y-5">
      <Link
        href="/price-catalog"
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้าราคากลาง
      </Link>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          เพิ่มรายการราคากลาง
        </h2>
        <PriceCatalogForm mode="create" initial={{}} />
      </ContentCard>
    </div>
  );
}
