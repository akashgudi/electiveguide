export function deriveCourseId(department: string, courseNumber: string): string {
  return `${department}::${courseNumber}`;
}

export function isSpecialTopics(courseNumber: string): boolean {
  return courseNumber.includes("599");
}

export function deriveCourseHeader(courseNumber: string, title: string): string {
  if (isSpecialTopics(courseNumber)) {
    return `${courseNumber} - Special Topics`;
  }
  return `${courseNumber} - ${title}`;
}
