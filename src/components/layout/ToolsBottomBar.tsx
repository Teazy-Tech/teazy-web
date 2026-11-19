"use client";

import { LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectIsSignedIn } from "@/store/slices/session";
import { activeHref, bottomBarItems, navGroups } from "./nav";
import { NavList } from "./NavList";

const NavSheet = dynamic(() => import("./NavSheet"), { ssr: false });

const slot =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium";

/**
 * Phone navigation for the (app) area: the four most-used places, plus
 * "All tools", a sheet listing every tool (same list as the desktop sidebar).
 */
export function ToolsBottomBar() {
  const pathname = usePathname();
  const signedIn = useAppSelector(selectIsSignedIn);
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const items = bottomBarItems(signedIn);
  const current = activeHref(pathname, items);

  return (
    <nav
      aria-label="Tools"
      className="bg-background fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex">
        {items.map((item) => {
          const isCurrent = item.href === current;
          return (
            <li key={item.id} className="flex flex-1">
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(slot, isCurrent ? "text-primary" : "text-muted-foreground")}
              >
                <item.icon className="size-5" aria-hidden />
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(slot, "text-muted-foreground")}
            onClick={() => {
              setRequested(true);
              setOpen(true);
            }}
          >
            <LayoutGrid className="size-5" aria-hidden />
            All tools
          </button>
          {requested && (
            <NavSheet
              open={open}
              onOpenChange={setOpen}
              side="bottom"
              title="All tools"
              description="Every Teazy AI tool"
            >
              <div className="px-4 pb-6">
                <NavList groups={navGroups(signedIn)} onNavigate={() => setOpen(false)} />
              </div>
            </NavSheet>
          )}
        </li>
      </ul>
    </nav>
  );
}
