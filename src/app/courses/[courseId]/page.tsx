import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getCourseReviews } from "@/lib/services/courses";
import { ReviewCard } from "@/components/review/review-card";
import { BinButton } from "@/components/bin/bin-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REVIEWS_PAGE_SIZE } from "@/lib/constants";
import { courseHref } from "@/lib/course-href";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { courseId: encoded } = await params;
  const courseId = decodeURIComponent(encoded);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const course = await getCourse(courseId);
  if (!course) notFound();

  const { reviews, total, totalPages } = await getCourseReviews(courseId, page, REVIEWS_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs tracking-wide text-muted-foreground uppercase">{course.departmentId}</span>
          <h1 className="text-2xl font-semibold">{course.courseHeader}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {course.currentUnits != null && <Badge variant="outline">{course.currentUnits} units</Badge>}
            {course.unitsChanged && <Badge variant="outline">Units changed over time</Badge>}
            {!course.verified && <Badge variant="destructive">Unverified — pending admin review</Badge>}
            {course.isSpecialTopics && (
              <Badge variant="secondary">Special Topics — title varies each offering</Badge>
            )}
          </div>
        </div>
        <BinButton courseId={course.id} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {total} review{total === 1 ? "" : "s"}
        </h2>
        <Button
          size="sm"
          nativeButton={false}
            render={<Link href={`/submit-review?courseId=${encodeURIComponent(course.id)}`} />}
        >
          Write a review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet — be the first.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} showTopicTitle={course.isSpecialTopics} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            nativeButton={false}
            render={<Link href={`${courseHref(course.id)}?page=${page - 1}`} scroll={false} />}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            nativeButton={false}
            render={<Link href={`${courseHref(course.id)}?page=${page + 1}`} scroll={false} />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
