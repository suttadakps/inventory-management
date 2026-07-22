import crypto from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  markTriggerDone,
  getProjectTrigger,
  addStatusHistoryEntry,
} from "@/lib/projects/repository";
import { replyLineMessage } from "@/lib/line/client";
import { formatDateBkk } from "@/lib/format";

/**
 * Real LINE Messaging API webhook. Currently handles one thing: a postback
 * from the "Done" button on a trigger reminder (see sendLineTriggerMessage
 * in lib/line/client.ts), which marks that trigger done and confirms in-chat.
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
    if (params.get("action") !== "done") continue;
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
            `${trigger.message} เรียบร้อยแล้ว ${formatDateBkk(trigger.doneAt)} (ทำเครื่องหมายไว้แล้ว)`
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
          `${trigger.message} เรียบร้อยแล้ว ${formatDateBkk(now)}`
        );
      }
    } catch {
      // Best-effort: a failed reply/update here shouldn't fail the whole batch.
    }
  }

  return NextResponse.json({ ok: true });
}
