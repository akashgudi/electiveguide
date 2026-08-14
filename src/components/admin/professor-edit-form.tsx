"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfessorAction } from "@/actions/admin";

export function ProfessorEditForm({ professor }: { professor: { id: string; name: string } }) {
  const router = useRouter();
  const [name, setName] = useState(professor.name);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateProfessorAction(professor.id, { name });
          setSaved(true);
          router.refresh();
        });
      }}
    >
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
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
