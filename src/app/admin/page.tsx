import { Suspense } from "react";
import Link from "next/link";
import { getLiveCounts, getUnverifiedQueue } from "@/lib/services/stats";
import { StatCard } from "@/components/admin/stat-card";
import { StatCardGridSkeleton } from "@/components/skeletons/stat-card-skeleton";
import { CategoryBreakdown } from "@/components/admin/category-breakdown";

async function StatCards() {
  const counts = await getLiveCounts();
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Reviews" value={counts.reviews} />
      <StatCard label="Courses" value={counts.courses} />
      <StatCard label="Professors" value={counts.professors} />
      <StatCard label="Departments" value={counts.departments} />
    </div>
  );
}

async function UnverifiedBanner() {
  const { courses, professors } = await getUnverifiedQueue();
  const total = courses.length + professors.length;
  if (total === 0) return null;
  return (
    <Link
      href="/admin/unverified"
      className="block border border-border bg-muted/50 p-4 text-sm transition-colors hover:bg-muted"
    >
      {total} item{total === 1 ? "" : "s"} awaiting verification ({courses.length} course
      {courses.length === 1 ? "" : "s"}, {professors.length} professor{professors.length === 1 ? "" : "s"}) — review
      queue →
    </Link>
  );
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<StatCardGridSkeleton />}>
        <StatCards />
      </Suspense>

      <Suspense fallback={null}>
        <UnverifiedBanner />
      </Suspense>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Career category breakdown</h2>
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <CategoryBreakdown />
        </Suspense>
      </div>
    </div>
  );
}
