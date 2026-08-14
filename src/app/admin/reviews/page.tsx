import Link from "next/link";
import { listReviewsAdmin } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminActionButton } from "@/components/admin/action-button";
import { archiveReviewAction, unarchiveReviewAction } from "@/actions/admin";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const includeArchived = sp.archived === "1";
  const { items, total, totalPages } = await listReviewsAdmin(page, includeArchived);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Reviews ({total})</h2>
        <Button size="sm" variant="outline" nativeButton={false}
            render={<Link href={`?archived=${includeArchived ? "0" : "1"}`} />}>
          {includeArchived ? "Hide archived" : "Show archived"}
        </Button>
      </div>

      <div className="divide-y divide-border border border-border">
        {items.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <Link href={`/admin/reviews/${r.id}`} className="font-medium hover:underline">
                #{r.id} — {r.topicTitle}
              </Link>
              <p className="text-xs text-muted-foreground">
                {r.course.courseNumber} · {r.professor?.name ?? "no professor"} · {r.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {r.archivedAt && <Badge variant="secondary">Archived</Badge>}
              {r.archivedAt ? (
                <AdminActionButton label="Unarchive" onRun={unarchiveReviewAction.bind(null, r.id)} />
              ) : (
                <AdminActionButton
                  label="Archive"
                  variant="destructive"
                  confirmMessage={`Archive review #${r.id}?`}
                  onRun={archiveReviewAction.bind(null, r.id)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            nativeButton={false}
            render={<Link href={`?page=${page - 1}${includeArchived ? "&archived=1" : ""}`} />}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            nativeButton={false}
            render={<Link href={`?page=${page + 1}${includeArchived ? "&archived=1" : ""}`} />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
