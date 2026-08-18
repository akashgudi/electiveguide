import Link from "next/link";

const links = [
  { href: "/", label: "Courses" },
  { href: "/bin", label: "My Bin" },
  { href: "/submit-review", label: "Submit a Review" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  return (
    <header className="border-b-2 border-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-primary">
          MGSA Peer Elective Guide
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
