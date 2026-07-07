import { NextResponse } from "next/server";

import { createReferral } from "@/lib/referrals/repository";

/**
 * Public referral intake for the company website.
 * Secured with a shared secret: set REFERRAL_INTAKE_TOKEN in the environment and
 * have the website send it as the `x-intake-token` header (or `?token=`).
 * If the token is not configured, the endpoint is closed (503) — secure by default.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expected = process.env.REFERRAL_INTAKE_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "intake not configured" },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const provided =
    req.headers.get("x-intake-token") ?? url.searchParams.get("token") ?? "";
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const str = (v: unknown) =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
  const referrerName = str(body.referrerName ?? body.referrer_name);
  const projectTitle = str(body.projectTitle ?? body.project_title);
  if (!referrerName || !projectTitle) {
    return NextResponse.json(
      { ok: false, error: "referrerName and projectTitle are required" },
      { status: 400 }
    );
  }
  const budgetRaw = body.budget;
  const budget =
    typeof budgetRaw === "number"
      ? budgetRaw
      : typeof budgetRaw === "string" && budgetRaw.trim() !== ""
        ? Number(budgetRaw)
        : undefined;

  const id = await createReferral({
    referrerName,
    referrerContact: str(body.referrerContact ?? body.referrer_contact),
    projectTitle,
    details: str(body.details),
    prospectName: str(body.prospectName ?? body.prospect_name),
    budget: budget && budget > 0 ? budget : undefined,
    source: "website",
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
