import { listProfessors } from "@/lib/services/professors";
import { findMergeSuggestions } from "@/lib/fuzzy-match";
import { ProfessorMergeForm } from "@/components/admin/professor-merge-form";

// Refetch on every visit — this page has no dynamic APIs of its own (no
// searchParams/cookies read), so Next would otherwise treat it as static
// and keep serving a build-time snapshot after a merge.
export const dynamic = "force-dynamic";

export default async function ProfessorMergePage() {
  const professors = await listProfessors();
  // Professors with no reviews are typically unused typo variants that were
  // never actually picked in a submission — nothing to consolidate, so they
  // just add noise to the suggestion list. Still selectable manually below.
  const withReviews = professors.filter((p) => p._count.reviews > 0);
  const suggestions = findMergeSuggestions(withReviews, (p) => p.name).map((s) => ({
    sourceId: s.source.id,
    sourceLabel: s.source.name,
    targetId: s.target.id,
    targetLabel: s.target.name,
    score: s.score,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Merge duplicate professors</h2>
      <ProfessorMergeForm professors={professors.map((p) => ({ id: p.id, name: p.name }))} suggestions={suggestions} />
    </div>
  );
}
