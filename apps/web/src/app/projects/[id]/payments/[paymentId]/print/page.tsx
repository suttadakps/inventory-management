import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getProjectPaymentReceipt } from "@/lib/projects/repository";
import { PaymentReceiptDocument } from "@/components/projects/PaymentReceiptDocument";

export const metadata: Metadata = { title: "ใบเสร็จรับเงิน · ARTIVERGES NEXT" };

export default async function PaymentReceiptPrintPage({
  params,
}: {
  params: Promise<{ id: string; paymentId: string }>;
}) {
  const user = await requireUser();
  const { id, paymentId } = await params;

  const receipt = await getProjectPaymentReceipt(user, paymentId, id);
  if (!receipt) notFound();

  return <PaymentReceiptDocument receipt={receipt} />;
}
