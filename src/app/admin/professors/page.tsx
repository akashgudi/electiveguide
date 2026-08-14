import Link from "next/link";
import { listProfessorsAdmin } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminActionButton } from "@/components/admin/action-button";
import { verifyProfessorAction, archiveProfessorAction, unarchiveProfessorAction } from "@/actions/admin";

export default async function AdminProfessorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const includeArchived = sp.archived === "1";
  const { items, total, totalPages } = await listProfessorsAdmin(page, includeArchived);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Professors ({total})</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" nativeButton={false}
            render={<Link href="/admin/professors/merge" />}>
            Merge duplicates
          </Button>
          <Button size="sm" variant="outline" nativeButton={false}
            render={<Link href={`?archived=${includeArchived ? "0" : "1"}`} />}>
            {includeArchived ? "Hide archived" : "Show archived"}
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border border border-border">
        {items.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <Link href={`/admin/professors/${p.id}`} className="font-medium hover:underline">
                {p.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {p._count.reviews} review{p._count.reviews === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!p.verified && <Badge variant="destructive">Unverified</Badge>}
              {p.archivedAt && <Badge variant="secondary">Archived</Badge>}
              {!p.verified && !p.archivedAt && <AdminActionButton label="Verify" onRun={verifyProfessorAction.bind(null, p.id)} />}
              {p.archivedAt ? (
                <AdminActionButton label="Unarchive" onRun={unarchiveProfessorAction.bind(null, p.id)} />
              ) : (
                <AdminActionButton
                  label="Archive"
                  variant="destructive"
                  confirmMessage={`Archive "${p.name}"?`}
                  onRun={archiveProfessorAction.bind(null, p.id)}
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
