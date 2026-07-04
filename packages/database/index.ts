/**
 * @artiverges/database — typed Prisma client for ARTIVERGES NEXT.
 *
 * A single PrismaClient instance is reused across the process (and across
 * hot-reloads in dev) to avoid exhausting database connections.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
