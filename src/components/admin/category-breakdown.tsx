import { getCategoryBreakdown } from "@/lib/services/stats";

export async function CategoryBreakdown() {
  const rows = await getCategoryBreakdown();
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="space-y-1.5">
      {rows.map((row) => (
        <div key={row.category} className="flex items-center gap-3 text-sm">
          <span className="w-48 shrink-0 truncate text-muted-foreground">{row.category}</span>
          <div className="h-2 flex-1 bg-muted">
            <div className="h-full bg-primary" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
          <span className="w-10 shrink-0 text-right tabular-nums">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
