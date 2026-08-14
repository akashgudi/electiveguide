"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminActionButton({
  label,
  pendingLabel,
  variant = "outline",
  onRun,
  confirmMessage,
  className,
}: {
  label: string;
  pendingLabel?: string;
  variant?: "outline" | "destructive" | "secondary" | "ghost" | "default";
  onRun: () => Promise<void>;
  confirmMessage?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={isPending}
      className={cn(className)}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await onRun();
          router.refresh();
        });
      }}
    >
      {isPending ? pendingLabel ?? "Working..." : label}
    </Button>
  );
}
