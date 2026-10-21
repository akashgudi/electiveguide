import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof createClient> | undefined;
}

function createClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.POSTGRES_PRISMA_URL!,
  });
  return new PrismaClient({
    adapter,
    // Reviewer contact info is admin-only. Omitted from every query by default
    // (including nested includes); admin queries opt back in with
    // `omit: { reviewerName: false, reviewerEmail: false }`.
    omit: { review: { reviewerName: true, reviewerEmail: true } },
  });
}

export const prisma = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
