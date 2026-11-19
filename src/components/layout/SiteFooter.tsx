import Link from "next/link";
import { PUBLIC_LINKS } from "./nav";

const COMPANY_LINKS = [
  { label: "About", href: "https://www.teazytech.org/about" },
  { label: "Contact", href: "https://www.teazytech.org/contact" },
  { label: "Blog", href: "https://www.teazytech.org/blog" },
] as const;

/**
 * Public footer. Only links that go somewhere real: Privacy and Terms are
 * added when the legal text is published (F-67), never as `href="#"`.
 */
export function SiteFooter() {
  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <p className="text-navy font-semibold">Teazy Tech</p>
          <p className="text-muted-foreground mt-2 text-sm">
            The AI teaching assistant built for African classrooms.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm">
          <ul className="flex flex-col gap-2">
            {PUBLIC_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="text-muted-foreground border-t py-4 text-center text-xs">
        © Teazy Tech. Empowering teachers with technology.
      </p>
    </footer>
  );
}
