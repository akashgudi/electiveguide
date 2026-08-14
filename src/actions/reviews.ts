"use server";

import { revalidatePath } from "next/cache";
import { reviewFormSchema, type ReviewFormValues } from "@/lib/validations/review";
import { submitReview } from "@/lib/services/reviews";
import { courseHref } from "@/lib/course-href";

export interface SubmitReviewResult {
  success: boolean;
  errors?: Record<string, string>;
  courseId?: string;
}

export async function submitReviewAction(values: ReviewFormValues): Promise<SubmitReviewResult> {
  const parsed = reviewFormSchema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".") || "form"] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    const { courseId } = await submitReview(parsed.data);
    revalidatePath("/");
    revalidatePath(courseHref(courseId));
    revalidatePath("/admin");
    revalidatePath("/admin/unverified");
    return { success: true, courseId };
  } catch (err) {
    return { success: false, errors: { form: err instanceof Error ? err.message : "Something went wrong" } };
  }
}
