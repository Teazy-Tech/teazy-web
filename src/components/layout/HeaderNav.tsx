"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PUBLIC_LINKS } from "./nav";

/** Desktop public links. The phone equivalents live in MobileMenu. */
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Site" className="hidden items-center gap-1 md:flex">
      {PUBLIC_LINKS.map((link) => {
        const current = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "text-navy-foreground/85 hover:bg-navy-foreground/10 hover:text-navy-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
              current && "bg-navy-foreground/15 text-navy-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
