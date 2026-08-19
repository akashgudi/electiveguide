import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 25;

export async function listCoursesAdmin(page: number, includeArchived: boolean, query?: string) {
  const where: Prisma.CourseWhereInput = includeArchived ? {} : { archivedAt: null };
  if (query) {
    where.OR = [
      { courseHeader: { contains: query, mode: "insensitive" } },
      { courseNumber: { contains: query, mode: "insensitive" } },
      { id: { contains: query, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.course.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listProfessorsAdmin(page: number, includeArchived: boolean, query?: string) {
  const where: Prisma.ProfessorWhereInput = includeArchived ? {} : { archivedAt: null };
  if (query) {
    where.name = { contains: query, mode: "insensitive" };
  }
  const [items, total] = await Promise.all([
    prisma.professor.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.professor.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listReviewsAdmin(page: number, includeArchived: boolean, query?: string) {
  const where: Prisma.ReviewWhereInput = includeArchived ? {} : { archivedAt: null };
  if (query) {
    where.OR = [
      { topicTitle: { contains: query, mode: "insensitive" } },
      { comments: { contains: query, mode: "insensitive" } },
      { course: { courseHeader: { contains: query, mode: "insensitive" } } },
      { course: { courseNumber: { contains: query, mode: "insensitive" } } },
      { professor: { name: { contains: query, mode: "insensitive" } } },
      { professorRaw: { contains: query, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { course: true, professor: true },
    }),
    prisma.review.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function verifyCourse(id: string) {
  return prisma.course.update({ where: { id }, data: { verified: true } });
}
export async function archiveCourse(id: string) {
  return prisma.course.update({ where: { id }, data: { archivedAt: new Date() } });
}
export async function unarchiveCourse(id: string) {
  return prisma.course.update({ where: { id }, data: { archivedAt: null } });
}
export async function updateCourse(
  id: string,
  data: { courseHeader?: string; currentUnits?: number | null; departmentId?: string }
) {
  return prisma.course.update({ where: { id }, data });
}

export async function listCoursesForMerge() {
  return prisma.course.findMany({
    where: { archivedAt: null },
    orderBy: [{ departmentId: "asc" }, { courseNumber: "asc" }],
  });
}

export async function mergeCourses(sourceId: string, targetId: string) {
  if (sourceId === targetId) throw new Error("Cannot merge a course into itself");
  return prisma.$transaction(async (tx) => {
    await tx.review.updateMany({ where: { courseId: sourceId }, data: { courseId: targetId } });
    await tx.course.update({ where: { id: sourceId }, data: { archivedAt: new Date() } });
  });
}

export async function verifyProfessor(id: string) {
  return prisma.professor.update({ where: { id }, data: { verified: true } });
}
export async function archiveProfessor(id: string) {
  return prisma.professor.update({ where: { id }, data: { archivedAt: new Date() } });
}
export async function unarchiveProfessor(id: string) {
  return prisma.professor.update({ where: { id }, data: { archivedAt: null } });
}
export async function updateProfessor(id: string, data: { name?: string }) {
  return prisma.professor.update({ where: { id }, data });
}

export async function mergeProfessors(sourceId: string, targetId: string) {
  if (sourceId === targetId) throw new Error("Cannot merge a professor into itself");
  return prisma.$transaction(async (tx) => {
    await tx.review.updateMany({ where: { professorId: sourceId }, data: { professorId: targetId } });
    await tx.professor.update({ where: { id: sourceId }, data: { archivedAt: new Date() } });
  });
}

export async function archiveReview(id: number) {
  return prisma.review.update({ where: { id }, data: { archivedAt: new Date() } });
}
export async function unarchiveReview(id: number) {
  return prisma.review.update({ where: { id }, data: { archivedAt: null } });
}
export async function updateReview(
  id: number,
  data: {
    comments?: string | null;
    topicTitle?: string;
    careerCategories?: string[];
  }
) {
  return prisma.review.update({ where: { id }, data });
}
