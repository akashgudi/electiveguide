import { listCoursesForMerge } from "@/lib/services/admin";
import { CourseMergeForm } from "@/components/admin/course-merge-form";

export default async function CourseMergePage() {
  const courses = await listCoursesForMerge();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Merge duplicate courses</h2>
      <CourseMergeForm
        courses={courses.map((c) => ({
          id: c.id,
          label: `${c.departmentId} ${c.courseNumber} — ${c.courseHeader}`,
        }))}
      />
    </div>
  );
}
