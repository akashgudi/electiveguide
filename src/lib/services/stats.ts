import { prisma } from "@/lib/prisma";
import { CAREER_CATEGORIES } from "@/lib/constants";

export async function getLiveCounts() {
  const [departments, courses, professors, reviews] = await Promise.all([
    prisma.department.count(),
    prisma.course.count({ where: { archivedAt: null } }),
    prisma.professor.count({ where: { archivedAt: null } }),
    prisma.review.count({ where: { archivedAt: null } }),
  ]);
  return { departments, courses, professors, reviews };
}

interface CategoryRow {
  category: string;
  count: bigint;
}

export async function getCategoryBreakdown() {
  const rows = await prisma.$queryRaw<CategoryRow[]>`
    SELECT unnest("careerCategories") AS category, count(*) AS count
    FROM "Review"
    WHERE "archivedAt" IS NULL
    GROUP BY category
    ORDER BY count DESC
  `;
  const counts = new Map(rows.map((r) => [r.category, Number(r.count)]));
  return CAREER_CATEGORIES.map((category) => ({
    category,
    count: counts.get(category) ?? 0,
  })).sort((a, b) => b.count - a.count);
}

export async function getUnverifiedQueue() {
  const [courses, professors] = await Promise.all([
    prisma.course.findMany({
      where: { verified: false, archivedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.professor.findMany({
      where: { verified: false, archivedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { courses, professors };
}
