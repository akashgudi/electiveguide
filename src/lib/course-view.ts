export type CourseView = "grid" | "list";

// Remembered in a cookie (not localStorage) so the server renders the right
// layout on first load instead of flashing the default.
export const COURSE_VIEW_COOKIE = "course-view";

export function parseCourseView(value: string | undefined): CourseView {
  return value === "list" ? "list" : "grid";
}
