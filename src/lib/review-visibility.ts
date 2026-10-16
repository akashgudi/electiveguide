import type { Prisma } from "@/generated/prisma/client";

// A review students can see: approved by an admin and not archived.
export const PUBLIC_REVIEW = { archivedAt: null, status: "Approved" } satisfies Prisma.ReviewWhereInput;
