import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfessorEditForm } from "@/components/admin/professor-edit-form";

export default async function AdminProfessorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const professor = await prisma.professor.findUnique({ where: { id } });
  if (!professor) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Edit professor</h2>
      <ProfessorEditForm professor={{ id: professor.id, name: professor.name }} />
      {professor.rawVariants.length > 0 && (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Raw name variants on file:</p>
          <ul className="list-inside list-disc">
            {professor.rawVariants.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
