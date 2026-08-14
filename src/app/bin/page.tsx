"use client";

import { useEffect, useState } from "react";
import { useCourseBin } from "@/hooks/use-course-bin";
import { CourseCard, type CourseCardData } from "@/components/course/course-card";
import { CourseListSkeleton } from "@/components/skeletons/course-card-skeleton";

export default function BinPage() {
  const { ids, hydrated } = useCourseBin();
  const [courses, setCourses] = useState<CourseCardData[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (ids.length === 0) {
      setCourses([]);
      return;
    }
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("id", id));
    setCourses(null);
    fetch(`/api/bin?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setCourses(data.courses));
  }, [hydrated, ids]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Bin</h1>
        <p className="text-sm text-muted-foreground">
          Courses you&apos;ve saved to look at later. Stored in this browser only.
        </p>
      </div>

      {courses === null ? (
        <CourseListSkeleton count={ids.length || 3} />
      ) : courses.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nothing saved yet — use the bookmark icon on a course to add it here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
