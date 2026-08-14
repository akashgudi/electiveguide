import { prisma } from "@/lib/prisma";
import { listProfessors } from "@/lib/services/professors";
import { ReviewForm } from "@/components/review/review-form";

export default async function SubmitReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const defaultCourseId = typeof sp.courseId === "string" ? sp.courseId : undefined;

  const [courses, professors] = await Promise.all([
    prisma.course.findMany({
      where: { archivedAt: null },
      select: { id: true, courseNumber: true, courseHeader: true, currentUnits: true },
      orderBy: { courseNumber: "asc" },
    }),
    listProfessors(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Submit a Review</h1>
        <p className="text-sm text-muted-foreground">
          Share your experience to help other students choose courses.
        </p>
      </div>
      <ReviewForm
        courses={courses}
        professors={professors.map((p) => ({ id: p.id, name: p.name }))}
        defaultCourseId={defaultCourseId}
      />
    </div>
  );
}
