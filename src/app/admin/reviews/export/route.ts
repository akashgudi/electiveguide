import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth";
import { listAllReviewsAdmin } from "@/lib/services/admin";
import { toCsv } from "@/lib/csv";

const REVIEW_STATUSES = ["Pending", "Approved", "Denied"] as const;

const HEADERS = [
  "id",
  "status",
  "archivedAt",
  "moderatedAt",
  "createdAt",
  "courseId",
  "department",
  "courseNumber",
  "courseHeader",
  "topicTitle",
  "professor",
  "professorRaw",
  "multiProf",
  "profUncertain",
  "semester",
  "year",
  "units",
  "recCourse",
  "recProf",
  "useful",
  "career",
  "careerCategories",
  "comments",
  "reviewerName",
  "reviewerEmail",
];

export async function GET(request: NextRequest) {
  // The proxy already gates /admin, but this serves reviewer contact info, so check again here.
  if (!isValidAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Same filters as the admin reviews page.
  const sp = request.nextUrl.searchParams;
  const includeArchived = sp.get("archived") === "1";
  const query = sp.get("q") || undefined;
  const status = REVIEW_STATUSES.find((s) => s === sp.get("status"));
  // Denied reviews are always archived, so that filter has to include archived ones.
  const reviews = await listAllReviewsAdmin(includeArchived || status === "Denied", query, status);

  const csv = toCsv(
    HEADERS,
    reviews.map((r) => [
      r.id,
      r.status,
      r.archivedAt?.toISOString(),
      r.moderatedAt?.toISOString(),
      r.createdAt.toISOString(),
      r.courseId,
      r.course.departmentId,
      r.course.courseNumber,
      r.course.courseHeader,
      r.topicTitle,
      r.professor?.name,
      r.professorRaw,
      r.multiProf,
      r.profUncertain,
      r.semester === "Summer_Fall" ? "Summer/Fall" : r.semester,
      r.year,
      r.units,
      r.recCourse,
      r.recProf,
      r.useful,
      r.career,
      r.careerCategories.join("; "),
      r.comments,
      r.reviewerName,
      r.reviewerEmail,
    ])
  );

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reviews-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
