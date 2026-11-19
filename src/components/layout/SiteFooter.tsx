import Image from "next/image";
import Link from "next/link";
import { PUBLIC_LINKS } from "./nav";

const COMPANY_LINKS = [
  { label: "About", href: "https://www.teazytech.org/about" },
  { label: "Contact", href: "https://www.teazytech.org/contact" },
  { label: "Blog", href: "https://www.teazytech.org/blog" },
] as const;

const heading = "text-navy text-sm font-bold tracking-wider uppercase";
const link = "text-muted-foreground hover:text-primary text-sm transition-colors";

/**
 * Public footer, styled like the legacy home-page footer. Only links that go
 * somewhere real: Privacy and Terms are added when the legal text is
 * published (F-67), and social icons when the accounts are confirmed; never
 * as `href="#"`.
 */
export function SiteFooter() {
  return (
    <footer className="bg-secondary/40 border-t">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="shadow-soft flex size-10 items-center justify-center rounded-xl border bg-white p-1.5">
                <Image src="/brand/teazy-mark.png" alt="" width={26} height={30} />
              </span>
              <p className="text-navy text-lg font-bold">Teazy Tech</p>
            </div>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
              The AI teaching assistant built for African classrooms.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 md:col-span-2">
            <div>
              <p className={heading}>Product</p>
              <ul className="mt-4 flex flex-col gap-3">
                {PUBLIC_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={link}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={heading}>Company</p>
              <ul className="mt-4 flex flex-col gap-3">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className={link}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © Teazy Tech. Empowering teachers with technology.
          </p>
          <p className="text-muted-foreground text-xs">Made with care for African classrooms.</p>
        </div>
      </div>
    </footer>
  );
}
