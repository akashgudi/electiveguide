"use client";

import { createContext, useContext, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, type CourseCardData } from "@/components/course/course-card";
import { CourseRow, CourseRowHeader } from "@/components/course/course-row";
import { COURSE_VIEW_COOKIE, type CourseView } from "@/lib/course-view";

const CourseViewContext = createContext<{ view: CourseView; setView: (view: CourseView) => void } | null>(null);

function useCourseView() {
  const ctx = useContext(CourseViewContext);
  if (!ctx) throw new Error("useCourseView must be used inside CourseViewProvider");
  return ctx;
}

/** Holds the grid/list choice so switching is instant; the cookie only seeds the next server render. */
export function CourseViewProvider({ initialView, children }: { initialView: CourseView; children: React.ReactNode }) {
  const [view, setViewState] = useState(initialView);

  function setView(next: CourseView) {
    setViewState(next);
    document.cookie = `${COURSE_VIEW_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return <CourseViewContext.Provider value={{ view, setView }}>{children}</CourseViewContext.Provider>;
}

const OPTIONS = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
] as const;

export function CourseViewToggle() {
  const { view, setView } = useCourseView();
  return (
    <div className="flex gap-1" role="group" aria-label="Course layout">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          size="icon-sm"
          variant={view === value ? "default" : "outline"}
          aria-label={label}
          aria-pressed={view === value}
          onClick={() => setView(value)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}

export function CourseResults({ courses }: { courses: CourseCardData[] }) {
  const { view } = useCourseView();

  if (view === "list") {
    return (
      <div className="divide-y divide-border border border-border">
        <CourseRowHeader />
        {courses.map((course) => (
          <CourseRow key={course.id} course={course} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
