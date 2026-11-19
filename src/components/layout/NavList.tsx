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
    <div className="flex flex-col gap-5">
      {groups.map((group, index) => (
        <section key={group.label} aria-labelledby={`${idPrefix}-${index}`}>
          <p
            id={`${idPrefix}-${index}`}
            className="text-muted-foreground mb-1 px-3 text-xs font-semibold tracking-wider uppercase"
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
                      "text-sidebar-foreground hover:bg-sidebar-accent flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      isCurrent &&
                        "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
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
