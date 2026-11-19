"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { activeHref, type NavGroup } from "./nav";

/**
 * Grouped tool links with the current page marked. Shared by the desktop
 * sidebar and the phone "All tools" sheet, so both always list the same
 * tools in the same order.
 */
export function NavList({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const idPrefix = useId();
  const current = activeHref(
    pathname,
    groups.flatMap((g) => g.items),
  );

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group, index) => (
        <section key={group.label} aria-labelledby={`${idPrefix}-${index}`}>
          <p
            id={`${idPrefix}-${index}`}
            className="text-sidebar-foreground/70 mb-1 flex h-8 items-center px-2 text-xs font-medium tracking-wide uppercase"
          >
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isCurrent = item.href === current;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex min-h-11 items-center gap-2 rounded-md px-2 text-sm transition-colors md:min-h-9",
                      isCurrent && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
