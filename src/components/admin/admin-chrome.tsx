"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminChrome() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">Treat destructive actions with care.</p>
      </div>
      <AdminNav />
    </>
  );
}
