"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Check, ChevronsUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DEPARTMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Professor {
  id: string;
  name: string;
}

export function CourseFilters({ professors }: { professors: Professor[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const department = searchParams.get("dept") ?? "";
  // Selections render from optimistic state so check marks flip immediately,
  // before the navigation to the new URL finishes.
  const [selectedProfessorIds, setSelectedProfessorIds] = useOptimistic(
    searchParams.get("prof")?.split(",").filter(Boolean) ?? []
  );

  function updateParams(updates: Record<string, string | null>, applyOptimistic?: () => void) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      applyOptimistic?.();
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleProfessor(id: string) {
    const next = selectedProfessorIds.includes(id)
      ? selectedProfessorIds.filter((p) => p !== id)
      : [...selectedProfessorIds, id];
    updateParams({ prof: next.length ? next.join(",") : null }, () => setSelectedProfessorIds(next));
  }

  const selectedProfessors = professors.filter((p) => selectedProfessorIds.includes(p.id));

  const hasFilters = !!(department || selectedProfessorIds.length || query);

  const filterControls = (
    <div className={cn("space-y-3 transition-opacity", isPending && "opacity-60 pointer-events-none")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form
          className="flex flex-1 min-w-[200px] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: query || null });
          }}
        >
          <Input
            placeholder="Search course, topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" className="shrink-0">
            <Search className="size-4" />
            Search
          </Button>
        </form>

        <Select value={department || "__any"} onValueChange={(v) => updateParams({ dept: v === "__any" ? null : v })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue>{(v: string) => (v === "__any" ? "All departments" : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__any">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-between sm:w-[200px]">
                <span className="truncate">
                  {selectedProfessors.length === 1
                    ? selectedProfessors[0].name
                    : selectedProfessors.length
                      ? `${selectedProfessors.length} professors`
                      : "Any professor"}
                </span>
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
                    <CommandItem key={p.id} value={p.name} onSelect={() => toggleProfessor(p.id)}>
                      <Check className={cn("size-4", selectedProfessorIds.includes(p.id) ? "opacity-100" : "opacity-0")} />
                      {p.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              startTransition(() => router.push(pathname));
            }}
          >
            <X className="size-4" />
            Clear filters
          </Button>
        )}
      </div>

      {selectedProfessors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProfessors.map((p) => (
            <Badge key={p.id} variant="secondary" className="cursor-pointer" onClick={() => toggleProfessor(p.id)}>
              {p.name}
              <X className="size-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop: unchanged inline filter bar */}
      <div className="hidden sm:block">{filterControls}</div>

      {/* Mobile: floating button opens a filter sheet instead */}
      <div className="sm:hidden">
        <Button
          type="button"
          size="icon-lg"
          className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 size-11 rounded-full shadow-lg"
          aria-label="Open filters"
          onClick={() => setMobileOpen(true)}
        >
          <SlidersHorizontal className="size-6" />
          {hasFilters && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-warning ring-2 ring-background" />
          )}
        </Button>
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            {filterControls}
            <Button type="button" className="w-full" onClick={() => setMobileOpen(false)}>
              Show results
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
