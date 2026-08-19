import Link from "next/link";
import { listReviewsAdmin } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminActionButton } from "@/components/admin/action-button";
import { AdminSearch } from "@/components/admin/admin-search";
import { archiveReviewAction, unarchiveReviewAction } from "@/actions/admin";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const includeArchived = sp.archived === "1";
  const query = typeof sp.q === "string" ? sp.q : undefined;
  const { items, total, totalPages } = await listReviewsAdmin(page, includeArchived, query);
  const pageSuffix = `${includeArchived ? "&archived=1" : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Reviews ({total})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AdminSearch placeholder="Search reviews..." />
          <Button size="sm" variant="outline" nativeButton={false}
              render={<Link href={`?archived=${includeArchived ? "0" : "1"}${query ? `&q=${encodeURIComponent(query)}` : ""}`} />}>
            {includeArchived ? "Hide archived" : "Show archived"}
          </Button>
        </div>
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
            render={<Link href={`?page=${page - 1}${pageSuffix}`} />}
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
            render={<Link href={`?page=${page + 1}${pageSuffix}`} />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
