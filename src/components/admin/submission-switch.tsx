"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { setReviewSubmissionEnabledAction } from "@/actions/admin";

export function SubmissionSwitch({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(enabled);
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-4 border border-border p-4">
      <div>
        <label htmlFor="review-submissions" className="text-sm font-medium">
          Review submissions
        </label>
        <p className="text-sm text-muted-foreground">
          {optimisticEnabled
            ? "Open — students can submit new reviews."
            : "Closed — the submit form is hidden from students."}
        </p>
      </div>
      <Switch
        id="review-submissions"
        checked={optimisticEnabled}
        disabled={isPending}
        onCheckedChange={(next) => {
          if (!next && !window.confirm("Close review submissions? Students won't be able to submit new reviews.")) {
            return;
          }
          startTransition(async () => {
            setOptimisticEnabled(next);
            await setReviewSubmissionEnabledAction(next);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
