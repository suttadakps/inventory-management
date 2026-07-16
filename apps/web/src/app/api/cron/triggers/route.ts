import { NextResponse } from "next/server";

import { listDueTriggers, markTriggerSent } from "@/lib/projects/repository";
import { sendLineMessage } from "@/lib/line/client";

/**
 * Runs daily (see apps/web/vercel.json) to push due project triggers to LINE.
 * Secured with CRON_SECRET: Vercel sends it automatically as a bearer token for
 * its own cron invocations. If the secret is not configured, the endpoint is
 * closed (503) — secure by default, matching the referrals intake route.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "cron not configured" },
      { status: 503 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const due = await listDueTriggers(new Date());
  let sent = 0;
  let failed = 0;
  for (const trigger of due) {
    try {
      await sendLineMessage(`[${trigger.projectName}] ${trigger.message}`);
      await markTriggerSent(trigger.id);
      sent += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
