import { NextResponse } from "next/server";

/**
 * TEMPORARY — used once to discover the target LINE group's ID. Point the
 * Messaging API channel's Webhook URL at this route, send any message in the
 * target group, then read the logged `source.groupId` from Vercel logs.
 * Delete this route once LINE_GROUP_ID has been captured.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  // console.error surfaces reliably in Vercel's runtime log search, unlike
  // console.log which is often dropped from indexed results.
  console.error("[line-debug-webhook] raw body:", raw);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const events =
    body && typeof body === "object" && Array.isArray((body as { events?: unknown }).events)
      ? (body as { events: unknown[] }).events
      : [];

  console.error(`[line-debug-webhook] ${events.length} event(s)`);
  for (const event of events) {
    console.error("[line-debug-webhook] event:", JSON.stringify(event));
  }

  // LINE requires a fast 200 response regardless of content.
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
