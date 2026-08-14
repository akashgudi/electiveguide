"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { mergeProfessorsAction } from "@/actions/admin";

interface Professor {
  id: string;
  name: string;
}

function ProfessorPicker({
  label,
  professors,
  value,
  onChange,
}: {
  label: string;
  professors: Professor[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" className="w-full justify-between">
              <span className="truncate">{value ? professors.find((p) => p.id === value)?.name : "Select professor"}</span>
              <ChevronsUpDown className="size-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-[--anchor-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search professor..." />
            <CommandList>
              <CommandEmpty>No professor found.</CommandEmpty>
              <CommandGroup>
                {professors.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.name}
                    onSelect={() => {
                      onChange(p.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("size-4", value === p.id ? "opacity-100" : "opacity-0")} />
                    {p.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ProfessorMergeForm({ professors }: { professors: Professor[] }) {
  const router = useRouter();
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const invalid = !source || !target || source === target;

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">
        All reviews from the source professor are reassigned to the target, then the source is archived. Use this
        when the same person exists twice (e.g. a typo variant).
      </p>
      <ProfessorPicker label="Source (will be archived)" professors={professors} value={source} onChange={setSource} />
      <ProfessorPicker label="Target (keeps the reviews)" professors={professors} value={target} onChange={setTarget} />
      {source && target && source === target && (
        <p className="text-sm text-destructive">Source and target must be different professors.</p>
      )}
      <Button
        type="button"
        disabled={invalid || isPending}
        onClick={() => {
          if (!source || !target) return;
          if (!window.confirm("Merge these professors? This cannot be undone from the UI.")) return;
          setDone(false);
          startTransition(async () => {
            await mergeProfessorsAction(source, target);
            setDone(true);
            setSource(null);
            setTarget(null);
            router.refresh();
          });
        }}
      >
        {isPending ? "Merging..." : "Merge professors"}
      </Button>
      {done && !isPending && <p className="text-sm text-muted-foreground">Merged.</p>}
    </div>
  );
}
