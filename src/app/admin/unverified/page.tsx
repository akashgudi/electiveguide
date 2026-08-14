import { getUnverifiedQueue } from "@/lib/services/stats";
import { AdminActionButton } from "@/components/admin/action-button";
import { verifyCourseAction, archiveCourseAction, verifyProfessorAction, archiveProfessorAction } from "@/actions/admin";
import { courseHref } from "@/lib/course-href";
import Link from "next/link";

export default async function UnverifiedQueuePage() {
  const { courses, professors } = await getUnverifiedQueue();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-medium">Unverified courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing pending.</p>
        ) : (
          <div className="divide-y divide-border border border-border">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 p-3">
                <div>
                  <Link href={courseHref(c.id)} className="font-medium hover:underline">
                    {c.courseHeader}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.departmentId}</p>
                </div>
                <div className="flex gap-2">
                  <AdminActionButton label="Verify" onRun={verifyCourseAction.bind(null, c.id)} />
                  <AdminActionButton
                    label="Archive"
                    variant="destructive"
                    confirmMessage={`Archive course "${c.courseHeader}"? It can be restored later from the courses list.`}
                    onRun={archiveCourseAction.bind(null, c.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Unverified professors ({professors.length})</h2>
        {professors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing pending.</p>
        ) : (
          <div className="divide-y divide-border border border-border">
            {professors.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 p-3">
                <span className="font-medium">{p.name}</span>
                <div className="flex gap-2">
                  <AdminActionButton label="Verify" onRun={verifyProfessorAction.bind(null, p.id)} />
                  <AdminActionButton
                    label="Archive"
                    variant="destructive"
                    confirmMessage={`Archive professor "${p.name}"? It can be restored later from the professors list.`}
                    onRun={archiveProfessorAction.bind(null, p.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
