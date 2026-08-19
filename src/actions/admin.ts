"use server";

import { revalidatePath } from "next/cache";
import * as admin from "@/lib/services/admin";
import { setReviewSubmissionEnabled } from "@/lib/services/settings";
import { courseHref } from "@/lib/course-href";

function revalidateAdminAndCourse(courseId?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/unverified");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/professors");
  revalidatePath("/admin/reviews");
  if (courseId) revalidatePath(courseHref(courseId));
}

export async function verifyCourseAction(id: string) {
  await admin.verifyCourse(id);
  revalidateAdminAndCourse(id);
}

export async function archiveCourseAction(id: string) {
  await admin.archiveCourse(id);
  revalidateAdminAndCourse(id);
}

export async function unarchiveCourseAction(id: string) {
  await admin.unarchiveCourse(id);
  revalidateAdminAndCourse(id);
}

export async function updateCourseAction(
  id: string,
  data: { courseHeader?: string; currentUnits?: number | null; departmentId?: string }
) {
  await admin.updateCourse(id, data);
  revalidateAdminAndCourse(id);
}

export async function mergeCoursesAction(sourceId: string, targetId: string) {
  await admin.mergeCourses(sourceId, targetId);
  revalidateAdminAndCourse();
}

export async function verifyProfessorAction(id: string) {
  await admin.verifyProfessor(id);
  revalidateAdminAndCourse();
}

export async function archiveProfessorAction(id: string) {
  await admin.archiveProfessor(id);
  revalidateAdminAndCourse();
}

export async function unarchiveProfessorAction(id: string) {
  await admin.unarchiveProfessor(id);
  revalidateAdminAndCourse();
}

export async function updateProfessorAction(id: string, data: { name?: string }) {
  await admin.updateProfessor(id, data);
  revalidateAdminAndCourse();
}

export async function mergeProfessorsAction(sourceId: string, targetId: string) {
  await admin.mergeProfessors(sourceId, targetId);
  revalidateAdminAndCourse();
}

export async function archiveReviewAction(id: number) {
  await admin.archiveReview(id);
  revalidateAdminAndCourse();
}

export async function unarchiveReviewAction(id: number) {
  await admin.unarchiveReview(id);
  revalidateAdminAndCourse();
}

export async function updateReviewAction(
  id: number,
  data: { comments?: string | null; topicTitle?: string; careerCategories?: string[] }
) {
  await admin.updateReview(id, data);
  revalidateAdminAndCourse();
}

export async function setReviewSubmissionEnabledAction(enabled: boolean) {
  await setReviewSubmissionEnabled(enabled);
  revalidatePath("/admin");
  revalidatePath("/submit-review");
}
