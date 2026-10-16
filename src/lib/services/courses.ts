import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { isSpecialTopics } from "@/lib/course-id";
import { METRICS_WINDOW_YEARS } from "@/lib/constants";

export interface CourseListFilters {
  department?: string;
  categories?: string[];
  professorId?: string;
  query?: string;
}

export async function listCourses(filters: CourseListFilters) {
  const { department, categories = [], professorId, query } = filters;

  const reviewFilter: Prisma.ReviewWhereInput = { archivedAt: null };
  if (professorId) reviewFilter.professorId = professorId;
  if (categories.length) reviewFilter.careerCategories = { hasSome: categories };
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

export interface ReviewListFilters {
  semester?: string;
  year?: number;
  professorId?: string;
  categories?: string[];
}

export async function getCourseReviews(
  courseId: string,
  page: number,
  pageSize: number,
  filters: ReviewListFilters = {}
) {
  const { semester, year, professorId, categories = [] } = filters;
  const where: Prisma.ReviewWhereInput = {
    courseId,
    archivedAt: null,
    ...(semester && { semester: semester as never }),
    ...(year && { year }),
    ...(professorId && { professorId }),
    ...(categories.length && { careerCategories: { hasSome: categories } }),
  };
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

export async function getCourseMetrics(courseId: string) {
  const sinceYear = new Date().getFullYear() - METRICS_WINDOW_YEARS + 1;
  const reviews = await prisma.review.findMany({
    where: { courseId, archivedAt: null, year: { gte: sinceYear } },
    select: { recCourse: true, useful: true },
  });

  // Percent of reviews that answered "Yes", out of those that answered at all.
  function percentYes(values: (string | null)[]) {
    const answered = values.filter((v) => v != null);
    if (answered.length === 0) return null;
    return Math.round((answered.filter((v) => v === "Yes").length / answered.length) * 100);
  }

  return {
    sinceYear,
    reviewCount: reviews.length,
    recommendPct: percentYes(reviews.map((r) => r.recCourse)),
    usefulPct: percentYes(reviews.map((r) => r.useful)),
  };
}

export async function getCourseReviewFilterOptions(courseId: string) {
  const reviews = await prisma.review.findMany({
    where: { courseId, archivedAt: null },
    select: {
      semester: true,
      year: true,
      careerCategories: true,
      professor: { select: { id: true, name: true } },
    },
  });

  const semesters = new Set<string>();
  const years = new Set<number>();
  const categories = new Set<string>();
  const professors = new Map<string, string>();

  for (const r of reviews) {
    semesters.add(r.semester);
    years.add(r.year);
    for (const c of r.careerCategories) categories.add(c);
    if (r.professor) professors.set(r.professor.id, r.professor.name);
  }

  return {
    semesters: [...semesters].sort(),
    years: [...years].sort((a, b) => b - a),
    categories: [...categories].sort(),
    professors: [...professors.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
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
