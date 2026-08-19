import Link from "next/link";
import { logoutAction } from "@/actions/admin-auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/unverified", label: "Unverified queue" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/professors", label: "Professors" },
  { href: "/admin/reviews", label: "Reviews" },
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-primary/30 pb-3 text-sm">
      <div className="flex flex-wrap gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-primary">
            {l.label}
          </Link>
        ))}
      </div>
      <form action={logoutAction}>
        <button type="submit" className="text-muted-foreground transition-colors hover:text-primary">
          Log out
        </button>
      </form>
    </nav>
  );
}
