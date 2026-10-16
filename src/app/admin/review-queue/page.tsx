import { getNextPendingReview, countPendingReviews } from "@/lib/services/admin";
import { ReviewQueueCard } from "@/components/admin/review-queue-card";

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default async function ReviewQueuePage() {
  const [review, pending] = await Promise.all([getNextPendingReview(), countPendingReviews()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-medium">Review queue</h2>
        <p className="text-sm text-muted-foreground">
          {pending} pending{pending > 0 && " · oldest first"}
        </p>
      </div>

      {review ? (
        // Keyed by id so the card's local state resets for each new review.
        <ReviewQueueCard
          key={review.id}
          review={{
            id: review.id,
            courseHeader: review.course.courseHeader,
            courseIsNew: !review.course.verified,
            professorName: review.professor?.name ?? review.professorRaw,
            professorIsNew: !!review.professor && !review.professor.verified,
            semester: review.semester,
            year: review.year,
            units: review.units,
            recCourse: review.recCourse,
            recProf: review.recProf,
            useful: review.useful,
            careerCategories: review.careerCategories,
            comments: review.comments,
            topicTitle: review.topicTitle,
            submittedAgo: timeAgo(review.createdAt),
          }}
        />
      ) : (
        <p className="border border-border py-16 text-center text-sm text-muted-foreground">
          All caught up — no reviews waiting.
        </p>
      )}
    </div>
  );
}
