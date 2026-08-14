"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CAREER_CATEGORIES } from "@/lib/constants";
import { updateReviewAction } from "@/actions/admin";

export function ReviewEditForm({
  review,
}: {
  review: { id: number; topicTitle: string; comments: string | null; careerCategories: string[] };
}) {
  const router = useRouter();
  const [topicTitle, setTopicTitle] = useState(review.topicTitle);
  const [comments, setComments] = useState(review.comments ?? "");
  const [categories, setCategories] = useState<string[]>(review.careerCategories);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateReviewAction(review.id, { topicTitle, comments: comments || null, careerCategories: categories });
          setSaved(true);
          router.refresh();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label>Topic / title</Label>
        <Input value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Career categories</Label>
        <div className="flex flex-wrap gap-2">
          {CAREER_CATEGORIES.map((cat) => {
            const checked = categories.includes(cat);
            return (
              <Badge
                key={cat}
                variant={checked ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategories(checked ? categories.filter((c) => c !== cat) : [...categories, cat])}
              >
                {cat}
              </Badge>
            );
          })}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Comments</Label>
        <Textarea rows={6} value={comments} onChange={(e) => setComments(e.target.value)} />
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
