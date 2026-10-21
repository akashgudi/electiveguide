import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { courseHref } from "@/lib/course-href";
import { BinButton } from "@/components/bin/bin-button";
import type { CourseCardData } from "@/components/course/course-card";

// Shared by the header and each row so the columns line up on larger screens.
const ROW_GRID = "sm:grid sm:grid-cols-[6rem_minmax(0,1fr)_6rem_6rem_2rem] sm:items-center sm:gap-4";

function reviewLabel(count: number) {
  return `${count} review${count === 1 ? "" : "s"}`;
}

export function CourseRowHeader() {
  return (
    <div
      className={`hidden bg-muted/40 px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase ${ROW_GRID}`}
    >
      <span>Dept</span>
      <span>Course</span>
      <span>Reviews</span>
      <span>Last review</span>
      <span />
    </div>
  );
}

/** Compact course entry: one line on larger screens, two on mobile. */
export function CourseRow({ course }: { course: CourseCardData }) {
  const meta = [
    course.department,
    reviewLabel(course.reviewCount),
    course.latestReviewYear && `Last ${course.latestReviewYear}`,
    !course.verified && "Unverified",
  ].filter(Boolean);

  return (
    <Link
      href={courseHref(course.id)}
      className={`group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 ${ROW_GRID}`}
    >
      <span className="hidden truncate text-xs tracking-wide text-muted-foreground uppercase sm:block">
        {course.department}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium transition-colors group-hover:text-primary">
            {course.courseHeader}
          </span>
          {!course.verified && (
            <Badge variant="warning" className="hidden shrink-0 sm:inline-flex">
              Unverified
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">{meta.join(" · ")}</p>
      </div>

      <span className="hidden text-sm text-muted-foreground sm:block">{reviewLabel(course.reviewCount)}</span>
      <span className="hidden text-sm text-muted-foreground sm:block">{course.latestReviewYear ?? "—"}</span>
      <BinButton courseId={course.id} />
    </Link>
  );
}
