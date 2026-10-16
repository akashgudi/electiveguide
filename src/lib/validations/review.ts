import { z } from "zod";
import { CAREER_CATEGORIES, DEPARTMENTS, SEMESTERS, RECOMMENDATIONS } from "@/lib/constants";

export const COURSE_NUMBER_REGEX = /^[A-Z]{2,5} \d{3}[A-Za-z]?$/;

export const PROFESSOR_NAME_REGEX =
  /^[A-Za-z][A-Za-z.'-]*(?:\s[A-Za-z][A-Za-z.'-]*)*(?:,\s[A-Za-z][A-Za-z.'-]*(?:\s[A-Za-z][A-Za-z.'-]*)*){1,2}$/;

const currentYear = new Date().getFullYear();

export const reviewFormSchema = z
  .object({
    semester: z.enum(SEMESTERS, { error: "Select the semester you took this course" }),
    year: z.coerce
      .number({ error: "Enter the year you took this course" })
      .int("Enter a whole year, like 2025")
      .min(2000, "Enter the year you took this course, like 2025")
      .max(currentYear + 1, `The year can't be later than ${currentYear + 1}`),
    units: z.coerce
      .number({ error: "Enter how many units the course was" })
      .positive("Enter how many units the course was")
      .max(10, "Units can't be more than 10"),
    recCourse: z.enum(RECOMMENDATIONS, { error: "Let us know if you'd recommend this course" }),
    recProf: z.enum(RECOMMENDATIONS, { error: "Let us know if you'd recommend this professor" }),
    useful: z.enum(RECOMMENDATIONS, { error: "Let us know if this course was useful for your career" }),
    careerCategories: z.array(z.enum(CAREER_CATEGORIES)).min(1, "Pick at least one career category"),
    comments: z.string().trim().min(1, "Please share a few words about your experience").max(5000, "Comments can be up to 5,000 characters"),

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
        department: z.enum(DEPARTMENTS, { error: "Select the course's department" }),
        courseNumber: z.string().regex(COURSE_NUMBER_REGEX, 'Enter the course number like "ACCT 505"'),
        title: z
          .string()
          .trim()
          .min(3, "Enter the course title")
          .max(150, "The course title can be up to 150 characters"),
        currentUnits: z.coerce
          .number({ error: "Enter how many units the course is" })
          .positive("Enter how many units the course is")
          .max(10, "Units can't be more than 10"),
      })
      .optional(),

    isNewProfessor: z.boolean(),
    professorIds: z.array(z.string()).optional(),
    newProfessorNames: z
      .array(z.string().regex(PROFESSOR_NAME_REGEX, 'Enter the name as "Last, First", e.g. "Smith, Jane"'))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isNewCourse) {
      if (!data.newCourse) {
        ctx.addIssue({ code: "custom", path: ["newCourse"], message: "Enter the details of the course you took" });
      }
    } else if (!data.courseId) {
      ctx.addIssue({ code: "custom", path: ["courseId"], message: "Pick the course you're reviewing" });
    }

    if (data.isNewProfessor) {
      if (!data.newProfessorNames || data.newProfessorNames.length === 0) {
        ctx.addIssue({ code: "custom", path: ["newProfessorNames"], message: "Enter your professor's name" });
      }
    } else if (!data.professorIds || data.professorIds.length === 0) {
      ctx.addIssue({ code: "custom", path: ["professorIds"], message: "Pick your professor" });
    }

    const effectiveCourseNumber = data.isNewCourse ? data.newCourse?.courseNumber : data.courseNumber;
    const is599 = !!effectiveCourseNumber?.includes("599");
    if (is599 && (!data.topicTitle || data.topicTitle.trim().length < 3)) {
      ctx.addIssue({
        code: "custom",
        path: ["topicTitle"],
        message: "Enter the topic this Special Topics course covered",
      });
    }
  });

export type ReviewFormValues = z.output<typeof reviewFormSchema>;
export type ReviewFormInput = z.input<typeof reviewFormSchema>;
