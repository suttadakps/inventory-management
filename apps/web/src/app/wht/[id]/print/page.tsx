import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { canManageWht } from "@/lib/wht/permissions";
import { getWhtCertificate } from "@/lib/wht/repository";
import { WhtCertificateDocument } from "@/components/wht/WhtCertificateDocument";

export const metadata: Metadata = { title: "ใบทวิ 50 — Print · ARTIVERGES NEXT" };

export default async function WhtPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!canManageWht(user.role)) notFound();

  const { id } = await params;
  const cert = await getWhtCertificate(user, id);
  if (!cert) notFound();

  return <WhtCertificateDocument cert={cert} />;
}
