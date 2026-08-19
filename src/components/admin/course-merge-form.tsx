"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, ArrowUpDown } from "lucide-react";
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
import { mergeCoursesAction } from "@/actions/admin";

interface Course {
  id: string;
  label: string;
}

interface Suggestion {
  sourceId: string;
  sourceLabel: string;
  targetId: string;
  targetLabel: string;
  score: number;
}

function CoursePicker({
  label,
  courses,
  value,
  onChange,
}: {
  label: string;
  courses: Course[];
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
              <span className="truncate">{value ? courses.find((c) => c.id === value)?.label : "Select course"}</span>
              <ChevronsUpDown className="size-4 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-[--anchor-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search course..." />
            <CommandList>
              <CommandEmpty>No course found.</CommandEmpty>
              <CommandGroup>
                {courses.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.label}
                    onSelect={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("size-4", value === c.id ? "opacity-100" : "opacity-0")} />
                    {c.label}
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

export function CourseMergeForm({
  courses,
  suggestions = [],
}: {
  courses: Course[];
  suggestions?: Suggestion[];
}) {
  const router = useRouter();
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const invalid = !source || !target || source === target;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <p className="text-sm text-muted-foreground">
          All reviews from the source course are reassigned to the target, then the source is archived. Use this when
          the same course exists twice (e.g. a duplicate listing).
        </p>
        <CoursePicker label="Source (will be archived)" courses={courses} value={source} onChange={setSource} />
        <div className="flex justify-center">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Swap source and target"
            disabled={!source && !target}
            onClick={() => {
              const nextSource = target;
              const nextTarget = source;
              setSource(nextSource);
              setTarget(nextTarget);
            }}
          >
            <ArrowUpDown className="size-4" />
          </Button>
        </div>
        <CoursePicker label="Target (keeps the reviews)" courses={courses} value={target} onChange={setTarget} />
        {source && target && source === target && (
          <p className="text-sm text-destructive">Source and target must be different courses.</p>
        )}
        <Button
          type="button"
          disabled={invalid || isPending}
          onClick={() => {
            if (!source || !target) return;
            if (!window.confirm("Merge these courses? This cannot be undone from the UI.")) return;
            setDone(false);
            startTransition(async () => {
              await mergeCoursesAction(source, target);
              setDone(true);
              setSource(null);
              setTarget(null);
              router.refresh();
            });
          }}
        >
          {isPending ? "Merging..." : "Merge courses"}
        </Button>
        {done && !isPending && <p className="text-sm text-muted-foreground">Merged.</p>}
      </div>

      <div className="space-y-2 lg:col-span-2">
        <p className="text-sm font-medium">Suggested merges</p>
        {suggestions.length === 0 ? (
          <p className="border border-border p-4 text-sm text-muted-foreground">No likely duplicates found.</p>
        ) : (
          <div className="divide-y divide-border border border-border">
            {suggestions.slice(0, 15).map((s) => (
              <div key={`${s.sourceId}-${s.targetId}`} className="flex items-center justify-between gap-3 p-2 text-sm">
                <span className="truncate">
                  <span className="text-muted-foreground line-through">{s.sourceLabel}</span>
                  {" → "}
                  <span className="font-medium">{s.targetLabel}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{Math.round(s.score * 100)}% match</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSource(s.sourceId);
                    setTarget(s.targetId);
                    setDone(false);
                  }}
                >
                  Use
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
