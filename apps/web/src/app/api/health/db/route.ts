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
        message: (e.message ?? "").split("\n").slice(0, 4).join(" ").slice(0, 300),
      },
      { status: 500 }
    );
  }
}
