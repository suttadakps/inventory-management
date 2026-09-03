import crypto from "crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  markTriggerDone,
  getProjectTrigger,
  addStatusHistoryEntry,
} from "@/lib/projects/repository";
import {
  toggleAttendance,
  getAttendanceContext,
  getLastRollCall,
  addCheckinWorker,
  ensurePresent,
  markNoWorkDay,
  getProjectName,
} from "@/lib/attendance/repository";
import {
  getOldestPendingReceipt,
  matchProjectsByName,
  resolvePendingReceipt,
  createPendingReceipt,
  uploadReceiptImage,
} from "@/lib/receipts/repository";
import { extractReceiptFromImage } from "@/lib/receipts/extract";
import { replyLineMessage, downloadLineContent } from "@/lib/line/client";
import { formatDateBkk } from "@/lib/format";

/**
 * Real LINE Messaging API webhook. Handles: a "done" postback from a trigger
 * reminder's button (see sendLineTriggerMessage in lib/line/client.ts); a
 * "checkin" postback from a worker roll-call button and a "nowork" postback
 * from the roll-call's "หยุดงาน" button (see sendLineCheckinMessage); a
 * plain-text "เพิ่มคนงาน <ชื่อ>" message — LINE buttons can't accept free
 * typing, so a name not already on the roster is added by typing that
 * command, applied to whichever project's roll-call went out most recently
 * today (see attendance/repository's RollCallState); a photo message, which
 * gets AI-read as an expense receipt and held as a PendingReceipt; and a
 * plain-text project name, which — if a receipt is waiting — resolves it into
 * a real Expense (see lib/receipts). LINE images carry no caption field, so
 * the project name always arrives as a separate message right after.
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
  message?: { type: string; id?: string; text?: string };
};

const ADD_WORKER_RE = /^เพิ่มคนงาน\s+(.+)$/;

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
    if (event.type === "message" && event.message?.type === "text") {
      const text = event.message.text?.trim() ?? "";
      const match = ADD_WORKER_RE.exec(text);

      if (match) {
        const name = (match[1] ?? "").trim();
        if (!name) continue;

        try {
          const todayStr = new Date().toLocaleDateString("en-CA", {
            timeZone: "Asia/Bangkok",
          });
          const last = await getLastRollCall(todayStr);
          if (!last) {
            if (event.replyToken) {
              await replyLineMessage(
                event.replyToken,
                `ยังไม่มีการส่งเช็คชื่อวันนี้ กรุณากด "ส่งเช็คชื่อไปไลน์" จากหน้าเว็บโปรเจคก่อน`
              );
            }
            continue;
          }

          const worker = await addCheckinWorker(name);
          const date = new Date(`${last.date}T00:00:00Z`);
          const added = await ensurePresent(last.projectId, worker.id, date, null);
          revalidatePath(`/projects/${last.projectId}`);
          revalidatePath("/wages");
          if (event.replyToken) {
            await replyLineMessage(
              event.replyToken,
              added
                ? `✅ เพิ่ม ${worker.name} เข้าหน้างาน ${last.projectName} (${last.date})`
                : `${worker.name} เข้าหน้างาน ${last.projectName} (${last.date}) อยู่แล้ว`
            );
          }
        } catch {
          // Best-effort: a failed reply/update here shouldn't fail the whole batch.
        }
        continue;
      }

      // Not a เพิ่มคนงาน command — if a receipt photo is waiting for its
      // project, treat this text as naming it.
      try {
        const pending = await getOldestPendingReceipt();
        if (pending) {
          const matches = await matchProjectsByName(text);
          if (matches.length === 1) {
            const project = matches[0]!;
            const resolved = await resolvePendingReceipt(pending.id, project);
            revalidatePath("/costs");
            revalidatePath(`/projects/${project.id}`);
            if (event.replyToken) {
              await replyLineMessage(
                event.replyToken,
                `✅ บันทึกค่าใช้จ่าย ${resolved.amount.toLocaleString("th-TH")} บาท เข้าโปรเจค ${resolved.projectName} แล้ว`
              );
            }
          } else if (matches.length > 1) {
            if (event.replyToken) {
              await replyLineMessage(
                event.replyToken,
                `เจอหลายโปรเจคที่ตรงกับ "${text}": ${matches.map((m) => m.name).join(", ")} — พิมพ์ชื่อให้ชัดเจนขึ้นอีกครั้ง`
              );
            }
          }
          // 0 matches — not a recognised project name, ignore silently.
        }
      } catch {
        // Best-effort.
      }
      continue;
    }

    if (event.type === "message" && event.message?.type === "image") {
      const messageId = event.message.id;
      if (!messageId) continue;

      try {
        const { buffer, contentType } = await downloadLineContent(messageId);
        const { storagePath } = await uploadReceiptImage(buffer, contentType);

        let extracted = {
          amount: null as number | null,
          vendor: null as string | null,
          description: null as string | null,
          date: null as string | null,
        };
        try {
          extracted = await extractReceiptFromImage({
            base64: buffer.toString("base64"),
            mimeType: contentType,
          });
        } catch {
          // AI reading is best-effort — still record the pending receipt.
        }

        await createPendingReceipt({
          storagePath,
          amount: extracted.amount,
          vendor: extracted.vendor,
          description: extracted.description,
          incurredAt: extracted.date ? new Date(`${extracted.date}T00:00:00Z`) : null,
        });

        if (event.replyToken) {
          const amountText =
            extracted.amount != null
              ? `${extracted.amount.toLocaleString("th-TH")} บาท`
              : "ไม่พบยอดเงินในรูป";
          await replyLineMessage(
            event.replyToken,
            `ได้รับสลิปแล้ว — ${amountText}${extracted.vendor ? ` (${extracted.vendor})` : ""}\nพิมพ์ชื่อโปรเจคเพื่อบันทึกเข้าระบบ`
          );
        }
      } catch {
        if (event.replyToken) {
          await replyLineMessage(
            event.replyToken,
            "อ่านสลิปไม่สำเร็จ กรุณาลองส่งใหม่อีกครั้ง"
          ).catch(() => {});
        }
      }
      continue;
    }

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
        revalidatePath("/wages");
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

    if (action === "nowork") {
      const projectId = params.get("project");
      const date = params.get("date");
      if (!projectId || !date) continue;

      try {
        const projectName = await getProjectName(projectId);
        if (!projectName) continue;

        await markNoWorkDay(projectId, new Date(`${date}T00:00:00Z`), null);
        revalidatePath(`/projects/${projectId}`);
        revalidatePath("/wages");
        if (event.replyToken) {
          await replyLineMessage(
            event.replyToken,
            `บันทึกว่าหยุดงาน — ${projectName} (${date})`
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
