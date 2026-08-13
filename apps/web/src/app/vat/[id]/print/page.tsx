import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageVat } from "@/lib/vat/permissions";
import { getVatFiling } from "@/lib/vat/repository";
import { Pp30Document } from "@/components/vat/Pp30Document";

export const metadata: Metadata = { title: "ภ.พ.30 — Print · ARTIVERGES NEXT" };

export default async function VatPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!canManageVat(user.role)) notFound();

  const { id } = await params;
  const filing = await getVatFiling(id);
  if (!filing) notFound();

  return <Pp30Document filing={filing} />;
}
