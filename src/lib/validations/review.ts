import { z } from "zod";
import { CAREER_CATEGORIES, DEPARTMENTS, SEMESTERS, RECOMMENDATIONS } from "@/lib/constants";

export const COURSE_NUMBER_REGEX = /^[A-Z]{2,5} \d{3}[A-Za-z]?$/;

export const PROFESSOR_NAME_REGEX =
  /^[A-Za-z][A-Za-z.'-]*(?:\s[A-Za-z][A-Za-z.'-]*)*(?:,\s[A-Za-z][A-Za-z.'-]*(?:\s[A-Za-z][A-Za-z.'-]*)*){1,2}$/;

const currentYear = new Date().getFullYear();

export const reviewFormSchema = z
  .object({
    semester: z.enum(SEMESTERS),
    year: z.coerce.number().int().min(2000).max(currentYear + 1),
    units: z.coerce.number().positive().max(10),
    recCourse: z.enum(RECOMMENDATIONS),
    recProf: z.enum(RECOMMENDATIONS),
    useful: z.enum(RECOMMENDATIONS),
    careerCategories: z.array(z.enum(CAREER_CATEGORIES)).min(1, "Select at least one career category"),
    comments: z.string().max(5000).optional(),

    isNewCourse: z.boolean(),
    courseId: z.string().optional(),
    // Populated for both existing (from the selected course) and new courses,
    // so the form can conditionally require topicTitle for 599 courses
    // without a DB round trip. The service layer re-derives/verifies this
    // from the authoritative course record.
    courseNumber: z.string().optional(),
    topicTitle: z.string().optional(),
    newCourse: z
      .object({
        department: z.enum(DEPARTMENTS),
        courseNumber: z.string().regex(COURSE_NUMBER_REGEX, 'Format: "DEPT 505"'),
        title: z.string().min(3).max(150),
        currentUnits: z.coerce.number().positive().max(10).optional(),
      })
      .optional(),

    isNewProfessor: z.boolean(),
    professorIds: z.array(z.string()).optional(),
    newProfessorNames: z
      .array(z.string().regex(PROFESSOR_NAME_REGEX, 'Format: "Last, First" or "Last, First, Middle"'))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isNewCourse) {
      if (!data.newCourse) {
        ctx.addIssue({ code: "custom", path: ["newCourse"], message: "Required when course isn't listed" });
      }
    } else if (!data.courseId) {
      ctx.addIssue({ code: "custom", path: ["courseId"], message: "Select a course" });
    }

    if (data.isNewProfessor) {
      if (!data.newProfessorNames || data.newProfessorNames.length === 0) {
        ctx.addIssue({ code: "custom", path: ["newProfessorNames"], message: "Required when professor isn't listed" });
      }
    } else if (!data.professorIds || data.professorIds.length === 0) {
      ctx.addIssue({ code: "custom", path: ["professorIds"], message: "Select at least one professor" });
    }

    const effectiveCourseNumber = data.isNewCourse ? data.newCourse?.courseNumber : data.courseNumber;
    const is599 = !!effectiveCourseNumber?.includes("599");
    if (is599 && (!data.topicTitle || data.topicTitle.trim().length < 3)) {
      ctx.addIssue({
        code: "custom",
        path: ["topicTitle"],
        message: "This is a Special Topics course — enter the specific topic that was offered",
      });
    }
  });

export type ReviewFormValues = z.output<typeof reviewFormSchema>;
export type ReviewFormInput = z.input<typeof reviewFormSchema>;
