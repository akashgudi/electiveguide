import { AdminChrome } from "@/components/admin/admin-chrome";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <AdminChrome />
      {children}
    </div>
  );
}
