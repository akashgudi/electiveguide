import { cookies } from "next/headers";
import { listCourses } from "@/lib/services/courses";
import { listProfessors } from "@/lib/services/professors";
import { CourseFilters } from "@/components/course/course-filters";
import { CourseResults, CourseViewProvider, CourseViewToggle } from "@/components/course/course-view";
import { COURSE_VIEW_COOKIE, parseCourseView } from "@/lib/course-view";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);

  const [courses, professors, cookieStore] = await Promise.all([
    listCourses({
      department: get("dept"),
      professorIds: get("prof")?.split(",").filter(Boolean),
      query: get("q"),
    }),
    listProfessors(),
    cookies(),
  ]);

  return (
    <CourseViewProvider initialView={parseCourseView(cookieStore.get(COURSE_VIEW_COOKIE)?.value)}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Course Reviews</h1>
            <p className="text-sm text-muted-foreground">
              {courses.length} course{courses.length === 1 ? "" : "s"} found
            </p>
          </div>
          <CourseViewToggle />
        </div>

        <CourseFilters professors={professors.map((p) => ({ id: p.id, name: p.name }))} />

        {courses.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No courses match those filters. Try clearing a filter.
          </p>
        ) : (
          <CourseResults
            courses={courses.map((course) => ({
              id: course.id,
              department: course.departmentId,
              courseNumber: course.courseNumber,
              courseHeader: course.courseHeader,
              reviewCount: course.reviewCount,
              latestReviewYear: course.latestReviewYear,
              verified: course.verified,
              isSpecialTopics: course.isSpecialTopics,
            }))}
          />
        )}
      </div>
    </CourseViewProvider>
  );
}
