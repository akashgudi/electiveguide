import { listProfessors } from "@/lib/services/professors";
import { ProfessorMergeForm } from "@/components/admin/professor-merge-form";

export default async function ProfessorMergePage() {
  const professors = await listProfessors();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Merge duplicate professors</h2>
      <ProfessorMergeForm professors={professors.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  );
}
