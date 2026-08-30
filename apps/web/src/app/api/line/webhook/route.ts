import crypto from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  markTriggerDone,
  getProjectTrigger,
  addStatusHistoryEntry,
} from "@/lib/projects/repository";
import { toggleAttendance, getAttendanceContext } from "@/lib/attendance/repository";
import { replyLineMessage } from "@/lib/line/client";
import { formatDateBkk } from "@/lib/format";

/**
 * Real LINE Messaging API webhook. Handles two postback actions: "done" from
 * a trigger reminder's button (see sendLineTriggerMessage in lib/line/client.ts),
 * and "checkin" from a worker roll-call button (see sendLineCheckinMessage) —
 * both mark their state and confirm in-chat.
 *
 * Secured with LINE_CHANNEL_SECRET: LINE signs the raw request body with it
 * (HMAC-SHA256, base64) and sends the signature as x-line-signature. Closed
 * (503) if the secret isn't configured, 401 on a signature mismatch —
 * matching the closed-by-default convention used elsewhere in this app
 * (see the referrals intake route and the cron route).
 */
export const dynamic = "force-dynamic";

type LineEvent = {
  type: string;
  replyToken?: string;
  postback?: { data: string };
};

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!process.env.LINE_CHANNEL_SECRET) {
    return NextResponse.json(
      { ok: false, error: "webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get("x-line-signature"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const events =
    body && typeof body === "object" && Array.isArray((body as { events?: unknown }).events)
      ? ((body as { events: LineEvent[] }).events)
      : [];

  for (const event of events) {
    if (event.type !== "postback" || !event.postback) continue;
    const params = new URLSearchParams(event.postback.data);
    const action = params.get("action");

    if (action === "checkin") {
      const projectId = params.get("project");
      const workerId = params.get("worker");
      const date = params.get("date");
      if (!projectId || !workerId || !date) continue;

      try {
        const ctx = await getAttendanceContext(projectId, workerId);
        if (!ctx) continue;

        const present = await toggleAttendance(
          projectId,
          workerId,
          new Date(`${date}T00:00:00Z`),
          null
        );
        revalidatePath(`/projects/${projectId}`);
        if (event.replyToken) {
          await replyLineMessage(
            event.replyToken,
            present
              ? `✅ ${ctx.workerName} เข้าหน้างาน ${ctx.projectName} (${date})`
              : `ยกเลิกเช็คชื่อ ${ctx.workerName} — ${ctx.projectName} (${date})`
          );
        }
      } catch {
        // Best-effort: a failed reply/update here shouldn't fail the whole batch.
      }
      continue;
    }

    if (action !== "done") continue;
    const id = params.get("id");
    if (!id) continue;

    try {
      const trigger = await getProjectTrigger(id);
      if (!trigger) continue;

      if (trigger.doneAt) {
        // Already marked — button stays clickable forever (LINE can't edit a
        // sent message), so keep repeat taps from re-processing/re-spamming.
        if (event.replyToken) {
          await replyLineMessage(
            event.replyToken,
            `${trigger.projectName} ${trigger.message} เรียบร้อยแล้ว ${formatDateBkk(trigger.doneAt)} (ทำเครื่องหมายไว้แล้ว)`
          );
        }
        continue;
      }

      const now = new Date();
      await markTriggerDone(id, true);
      await addStatusHistoryEntry(
        trigger.projectId,
        `✅ ${trigger.message}`,
        now,
        null
      );
      revalidatePath(`/projects/${trigger.projectId}`);
      revalidatePath("/calendar");
      if (event.replyToken) {
        await replyLineMessage(
          event.replyToken,
          `${trigger.projectName} ${trigger.message} เรียบร้อยแล้ว ${formatDateBkk(now)}`
        );
      }
    } catch {
      // Best-effort: a failed reply/update here shouldn't fail the whole batch.
    }
  }

  return NextResponse.json({ ok: true });
}
