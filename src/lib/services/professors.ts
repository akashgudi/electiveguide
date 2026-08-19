import { prisma } from "@/lib/prisma";

export async function listProfessors() {
  return prisma.professor.findMany({
    where: { archivedAt: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { reviews: true } } },
  });
}

export async function getProfessor(id: string) {
  return prisma.professor.findUnique({ where: { id, archivedAt: null } });
}
