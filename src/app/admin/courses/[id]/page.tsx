import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseEditForm } from "@/components/admin/course-edit-form";
import { courseHref } from "@/lib/course-href";

export default async function AdminCourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: encoded } = await params;
  const id = decodeURIComponent(encoded);
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  return (
    <div className="space-y-4">
      <Link href={courseHref(course.id)} className="text-sm text-muted-foreground hover:underline">
        ← View public page
      </Link>
      <h2 className="text-lg font-medium">Edit course</h2>
      <CourseEditForm
        course={{
          id: course.id,
          courseHeader: course.courseHeader,
          currentUnits: course.currentUnits,
          departmentId: course.departmentId,
        }}
      />
    </div>
  );
}
