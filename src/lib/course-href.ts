// Course IDs are "DEPT::COURSE_NUMBER" (contain "::" and spaces), so they must
// be encoded/decoded consistently everywhere they appear in a URL path segment.
export function courseHref(courseId: string) {
  return `/courses/${encodeURIComponent(courseId)}`;
}
