"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourseBin } from "@/hooks/use-course-bin";

export function BinButton({ courseId }: { courseId: string }) {
  const { hydrated, has, toggle } = useCourseBin();
  const saved = hydrated && has(courseId);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={saved ? "Remove from bin" : "Add to bin"}
      aria-pressed={saved}
      className={saved ? "text-primary hover:text-primary" : undefined}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(courseId);
      }}
    >
      {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
    </Button>
  );
}
