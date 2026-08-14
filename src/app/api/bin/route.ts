import { NextRequest, NextResponse } from "next/server";
import { listCourseSummaries } from "@/lib/services/courses";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.getAll("id");
  const courses = await listCourseSummaries(ids);
  return NextResponse.json({
    courses: courses.map((c) => ({
      id: c.id,
      department: c.departmentId,
      courseNumber: c.courseNumber,
      courseHeader: c.courseHeader,
      reviewCount: c.reviewCount,
      latestReviewYear: null,
      verified: c.verified,
      isSpecialTopics: c.isSpecialTopics,
    })),
  });
}
