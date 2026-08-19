import Link from "next/link";
import { listCoursesAdmin } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { AdminActionButton } from "@/components/admin/action-button";
import { AdminSearch } from "@/components/admin/admin-search";
import { verifyCourseAction, archiveCourseAction, unarchiveCourseAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const includeArchived = sp.archived === "1";
  const query = typeof sp.q === "string" ? sp.q : undefined;
  const { items, total, totalPages } = await listCoursesAdmin(page, includeArchived, query);
  const pageSuffix = `${includeArchived ? "&archived=1" : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Courses ({total})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AdminSearch placeholder="Search courses..." />
          <Button size="sm" variant="outline" nativeButton={false}
            render={<Link href="/admin/courses/merge" />}>
            Merge duplicates
          </Button>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`?archived=${includeArchived ? "0" : "1"}${query ? `&q=${encodeURIComponent(query)}` : ""}`} />}
          >
            {includeArchived ? "Hide archived" : "Show archived"}
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border border border-border">
        {items.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <Link href={`/admin/courses/${encodeURIComponent(c.id)}`} className="font-medium hover:underline">
                {c.courseHeader}
              </Link>
              <p className="text-xs text-muted-foreground">
                {c.departmentId} · {c._count.reviews} review{c._count.reviews === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!c.verified && <Badge variant="warning">Unverified</Badge>}
              {c.archivedAt && <Badge variant="secondary">Archived</Badge>}
              {!c.verified && !c.archivedAt && <AdminActionButton label="Verify" onRun={verifyCourseAction.bind(null, c.id)} />}
              {c.archivedAt ? (
                <AdminActionButton label="Unarchive" onRun={unarchiveCourseAction.bind(null, c.id)} />
              ) : (
                <AdminActionButton
                  label="Archive"
                  variant="destructive"
                  confirmMessage={`Archive "${c.courseHeader}"?`}
                  onRun={archiveCourseAction.bind(null, c.id)}
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
