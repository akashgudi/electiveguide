import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { isSpecialTopics } from "@/lib/course-id";
import { METRICS_WINDOW_YEARS } from "@/lib/constants";
import { PUBLIC_REVIEW } from "@/lib/review-visibility";
import { levenshtein } from "@/lib/fuzzy-match";

export interface CourseListFilters {
  department?: string;
  categories?: string[];
  professorIds?: string[];
  query?: string;
}

// A course students can see: not archived, and either verified or carrying at
// least one approved review (so a course added by a still-pending review stays hidden).
export const PUBLIC_COURSE = {
  archivedAt: null,
  AND: [{ OR: [{ verified: true }, { reviews: { some: PUBLIC_REVIEW } }] }],
} satisfies Prisma.CourseWhereInput;

/**
 * Splits a search into loose terms: lowercased, punctuation dropped, and
 * glued course codes split apart ("acct505" -> "acct", "505").
 */
function searchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .split(" ")
    .filter(Boolean);
}

/**
 * How well one search term matches a set of words: 1 for a substring hit
 * (prefix-only for 1-2 character terms, which would otherwise hit almost
 * everything), 0.5 for a near-miss typo, 0 otherwise. Typos are allowed only
 * on letter terms of 4+ characters (1 edit, 2 from 8 chars) so course
 * numbers like "505" never loosely match "506". Comparing against the
 * word's same-length prefix lets a half-typed word with a typo still hit.
 */
function termScore(term: string, words: string[]): number {
  const short = term.length < 3;
  if (words.some((w) => (short ? w.startsWith(term) : w.includes(term)))) return 1;
  if (term.length < 4 || /\d/.test(term)) return 0;
  const maxEdits = term.length >= 8 ? 2 : 1;
  const nearMiss = words.some(
    (w) => Math.min(levenshtein(term, w), levenshtein(term, w.slice(0, term.length))) <= maxEdits
  );
  return nearMiss ? 0.5 : 0;
}

export async function listCourses(filters: CourseListFilters) {
  const { department, categories = [], professorIds = [], query } = filters;

  const reviewFilter: Prisma.ReviewWhereInput = { ...PUBLIC_REVIEW };
  if (professorIds.length) reviewFilter.professorId = { in: professorIds };
  if (categories.length) reviewFilter.careerCategories = { hasSome: categories };
  const hasReviewFilter = Object.keys(reviewFilter).length > Object.keys(PUBLIC_REVIEW).length;

  const where: Prisma.CourseWhereInput = {
    ...PUBLIC_COURSE,
    ...(department && { departmentId: department }),
    ...(hasReviewFilter && { reviews: { some: reviewFilter } }),
  };

  const courses = await prisma.course.findMany({
    where,
    include: {
      _count: { select: { reviews: { where: PUBLIC_REVIEW } } },
      reviews: {
        where: PUBLIC_REVIEW,
        orderBy: { year: "desc" },
        take: 1,
        select: { year: true },
      },
    },
    orderBy: { courseNumber: "asc" },
  });

  const results = courses.map((c) => ({
    ...c,
    reviewCount: c._count.reviews,
    latestReviewYear: c.reviews[0]?.year ?? null,
    isSpecialTopics: isSpecialTopics(c.courseNumber),
  }));

  const terms = query ? searchTerms(query) : [];
  if (!terms.length) return results;

  // Text search runs here rather than in SQL so it can tolerate typos and
  // rank results: a course shows if any term matches, best matches first.
  const topics = await prisma.review.findMany({
    where: { ...PUBLIC_REVIEW, courseId: { in: results.map((c) => c.id) } },
    select: { courseId: true, topicTitle: true },
    distinct: ["courseId", "topicTitle"],
  });
  const topicsByCourse = new Map<string, string[]>();
  for (const t of topics) {
    const list = topicsByCourse.get(t.courseId);
    if (list) list.push(t.topicTitle);
    else topicsByCourse.set(t.courseId, [t.topicTitle]);
  }

  return results
    .map((c) => {
      const words = searchTerms([c.courseHeader, c.courseNumber, ...(topicsByCourse.get(c.id) ?? [])].join(" "));
      const score = terms.reduce((sum, term) => sum + termScore(term, words), 0);
      return { course: c, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score) // stable, so ties keep course-number order
    .map((r) => r.course);
}

export async function getCourse(courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, ...PUBLIC_COURSE },
  });
  if (!course) return null;
  return { ...course, isSpecialTopics: isSpecialTopics(course.courseNumber) };
}

export interface ReviewListFilters {
  semester?: string;
  years?: number[];
  professorIds?: string[];
  categories?: string[];
}

export async function getCourseReviews(
  courseId: string,
  page: number,
  pageSize: number,
  filters: ReviewListFilters = {}
) {
  const { semester, years = [], professorIds = [], categories = [] } = filters;
  const where: Prisma.ReviewWhereInput = {
    courseId,
    ...PUBLIC_REVIEW,
    ...(semester && { semester: semester as never }),
    ...(years.length && { year: { in: years } }),
    ...(professorIds.length && { professorId: { in: professorIds } }),
    ...(categories.length && { careerCategories: { hasSome: categories } }),
  };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { professor: true },
      omit: { reviewerName: true, reviewerEmail: true }, // never sent to public pages
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
    where: { courseId, ...PUBLIC_REVIEW, year: { gte: sinceYear } },
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
    where: { courseId, ...PUBLIC_REVIEW },
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
    where: { id: { in: courseIds }, ...PUBLIC_COURSE },
    include: { _count: { select: { reviews: { where: PUBLIC_REVIEW } } } },
  });
  return courses.map((c) => ({
    ...c,
    reviewCount: c._count.reviews,
    isSpecialTopics: isSpecialTopics(c.courseNumber),
  }));
}
