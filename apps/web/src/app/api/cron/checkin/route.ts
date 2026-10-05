import { NextResponse } from "next/server";

import {
  listActiveProjectsForRollCall,
  listCheckinWorkers,
  setLastRollCall,
} from "@/lib/attendance/repository";
import { sendLineCheckinMessage } from "@/lib/line/client";

/**
 * Pushes a worker roll-call to LINE for every project currently under
 * construction (status started/active). Secured with CRON_SECRET the same
 * way as the triggers cron.
 *
 * No longer on a schedule — the daily 09:00 Bangkok send was switched off at
 * the owner's request. Re-enable by adding this path back to the `crons` array
 * in BOTH vercel.json files (the repo root one supplies `regions`, the
 * apps/web one supplies `crons`, since that is the project's root directory).
 * Roll-calls are now sent only on demand, from a project page's
 * "ส่งเช็คชื่อไปไลน์" button.
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

  const dateStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
  });
  const date = new Date(`${dateStr}T00:00:00Z`);

  const [projects, workers] = await Promise.all([
    listActiveProjectsForRollCall(),
    listCheckinWorkers(),
  ]);

  let sent = 0;
  let failed = 0;
  if (workers.length > 0) {
    for (const project of projects) {
      try {
        await sendLineCheckinMessage(project, dateStr, workers);
        await setLastRollCall(project.id, project.name, date);
        sent += 1;
      } catch {
        failed += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
