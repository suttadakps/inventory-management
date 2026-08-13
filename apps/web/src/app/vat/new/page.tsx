import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageVat } from "@/lib/vat/permissions";
import { computeVatTotals } from "@/lib/vat/repository";
import { ContentCard } from "@/components/ui/ContentCard";
import { VatFilingForm } from "@/components/vat/VatFilingForm";
import type { VatFormInput } from "@/lib/vat/actions";

export const metadata: Metadata = { title: "สร้างแบบ ภ.พ.30 · ARTIVERGES NEXT" };

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

export default async function VatNewPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const user = await requireUser();
  if (!canManageVat(user.role)) notFound();

  const sp = await searchParams;
  const now = new Date();
  const year = Number(sp.year) || now.getFullYear();
  const month = Number(sp.month) || now.getMonth() + 1;

  const totals = await computeVatTotals(year, month);

  const initial: VatFormInput = {
    periodYear: String(year),
    periodMonth: String(month),
    payerTaxId: "",
    salesTotal: String(totals.salesTotal),
    salesVat: String(totals.salesVat),
    purchaseTotal: String(totals.purchaseTotal),
    purchaseVat: String(totals.purchaseVat),
    overpaidPrior: "0",
    filedDate: now.toISOString().slice(0, 10),
  };

  return (
    <div className="space-y-5">
      <Link
        href="/vat"
        className="text-body-sm text-text-secondary hover:underline"
      >
        ← กลับไปหน้า ภ.พ.30
      </Link>

      <ContentCard className="p-6">
        <h2 className="mb-4 text-h2 font-bold text-text-primary">
          สร้างแบบ ภ.พ.30 — {MONTHS_TH[month - 1]} {year}
        </h2>
        <VatFilingForm
          mode="create"
          initial={initial}
          sourceNote="ยอดขาย/ยอดซื้อดึงจากรายการรับเงินและบันทึกต้นทุนที่ติ๊ก “มี VAT” ในเดือนนี้โดยอัตโนมัติ — ตรวจสอบและแก้ไขก่อนบันทึกได้"
        />
      </ContentCard>
    </div>
  );
}
