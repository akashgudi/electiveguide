import { cookies } from "next/headers";
import { CourseListSkeleton, CourseRowsSkeleton } from "@/components/skeletons/course-card-skeleton";
import { COURSE_VIEW_COOKIE, parseCourseView } from "@/lib/course-view";

export default async function Loading() {
  const view = parseCourseView((await cookies()).get(COURSE_VIEW_COOKIE)?.value);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse bg-muted" />
        <div className="h-4 w-24 animate-pulse bg-muted" />
      </div>
      {view === "list" ? <CourseRowsSkeleton /> : <CourseListSkeleton />}
    </div>
  );
}
