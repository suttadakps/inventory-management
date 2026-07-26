"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { getExtractionStatusAction } from "@/lib/estimation/actions";

const POLL_MS = 4000;

/** Polls extraction status while AI processing is in flight, refreshing the
 * server component once it flips to done/error. */
export function EstimationStatusPoller({
  extractionId,
  status,
}: {
  extractionId: string;
  status: string;
}) {
  const router = useRouter();
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    if (status !== "pending" && status !== "processing") return;
    const interval = setInterval(async () => {
      const latest = await getExtractionStatusAction(extractionId);
      if (latest && latest !== statusRef.current) {
        router.refresh();
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [extractionId, status, router]);

  return (
    <div className="flex items-center gap-3 text-body-sm text-text-secondary">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-700 border-t-transparent" />
      กำลังประมวลผลด้วย AI…
    </div>
  );
}
