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

export async function listReviewsAdmin(
  page: number,
  includeArchived: boolean,
  query?: string,
  status?: "Pending" | "Approved" | "Denied"
) {
  const where: Prisma.ReviewWhereInput = includeArchived ? {} : { archivedAt: null };
  if (status) where.status = status;
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
  const review = await prisma.review.findUniqueOrThrow({ where: { id }, select: { status: true } });
  // Restoring a denied review means overturning the denial, otherwise it would stay hidden.
  const statusData =
    review.status === "Denied"
      ? { status: "Approved" as const, moderatedAt: new Date(), reviewerName: null, reviewerEmail: null }
      : {};
  return prisma.review.update({ where: { id }, data: { archivedAt: null, ...statusData } });
}

// --- Review moderation queue ---

export async function getNextPendingReview() {
  return prisma.review.findFirst({
    where: { status: "Pending", archivedAt: null },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: { course: true, professor: true },
  });
}

export async function countPendingReviews() {
  return prisma.review.count({ where: { status: "Pending", archivedAt: null } });
}

// Accepting also verifies a new course/professor the review created.
// Returns null if the review was no longer pending (e.g. another admin got to it first).
export async function approveReview(id: number) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.review.updateMany({
      where: { id, status: "Pending" },
      // Reviewer contact is only needed while moderating; drop it once approved.
      data: { status: "Approved", moderatedAt: new Date(), reviewerName: null, reviewerEmail: null },
    });
    if (count === 0) return null;

    const review = await tx.review.findUniqueOrThrow({
      where: { id },
      include: { course: true, professor: true },
    });
    if (!review.course.verified) {
      await tx.course.update({ where: { id: review.courseId }, data: { verified: true } });
    }
    if (review.professor && !review.professor.verified) {
      await tx.professor.update({ where: { id: review.professor.id }, data: { verified: true } });
    }
    return { courseId: review.courseId };
  });
}

// Denying archives the review, plus any new course/professor it created that
// nothing else (pending or approved) still uses.
export async function denyReview(id: number) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const { count } = await tx.review.updateMany({
      where: { id, status: "Pending" },
      data: { status: "Denied", moderatedAt: now, archivedAt: now },
    });
    if (count === 0) return null;

    const review = await tx.review.findUniqueOrThrow({
      where: { id },
      include: { course: true, professor: true },
    });
    const stillUsed = { id: { not: id }, status: { not: "Denied" as const } };

    if (!review.course.verified) {
      const others = await tx.review.count({ where: { ...stillUsed, courseId: review.courseId } });
      if (others === 0) await tx.course.update({ where: { id: review.courseId }, data: { archivedAt: now } });
    }
    if (review.professor && !review.professor.verified) {
      const others = await tx.review.count({ where: { ...stillUsed, professorId: review.professor.id } });
      if (others === 0) await tx.professor.update({ where: { id: review.professor.id }, data: { archivedAt: now } });
    }
    return { courseId: review.courseId };
  });
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
