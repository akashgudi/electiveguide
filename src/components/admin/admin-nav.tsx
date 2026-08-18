import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/unverified", label: "Unverified queue" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/professors", label: "Professors" },
  { href: "/admin/reviews", label: "Reviews" },
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-4 border-b-2 border-primary/30 pb-3 text-sm">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-primary">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
