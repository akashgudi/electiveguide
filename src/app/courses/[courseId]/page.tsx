import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getCourseReviews, getCourseReviewFilterOptions, getCourseMetrics } from "@/lib/services/courses";
import { ReviewCard } from "@/components/review/review-card";
import { ReviewFilters } from "@/components/review/review-filters";
import { BinButton } from "@/components/bin/bin-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REVIEWS_PAGE_SIZE } from "@/lib/constants";
import { courseHref } from "@/lib/course-href";
import { cn } from "@/lib/utils";

// Green above 60%, yellow 40–60%, red below 40%.
function metricTone(pct: number | null) {
  if (pct == null) return "ring-foreground/10";
  if (pct > 60) return "bg-green-500/10 text-green-700 ring-green-500/30 dark:text-green-400";
  if (pct >= 40) return "bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-400";
  return "bg-red-500/10 text-red-700 ring-red-500/30 dark:text-red-400";
}

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
  const get = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);
  const page = Math.max(1, Number(sp.page) || 1);

  const course = await getCourse(courseId);
  if (!course) notFound();

  const hasActiveFilters = ["semester", "year", "rprof"].some((k) =>
    get(k)
  );

  const [{ reviews, total, totalPages }, filterOptions, metrics] = await Promise.all([
    getCourseReviews(courseId, page, REVIEWS_PAGE_SIZE, {
      semester: get("semester"),
      years: get("year")?.split(",").map(Number).filter(Number.isInteger),
      professorIds: get("rprof")?.split(",").filter(Boolean),
    }),
    getCourseReviewFilterOptions(courseId),
    getCourseMetrics(courseId),
  ]);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (typeof value === "string" && key !== "page") params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${courseHref(course!.id)}?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs tracking-wide text-muted-foreground uppercase">{course.departmentId}</span>
          <h1 className="text-2xl font-semibold">{course.courseHeader}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {course.currentUnits != null && <Badge variant="outline">{course.currentUnits} units</Badge>}
            {course.unitsChanged && <Badge variant="outline">Units changed over time</Badge>}
            {!course.verified && <Badge variant="warning">Unverified — pending admin review</Badge>}
            {course.isSpecialTopics && (
              <Badge variant="secondary">Special Topics — title varies each offering</Badge>
            )}
          </div>
        </div>
        <BinButton courseId={course.id} />
      </div>

      {metrics.reviewCount > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            {[
              { label: "Recommend this course", value: metrics.recommendPct },
              { label: "Found it useful", value: metrics.usefulPct },
            ].map((m) => (
              <div key={m.label} className={cn("rounded-xl px-4 py-3 ring-1", metricTone(m.value))}>
                <div className="text-2xl font-semibold tabular-nums">{m.value == null ? "—" : `${m.value}%`}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on {metrics.reviewCount} review{metrics.reviewCount === 1 ? "" : "s"} since {metrics.sinceYear}
          </p>
        </div>
      )}

      {metrics.reviewCount === 0 && filterOptions.years.length > 0 && (
        <div className="rounded-xl px-4 py-3 text-sm text-muted-foreground ring-1 ring-foreground/10 sm:max-w-md">
          <span className="font-medium text-foreground">No recent reviews.</span> Nothing since {metrics.sinceYear} — the
          latest is from {filterOptions.years[0]}, so it may not reflect the course today.
        </div>
      )}

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

      <ReviewFilters options={filterOptions} />

      {reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {hasActiveFilters ? "No reviews match those filters." : "No reviews yet — be the first."}
        </p>
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
            render={<Link href={pageHref(page - 1)} scroll={false} />}
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
            render={<Link href={pageHref(page + 1)} scroll={false} />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
