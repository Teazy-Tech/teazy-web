"use client";

import { useAppSelector } from "@/store/hooks";
import { selectIsSignedIn } from "@/store/slices/session";
import { navGroups } from "./nav";
import { NavList } from "./NavList";

/** Desktop tools sidebar for the (app) area. Hidden below `md`; phones get ToolsBottomBar. */
export function ToolsSidebar() {
  const signedIn = useAppSelector(selectIsSignedIn);
  return (
    <aside className="bg-sidebar border-sidebar-border sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 overflow-y-auto border-r px-3 py-5 md:block">
      <nav aria-label="Tools">
        <NavList groups={navGroups(signedIn)} />
      </nav>
    </aside>
  );
}
