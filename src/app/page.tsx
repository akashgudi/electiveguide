import { listCourses } from "@/lib/services/courses";
import { listProfessors } from "@/lib/services/professors";
import { CourseCard } from "@/components/course/course-card";
import { CourseFilters } from "@/components/course/course-filters";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);

  const [courses, professors] = await Promise.all([
    listCourses({
      department: get("dept"),
      categories: get("cat")?.split(",").filter(Boolean),
      professorId: get("prof"),
      query: get("q"),
      recCourse: get("recCourse"),
      recProf: get("recProf"),
      useful: get("useful"),
    }),
    listProfessors(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Course Reviews</h1>
        <p className="text-sm text-muted-foreground">
          {courses.length} course{courses.length === 1 ? "" : "s"} found
        </p>
      </div>

      <CourseFilters professors={professors.map((p) => ({ id: p.id, name: p.name }))} />

      {courses.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No courses match those filters. Try clearing a filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                department: course.departmentId,
                courseNumber: course.courseNumber,
                courseHeader: course.courseHeader,
                reviewCount: course.reviewCount,
                latestReviewYear: course.latestReviewYear,
                verified: course.verified,
                isSpecialTopics: course.isSpecialTopics,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
