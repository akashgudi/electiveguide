import { listCoursesForMerge } from "@/lib/services/admin";
import { findMergeSuggestions, findGroupedMergeSuggestions, type MergeSuggestion } from "@/lib/fuzzy-match";
import { isSpecialTopics } from "@/lib/course-id";
import { CourseMergeForm } from "@/components/admin/course-merge-form";

type Course = Awaited<ReturnType<typeof listCoursesForMerge>>[number];

export default async function CourseMergePage() {
  const courses = await listCoursesForMerge();
  // courseNumber already embeds the department code (e.g. "FBE 553B"), and
  // courseHeader leads with courseNumber, so courseHeader alone is a
  // complete, non-redundant label.
  const label = (c: Course) => c.courseHeader;

  // Course numbers are short enough that fuzzy-matching every course against
  // every other one produces dangerous false positives: reused generic
  // titles like "599 - Special Topics" match across unrelated departments,
  // and short numeric codes ("532" vs "533") look deceptively close by edit
  // distance. So two complementary, narrower passes instead of one broad one:
  //
  // 1. Same department + course number identical once normalized — the
  //    formatting-drift case that actually produces duplicate rows.
  const exactNumberMatches = findGroupedMergeSuggestions(
    courses,
    (c) => c.departmentId,
    (c) => c.courseNumber,
    (c) => c.courseHeader
  );
  // 2. Fuzzy title match across everything else, excluding "Special Topics"
  //    placeholders (their title carries no signal — every department has
  //    one) so genuine dupes like cross-listings or course renumbering
  //    still surface without the placeholder noise.
  const titleMatches = findMergeSuggestions(
    courses.filter((c) => !isSpecialTopics(c.courseNumber)),
    (c) => c.courseHeader
  );

  const seen = new Set<string>();
  const suggestions: MergeSuggestion<Course>[] = [];
  for (const s of [...exactNumberMatches, ...titleMatches].sort((a, b) => b.score - a.score)) {
    const key = [s.source.id, s.target.id].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(s);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Merge duplicate courses</h2>
      <CourseMergeForm
        courses={courses.map((c) => ({ id: c.id, label: label(c) }))}
        suggestions={suggestions.map((s) => ({
          sourceId: s.source.id,
          sourceLabel: label(s.source),
          targetId: s.target.id,
          targetLabel: label(s.target),
          score: s.score,
        }))}
      />
    </div>
  );
}
