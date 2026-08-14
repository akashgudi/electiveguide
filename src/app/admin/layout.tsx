import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          No login required yet — this dashboard is open. Treat destructive actions with care.
        </p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
