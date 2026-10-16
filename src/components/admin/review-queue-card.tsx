"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ANSWER_TONE } from "@/components/review/review-card";
import { approveReviewAction, denyReviewAction } from "@/actions/admin";
import { cn } from "@/lib/utils";

export interface QueueReview {
  id: number;
  courseHeader: string;
  courseIsNew: boolean;
  professorName: string | null;
  professorIsNew: boolean;
  semester: string;
  year: number;
  units: number | null;
  recCourse: string | null;
  recProf: string | null;
  useful: string | null;
  careerCategories: string[];
  comments: string | null;
  topicTitle: string;
  submittedAgo: string;
  reviewerName: string | null;
  reviewerEmail: string | null;
}

type Decision = "approve" | "deny";

export function ReviewQueueCard({ review }: { review: QueueReview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [decision, setDecision] = useState<Decision | null>(null);

  function decide(next: Decision) {
    if (decision) return;
    setDecision(next);
    startTransition(async () => {
      try {
        await (next === "approve" ? approveReviewAction : denyReviewAction)(review.id);
        router.refresh();
      } catch {
        setDecision(null); // bring the card back so the admin can retry
        window.alert("Couldn't save that decision. Please try again.");
      }
    });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "a") decide("approve");
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "d") decide("deny");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const answers = [
    { label: "Course", value: review.recCourse },
    { label: "Prof", value: review.recProf },
    { label: "Useful", value: review.useful },
  ];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "space-y-4 border border-border p-5 transition-all duration-300",
          decision === "approve" && "translate-x-16 rotate-2 opacity-0",
          decision === "deny" && "-translate-x-16 -rotate-2 opacity-0"
        )}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{review.courseHeader}</h3>
            {review.courseIsNew && <Badge variant="warning">New course</Badge>}
          </div>
          {review.topicTitle !== review.courseHeader && (
            <p className="text-sm">Topic: {review.topicTitle}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {review.semester === "Summer_Fall" ? "Summer/Fall" : review.semester} {review.year}
            {review.professorName && <> · {review.professorName}</>}
            {review.professorIsNew && (
              <Badge variant="warning" className="ml-1.5 align-middle">
                New professor
              </Badge>
            )}
            {review.units != null && <> · {review.units} units</>}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {answers.map(
            (a) =>
              a.value && (
                <Badge key={a.label} variant="outline" className={ANSWER_TONE[a.value]}>
                  {a.label}: {a.value}
                </Badge>
              )
          )}
        </div>

        {review.comments && <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.comments}</p>}

        {review.careerCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Career:</span>
            {review.careerCategories.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>
        )}

        <div className="border-t border-border pt-3 text-sm">
          <span className="text-xs text-muted-foreground">Submitted by: </span>
          {review.reviewerName || review.reviewerEmail ? (
            <>
              {review.reviewerName ?? "—"}
              {review.reviewerEmail && (
                <>
                  {" · "}
                  <a href={`mailto:${review.reviewerEmail}`} className="hover:underline">
                    {review.reviewerEmail}
                  </a>
                </>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">not provided</span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          #{review.id} · submitted {review.submittedAgo}
          {(review.courseIsNew || review.professorIsNew) &&
            " · accepting also verifies the new course/professor; denying archives them"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="destructive" size="lg" disabled={isPending} onClick={() => decide("deny")}>
          <X className="size-4" />
          Deny
          <kbd className="ml-1 text-xs opacity-60">←</kbd>
        </Button>
        <Button size="lg" disabled={isPending} onClick={() => decide("approve")}>
          <Check className="size-4" />
          Accept
          <kbd className="ml-1 text-xs opacity-60">→</kbd>
        </Button>
      </div>
    </div>
  );
}
