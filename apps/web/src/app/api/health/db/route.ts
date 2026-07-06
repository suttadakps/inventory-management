import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

/**
 * Lightweight DB connectivity probe. Returns whether Prisma can reach the
 * database. Exposes no data beyond a row count and, on failure, the Prisma
 * error name/message (never the connection string). Used to diagnose
 * environment/connection issues in deployed environments.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.count();
    return NextResponse.json({ ok: true, projects });
  } catch (err) {
    const e = err as { name?: string; message?: string; code?: string };
    return NextResponse.json(
      {
        ok: false,
        name: e.name ?? "Error",
        code: e.code ?? null,
        // Redact any credentials that might appear in a URL, then return full text.
        message: (e.message ?? "")
          .replace(/\/\/[^@\s]*@/g, "//REDACTED@")
          .replace(/\s+/g, " ")
          .slice(0, 800),
        dbUrlPrefix: (process.env.DATABASE_URL ?? "<undefined>").slice(0, 12),
        dbUrlLen: (process.env.DATABASE_URL ?? "").length,
      },
      { status: 500 }
    );
  }
}
