export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="space-y-1 border border-border p-4">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
