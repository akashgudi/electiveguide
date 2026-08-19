import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";

const links = [
  { href: "/", label: "Courses" },
  { href: "/bin", label: "My Bin" },
  { href: "/submit-review", label: "Submit a Review" },
  { href: "/admin", label: "Admin" },
];

export function Nav() {
  return (
    <header className="relative border-b-2 border-primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="truncate text-base font-semibold tracking-tight text-primary sm:text-lg">
          MGSA Peer Elective Guide
        </Link>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
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
        <MobileNav links={links} />
      </div>
    </header>
  );
}
