import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageVat } from "@/lib/vat/permissions";
import { getVatFiling } from "@/lib/vat/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { VatFilingForm } from "@/components/vat/VatFilingForm";
import { DeleteVatButton } from "@/components/vat/DeleteVatButton";
import type { VatFormInput } from "@/lib/vat/actions";

export const metadata: Metadata = { title: "ภ.พ.30 · ARTIVERGES NEXT" };

const MONTHS_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export default async function VatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!canManageVat(user.role)) notFound();

  const { id } = await params;
  const filing = await getVatFiling(id);
  if (!filing) notFound();

  const initial: VatFormInput = {
    periodYear: String(filing.periodYear),
    periodMonth: String(filing.periodMonth),
    payerTaxId: filing.payerTaxId ?? "",
    salesTotal: String(filing.salesTotal),
    salesVat: String(filing.salesVat),
    purchaseTotal: String(filing.purchaseTotal),
    purchaseVat: String(filing.purchaseVat),
    overpaidPrior: String(filing.overpaidPrior),
    filedDate: filing.filedDate ? filing.filedDate.slice(0, 10) : "",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/vat"
          className="text-body-sm text-text-secondary hover:underline"
        >
          ← กลับไปหน้า ภ.พ.30
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/vat/${id}/print`}
            target="_blank"
            className="inline-flex h-9 items-center rounded-md border border-primary-700 px-3 text-body-sm font-medium text-primary-700 hover:bg-primary-100"
          >
            พิมพ์ / Print
          </Link>
          <DeleteVatButton id={id} />
        </div>
      </div>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          {MONTHS_TH[filing.periodMonth - 1]} {filing.periodYear}
        </h2>
        <VatFilingForm mode="edit" filingId={id} initial={initial} />
      </ContentCard>
    </div>
  );
}
