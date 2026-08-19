import { listProfessors } from "@/lib/services/professors";
import { findMergeSuggestions } from "@/lib/fuzzy-match";
import { ProfessorMergeForm } from "@/components/admin/professor-merge-form";

export default async function ProfessorMergePage() {
  const professors = await listProfessors();
  const suggestions = findMergeSuggestions(professors, (p) => p.name).map((s) => ({
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
