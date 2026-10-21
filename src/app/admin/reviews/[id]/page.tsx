import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReviewEditForm } from "@/components/admin/review-edit-form";
import { courseHref } from "@/lib/course-href";

export default async function AdminReviewEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviewId = Number(id);
  if (Number.isNaN(reviewId)) notFound();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { course: true, professor: true },
    omit: { reviewerName: false, reviewerEmail: false },
  });
  if (!review) notFound();

  return (
    <div className="space-y-4">
      <Link href={courseHref(review.courseId)} className="text-sm text-muted-foreground hover:underline">
        ← {review.course.courseHeader}
      </Link>
      <h2 className="text-lg font-medium">Edit review #{review.id}</h2>
      <p className="text-sm text-muted-foreground">
        {review.semester === "Summer_Fall" ? "Summer/Fall" : review.semester} {review.year} ·{" "}
        {review.professor?.name ?? "no professor on file"}
      </p>
      <p className="text-sm text-muted-foreground">
        Submitted by {review.reviewerName ?? "no name on file"}
        {review.reviewerEmail && (
          <>
            {" · "}
            <a href={`mailto:${review.reviewerEmail}`} className="hover:underline">
              {review.reviewerEmail}
            </a>
          </>
        )}
      </p>
      <ReviewEditForm
        review={{
          id: review.id,
          topicTitle: review.topicTitle,
          comments: review.comments,
          careerCategories: review.careerCategories,
        }}
      />
    </div>
  );
}
