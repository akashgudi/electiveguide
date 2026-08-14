import { CourseListSkeleton } from "@/components/skeletons/course-card-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse bg-muted" />
        <div className="h-4 w-24 animate-pulse bg-muted" />
      </div>
      <CourseListSkeleton />
    </div>
  );
}
