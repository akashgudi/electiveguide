import { prisma } from "@/lib/prisma";
import { PUBLIC_REVIEW } from "@/lib/review-visibility";

export async function listProfessors() {
  return prisma.professor.findMany({
    where: { archivedAt: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { reviews: { where: PUBLIC_REVIEW } } } },
  });
}

export async function getProfessor(id: string) {
  return prisma.professor.findUnique({ where: { id, archivedAt: null } });
}
