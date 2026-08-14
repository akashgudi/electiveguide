"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateCourseAction } from "@/actions/admin";

export function CourseEditForm({
  course,
}: {
  course: { id: string; courseHeader: string; currentUnits: number | null; departmentId: string };
}) {
  const router = useRouter();
  const [courseHeader, setCourseHeader] = useState(course.courseHeader);
  const [currentUnits, setCurrentUnits] = useState(course.currentUnits?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateCourseAction(course.id, {
            courseHeader,
            currentUnits: currentUnits ? Number(currentUnits) : null,
          });
          setSaved(true);
          router.refresh();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label>Course header</Label>
        <Input value={courseHeader} onChange={(e) => setCourseHeader(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Department</Label>
        <Input value={course.departmentId} disabled />
        <p className="text-xs text-muted-foreground">
          Department reassignment isn&apos;t supported here since the course ID encodes it — archive and resubmit
          under the new department if it&apos;s truly miscategorized.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Current units</Label>
        <Input type="number" step="0.5" value={currentUnits} onChange={(e) => setCurrentUnits(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        {saved && !isPending && <span className="text-sm text-muted-foreground">Saved.</span>}
      </div>
    </form>
  );
}
