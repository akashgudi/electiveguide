"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ChevronsUpDown, X } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RECOMMENDATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FilterOptions {
  semesters: string[];
  years: number[];
  categories: string[];
  professors: { id: string; name: string }[];
}

function semesterLabel(s: string) {
  return s === "Summer_Fall" ? "Summer/Fall" : s;
}

export function ReviewFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const semester = searchParams.get("semester") ?? "";
  const year = searchParams.get("year") ?? "";
  const professorId = searchParams.get("rprof") ?? "";
  const recCourse = searchParams.get("rRecCourse") ?? "";
  const recProf = searchParams.get("rRecProf") ?? "";
  const useful = searchParams.get("rUseful") ?? "";
  const selectedCategories = searchParams.get("rcat")?.split(",").filter(Boolean) ?? [];

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // filters changed, results shifted — start from page 1
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function toggleCategory(cat: string) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    updateParams({ rcat: next.length ? next.join(",") : null });
  }

  const hasFilters = semester || year || professorId || recCourse || recProf || useful || selectedCategories.length;

  if (
    options.semesters.length === 0 &&
    options.years.length === 0 &&
    options.professors.length === 0 &&
    options.categories.length === 0
  ) {
    return null;
  }

  return (
    <div className={cn("space-y-2 transition-opacity", isPending && "opacity-60 pointer-events-none")}>
      <div className="flex flex-wrap items-center gap-2">
        {options.semesters.length > 1 && (
          <Select value={semester || "__any"} onValueChange={(v) => updateParams({ semester: v === "__any" ? null : v })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue>{(v: string) => (v === "__any" ? "Any semester" : semesterLabel(v))}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any">Any semester</SelectItem>
              {options.semesters.map((s) => (
                <SelectItem key={s} value={s}>
                  {semesterLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {options.years.length > 1 && (
          <Select value={year || "__any"} onValueChange={(v) => updateParams({ year: v === "__any" ? null : v })}>
            <SelectTrigger className="w-[120px]">
              <SelectValue>{(v: string) => (v === "__any" ? "Any year" : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any">Any year</SelectItem>
              {options.years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {options.professors.length > 1 && (
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className="w-[190px] justify-between">
                  <span className="truncate">
                    {professorId ? options.professors.find((p) => p.id === professorId)?.name : "Any professor"}
                  </span>
                  <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
              }
            />
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search professor..." />
                <CommandList>
                  <CommandEmpty>No professor found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => updateParams({ rprof: null })}>Any professor</CommandItem>
                    {options.professors.map((p) => (
                      <CommandItem key={p.id} value={p.name} onSelect={() => updateParams({ rprof: p.id })}>
                        {p.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {(["rRecCourse", "rRecProf", "rUseful"] as const).map((field) => {
          const labels = { rRecCourse: "Rec. course", rRecProf: "Rec. prof", rUseful: "Useful" };
          const current = { rRecCourse: recCourse, rRecProf: recProf, rUseful: useful }[field];
          return (
            <Select key={field} value={current || "__any"} onValueChange={(v) => updateParams({ [field]: v === "__any" ? null : v })}>
              <SelectTrigger className="w-[160px]">
                <SelectValue>{(v: string) => `${labels[field]}: ${v === "__any" ? "Any" : v}`}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any">{labels[field]}: Any</SelectItem>
                {RECOMMENDATIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {labels[field]}: {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}

        {options.categories.length > 1 && (
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" className="w-[190px] justify-between">
                  <span className="truncate">
                    {selectedCategories.length ? `${selectedCategories.length} categories` : "Any career category"}
                  </span>
                  <ChevronsUpDown className="size-4 opacity-50" />
                </Button>
              }
            />
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search category..." />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {options.categories.map((cat) => (
                      <CommandItem key={cat} value={cat} onSelect={() => toggleCategory(cat)}>
                        <span className={cn(selectedCategories.includes(cat) ? "font-medium" : "")}>{cat}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              ["semester", "year", "rprof", "rcat", "rRecCourse", "rRecProf", "rUseful", "page"].forEach((k) =>
                params.delete(k)
              );
              startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
            }}
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="cursor-pointer" onClick={() => toggleCategory(cat)}>
              {cat}
              <X className="size-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
