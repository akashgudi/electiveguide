import Link from "next/link";
import { Archive, Download, X } from "lucide-react";
import { listReviewsAdmin } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminActionButton } from "@/components/admin/action-button";
import { AdminSearch } from "@/components/admin/admin-search";
import { ANSWER_TONE } from "@/components/review/review-card";
import { archiveReviewAction, unarchiveReviewAction } from "@/actions/admin";

const REVIEW_STATUSES = ["Pending", "Approved", "Denied"] as const;

const STATUS_TONE = {
  Pending: ANSWER_TONE.Maybe,
  Approved: ANSWER_TONE.Yes,
  Denied: ANSWER_TONE.No,
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const includeArchived = sp.archived === "1";
  const query = typeof sp.q === "string" ? sp.q : undefined;
  const status = REVIEW_STATUSES.find((s) => s === sp.status);
  // Denied reviews are always archived, so that filter has to include archived ones.
  const { items, total, totalPages } = await listReviewsAdmin(
    page,
    includeArchived || status === "Denied",
    query,
    status,
  );
  const pageSuffix = `${includeArchived ? "&archived=1" : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}${status ? `&status=${status}` : ""}`;

  // Every filter link keeps the other filters and resets to page 1.
  function filterHref(overrides: { status?: string | null; archived?: boolean; q?: string | null }) {
    const params = new URLSearchParams();
    const nextArchived = overrides.archived ?? includeArchived;
    const nextQuery = overrides.q === undefined ? query : overrides.q;
    const nextStatus = overrides.status === undefined ? status : overrides.status;
    if (nextArchived) params.set("archived", "1");
    if (nextQuery) params.set("q", nextQuery);
    if (nextStatus) params.set("status", nextStatus);
    return `?${params.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (includeArchived) exportParams.set("archived", "1");
  if (query) exportParams.set("q", query);
  if (status) exportParams.set("status", status);

  const hasFilters = !!(query || status || includeArchived);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Reviews ({total})</h2>
        {/* Plain <a>, not Link, so the browser downloads the file instead of client-navigating. */}
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<a href={`/admin/reviews/export?${exportParams.toString()}`} />}
        >
          <Download className="size-4" />
          Export Current View to CSV
        </Button>
      </div>

      <div className="flex flex-col gap-3 border border-border bg-muted/30 p-3 lg:flex-row lg:items-center">
        {/* Keyed on the query so the box resets when filters are cleared. */}
        <AdminSearch key={query ?? ""} placeholder="Search title, comments, course, professor, reviewer..." className="max-w-none lg:flex-1" />

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-border bg-background p-0.5" role="group" aria-label="Status">
            {[undefined, ...REVIEW_STATUSES].map((s) => (
              <Button
                key={s ?? "all"}
                size="sm"
                variant={status === s ? "default" : "ghost"}
                aria-pressed={status === s}
                nativeButton={false}
                render={<Link href={filterHref({ status: s ?? null })} />}
              >
                {s ?? "All"}
              </Button>
            ))}
          </div>

          {status === "Denied" ? (
            // Denied reviews are always archived, so the toggle doesn't apply.
            <Button size="sm" variant="outline" disabled title="Denied reviews are always archived">
              <Archive className="size-4" />
              Includes archived
            </Button>
          ) : (
            <Button
              size="sm"
              variant={includeArchived ? "secondary" : "outline"}
              aria-pressed={includeArchived}
              nativeButton={false}
              render={<Link href={filterHref({ archived: !includeArchived })} />}
            >
              <Archive className="size-4" />
              {includeArchived ? "Including archived" : "Include archived"}
            </Button>
          )}

          {hasFilters && (
            <Button size="sm" variant="ghost" nativeButton={false} render={<Link href="?" />}>
              <X className="size-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-border border border-border">
        {items.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 p-3"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/reviews/${r.id}`}
                  className="font-medium hover:underline"
                >
                  #{r.id} — {r.topicTitle}
                </Link>
                <Badge variant="outline" className={STATUS_TONE[r.status]}>
                  {r.status}
                </Badge>
                {r.archivedAt && <Badge variant="secondary">Archived</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {r.course.courseNumber} · {r.professor?.name ?? "no professor"}{" "}
                · {r.year}
              </p>
              {(r.reviewerName || r.reviewerEmail) && (
                <p className="text-xs text-muted-foreground">
                  {r.reviewerName ?? "No name"}
                  {r.reviewerEmail && (
                    <>
                      {" · "}
                      <a
                        href={`mailto:${r.reviewerEmail}`}
                        className="hover:underline"
                      >
                        {r.reviewerEmail}
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {r.archivedAt ? (
                <AdminActionButton
                  label={r.status === "Denied" ? "Approve" : "Unarchive"}
                  onRun={unarchiveReviewAction.bind(null, r.id)}
                />
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
