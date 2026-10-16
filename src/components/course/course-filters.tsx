"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, SlidersHorizontal, X } from "lucide-react";
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
import { DEPARTMENTS, CAREER_CATEGORIES } from "@/lib/constants";
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
  const [profComboOpen, setProfComboOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedCategories = searchParams.get("cat")?.split(",").filter(Boolean) ?? [];
  const department = searchParams.get("dept") ?? "";
  const professorId = searchParams.get("prof") ?? "";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function toggleCategory(cat: string) {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    updateParams({ cat: next.length ? next.join(",") : null });
  }

  const hasFilters = !!(department || professorId || selectedCategories.length || query);

  const filterControls = (
    <div className={cn("space-y-3 transition-opacity", isPending && "opacity-60 pointer-events-none")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form
          className="flex-1 min-w-[200px]"
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: query || null });
          }}
        >
          <Input
            placeholder="Search course, topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => updateParams({ q: query || null })}
          />
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

        <Popover open={profComboOpen} onOpenChange={setProfComboOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-between sm:w-[200px]">
                <span className="truncate">
                  {professorId ? professors.find((p) => p.id === professorId)?.name ?? "Professor" : "Any professor"}
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
                  <CommandItem
                    onSelect={() => {
                      updateParams({ prof: null });
                      setProfComboOpen(false);
                    }}
                  >
                    <Check className={cn("size-4", professorId ? "opacity-0" : "opacity-100")} />
                    Any professor
                  </CommandItem>
                  {professors.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => {
                        updateParams({ prof: p.id });
                        setProfComboOpen(false);
                      }}
                    >
                      <Check className={cn("size-4", professorId === p.id ? "opacity-100" : "opacity-0")} />
                      {p.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" className="w-full justify-between sm:w-[200px]">
                <span className="truncate">
                  {selectedCategories.length ? `${selectedCategories.length} categories` : "Any career category"}
                </span>
                <ChevronsUpDown className="size-4 opacity-50" />
              </Button>
            }
          />
          <PopoverContent className="w-[--anchor-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {CAREER_CATEGORIES.map((cat) => (
                    <CommandItem key={cat} value={cat} onSelect={() => toggleCategory(cat)}>
                      <Check className={cn("size-4", selectedCategories.includes(cat) ? "opacity-100" : "opacity-0")} />
                      {cat}
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
