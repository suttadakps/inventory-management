import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { getBoqFlat } from "@/lib/boq/repository";
import { BoqPrintDocument } from "@/components/boq/BoqPrintDocument";

export const metadata: Metadata = { title: "BOQ — Print · ARTIVERGES NEXT" };

export default async function StandaloneBoqPrintPage({
  params,
}: {
  params: Promise<{ boqId: string }>;
}) {
  const user = await requireUser();
  const { boqId } = await params;

  const doc = await getBoqFlat(user, boqId);
  if (!doc) notFound();

  return <BoqPrintDocument doc={doc} />;
}
