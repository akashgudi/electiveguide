import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { courseHref } from "@/lib/course-href";
import { BinButton } from "@/components/bin/bin-button";

export interface CourseCardData {
  id: string;
  department: string;
  courseNumber: string;
  courseHeader: string;
  reviewCount: number;
  latestReviewYear: number | null;
  verified: boolean;
  isSpecialTopics: boolean;
}

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <div className="group relative flex flex-col gap-2 border border-border p-4 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">{course.department}</span>
        <BinButton courseId={course.id} />
      </div>
      <Link href={courseHref(course.id)} className="flex flex-1 flex-col gap-1">
        <h3 className="text-base leading-snug font-semibold transition-colors group-hover:text-primary">
          {course.courseHeader}
        </h3>
        {course.isSpecialTopics && (
          <p className="text-xs text-muted-foreground">Topics vary each offering — see individual reviews</p>
        )}
      </Link>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        <Badge variant="secondary">
          {course.reviewCount} review{course.reviewCount === 1 ? "" : "s"}
        </Badge>
        {course.latestReviewYear && <Badge variant="outline">Last: {course.latestReviewYear}</Badge>}
        {!course.verified && <Badge variant="warning">Unverified</Badge>}
      </div>
    </div>
  );
}
