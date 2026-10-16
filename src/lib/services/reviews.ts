import { prisma } from "@/lib/prisma";
import { deriveCourseId, deriveCourseHeader, isSpecialTopics } from "@/lib/course-id";
import type { ReviewFormValues } from "@/lib/validations/review";

function toSemesterEnum(value: string) {
  return value === "Summer/Fall" ? "Summer_Fall" : value;
}

export async function submitReview(values: ReviewFormValues) {
  return prisma.$transaction(async (tx) => {
    // Resolve (or create) the course
    let courseId: string;
    let courseHeader: string;
    let courseNumber: string;

    if (values.isNewCourse && values.newCourse) {
      const { department, courseNumber: num, title, currentUnits } = values.newCourse;
      const id = deriveCourseId(department, num);
      const existing = await tx.course.findUnique({ where: { id } });
      if (existing) {
        courseId = existing.id;
        courseHeader = existing.courseHeader;
        courseNumber = existing.courseNumber;
      } else {
        const header = deriveCourseHeader(num, title);
        const created = await tx.course.create({
          data: {
            id,
            departmentId: department,
            courseNumber: num,
            courseHeader: header,
            currentUnits: currentUnits ?? null,
            verified: false,
          },
        });
        courseId = created.id;
        courseHeader = created.courseHeader;
        courseNumber = created.courseNumber;
      }
    } else {
      const existing = await tx.course.findUniqueOrThrow({ where: { id: values.courseId! } });
      courseId = existing.id;
      courseHeader = existing.courseHeader;
      courseNumber = existing.courseNumber;
    }

    // Resolve (or create) professor(s)
    let professorIds: string[] = [];
    let professorNames: string[] = [];

    if (values.isNewProfessor && values.newProfessorNames?.length) {
      for (const name of values.newProfessorNames) {
        const existing = await tx.professor.findFirst({ where: { name } });
        if (existing) {
          professorIds.push(existing.id);
          professorNames.push(existing.name);
        } else {
          const created = await tx.professor.create({
            data: { name, rawVariants: [name], verified: false },
          });
          professorIds.push(created.id);
          professorNames.push(created.name);
        }
      }
    } else if (values.professorIds?.length) {
      const existing = await tx.professor.findMany({ where: { id: { in: values.professorIds } } });
      professorIds = existing.map((p) => p.id);
      professorNames = existing.map((p) => p.name);
    }

    const primaryProfessorId = professorIds[0] ?? null;
    const professorRaw = professorNames.length ? professorNames.join("; ") : null;
    const multiProf = professorIds.length > 1;

    const special = isSpecialTopics(courseNumber);
    const topicTitle = special ? values.topicTitle!.trim() : courseHeader;

    const review = await tx.review.create({
      data: {
        courseId,
        professorId: primaryProfessorId,
        professorRaw,
        multiProf,
        profUncertain: false,
        semester: toSemesterEnum(values.semester) as never,
        year: values.year,
        units: values.units,
        recCourse: values.recCourse as never,
        recProf: values.recProf as never,
        useful: values.useful as never,
        career: null,
        careerCategories: values.careerCategories,
        comments: values.comments || null,
        topicTitle,
        status: "Pending",
        reviewerName: values.reviewerName,
        reviewerEmail: values.reviewerEmail,
      },
    });

    return { review, courseId, isNewCourseCreated: values.isNewCourse, isNewProfessorCreated: values.isNewProfessor };
  });
}
