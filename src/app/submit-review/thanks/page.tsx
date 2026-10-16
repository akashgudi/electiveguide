import Link from "next/link";
import { getCourse } from "@/lib/services/courses";
import { Button } from "@/components/ui/button";
import { courseHref } from "@/lib/course-href";

export default async function SubmitReviewThanksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const courseId = typeof sp.course === "string" ? sp.course : undefined;
  // Only link back if students can actually see the course (a brand-new course stays hidden until approved).
  const course = courseId ? await getCourse(courseId) : null;

  return (
    <div className="mx-auto max-w-xl space-y-6 py-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Thanks for your review!</h1>
        <p className="text-sm text-muted-foreground">
          Your review has been submitted and will appear once an admin approves it.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {course && (
          <Button variant="outline" nativeButton={false} render={<Link href={courseHref(course.id)} />}>
            Back to {course.courseNumber}
          </Button>
        )}
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          Browse courses
        </Button>
        <Button nativeButton={false} render={<Link href="/submit-review" />}>
          Submit another review
        </Button>
      </div>
    </div>
  );
}
