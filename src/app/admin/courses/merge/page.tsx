import { listCoursesForMerge } from "@/lib/services/admin";
import { findGroupedMergeSuggestions } from "@/lib/fuzzy-match";
import { CourseMergeForm } from "@/components/admin/course-merge-form";

export default async function CourseMergePage() {
  const courses = await listCoursesForMerge();
  const label = (c: (typeof courses)[number]) => `${c.departmentId} ${c.courseNumber} — ${c.courseHeader}`;

  // Course numbers are short enough that plain fuzzy matching produces
  // dangerous false positives (e.g. "ACCT 532" vs "ACCT 533", or the same
  // "599 - Special Topics" placeholder across unrelated departments). Only
  // suggest a pair when the department matches and the course number is
  // identical once whitespace/punctuation is normalized — the real-world
  // cause of duplicate course rows — then use the title purely to score.
  const suggestions = findGroupedMergeSuggestions(
    courses,
    (c) => c.departmentId,
    (c) => c.courseNumber,
    (c) => c.courseHeader
  ).map((s) => ({
    sourceId: s.source.id,
    sourceLabel: label(s.source),
    targetId: s.target.id,
    targetLabel: label(s.target),
    score: s.score,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Merge duplicate courses</h2>
      <CourseMergeForm courses={courses.map((c) => ({ id: c.id, label: label(c) }))} suggestions={suggestions} />
    </div>
  );
}
