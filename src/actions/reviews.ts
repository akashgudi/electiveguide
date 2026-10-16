"use server";

import { revalidatePath } from "next/cache";
import { reviewFormSchema, type ReviewFormValues } from "@/lib/validations/review";
import { submitReview } from "@/lib/services/reviews";
import { getAppSettings } from "@/lib/services/settings";

export interface SubmitReviewResult {
  success: boolean;
  errors?: Record<string, string>;
  courseId?: string;
}

export async function submitReviewAction(values: ReviewFormValues): Promise<SubmitReviewResult> {
  const settings = await getAppSettings();
  if (!settings.reviewSubmissionEnabled) {
    return { success: false, errors: { form: "Review submissions are temporarily closed." } };
  }

  const parsed = reviewFormSchema.safeParse(values);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path.join(".") || "form"] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    // The review starts as Pending, so nothing public changes until an admin approves it.
    const { courseId } = await submitReview(parsed.data);
    revalidatePath("/admin");
    revalidatePath("/admin/review-queue");
    revalidatePath("/admin/unverified");
    return { success: true, courseId };
  } catch (err) {
    console.error("submitReview failed", err);
    return { success: false, errors: { form: "We couldn't save your review. Please try again in a moment." } };
  }
}
