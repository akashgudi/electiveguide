import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { isSpecialTopics } from "@/lib/course-id";

export interface CourseListFilters {
  department?: string;
  categories?: string[];
  professorId?: string;
  query?: string;
  recCourse?: string;
  recProf?: string;
  useful?: string;
}

export async function listCourses(filters: CourseListFilters) {
  const { department, categories = [], professorId, query, recCourse, recProf, useful } = filters;

  const reviewFilter: Prisma.ReviewWhereInput = { archivedAt: null };
  if (professorId) reviewFilter.professorId = professorId;
  if (categories.length) reviewFilter.careerCategories = { hasSome: categories };
  if (recCourse) reviewFilter.recCourse = recCourse as never;
  if (recProf) reviewFilter.recProf = recProf as never;
  if (useful) reviewFilter.useful = useful as never;
  const hasReviewFilter = Object.keys(reviewFilter).length > 1; // more than just archivedAt

  const where: Prisma.CourseWhereInput = {
    archivedAt: null,
    ...(department && { departmentId: department }),
    ...(query && {
      OR: [
        { courseHeader: { contains: query, mode: "insensitive" } },
        { courseNumber: { contains: query, mode: "insensitive" } },
        { reviews: { some: { topicTitle: { contains: query, mode: "insensitive" }, archivedAt: null } } },
      ],
    }),
    ...(hasReviewFilter && { reviews: { some: reviewFilter } }),
  };

  const courses = await prisma.course.findMany({
    where,
    include: {
      _count: { select: { reviews: { where: { archivedAt: null } } } },
      reviews: {
        where: { archivedAt: null },
        orderBy: { year: "desc" },
        take: 1,
        select: { year: true },
      },
    },
    orderBy: { courseNumber: "asc" },
  });

  return courses.map((c) => ({
    ...c,
    reviewCount: c._count.reviews,
    latestReviewYear: c.reviews[0]?.year ?? null,
    isSpecialTopics: isSpecialTopics(c.courseNumber),
  }));
}

export async function getCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId, archivedAt: null },
  });
  if (!course) return null;
  return { ...course, isSpecialTopics: isSpecialTopics(course.courseNumber) };
}

export async function getCourseReviews(courseId: string, page: number, pageSize: number) {
  const where: Prisma.ReviewWhereInput = { courseId, archivedAt: null };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { professor: true },
      orderBy: [{ year: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);
  return { reviews, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function listCourseSummaries(courseIds: string[]) {
  if (courseIds.length === 0) return [];
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds }, archivedAt: null },
    include: { _count: { select: { reviews: { where: { archivedAt: null } } } } },
  });
  return courses.map((c) => ({
    ...c,
    reviewCount: c._count.reviews,
    isSpecialTopics: isSpecialTopics(c.courseNumber),
  }));
}
