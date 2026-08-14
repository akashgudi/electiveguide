import { ReviewListSkeleton } from "@/components/skeletons/review-card-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-16 animate-pulse bg-muted" />
        <div className="h-8 w-96 animate-pulse bg-muted" />
      </div>
      <ReviewListSkeleton />
    </div>
  );
}
