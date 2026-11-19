"use client";

import { useAppSelector } from "@/store/hooks";
import { selectIsSignedIn } from "@/store/slices/session";
import { navGroups } from "./nav";
import { NavList } from "./NavList";

/** Desktop tools sidebar for the (app) area. Hidden below `md`; phones get ToolsBottomBar. */
export function ToolsSidebar() {
  const signedIn = useAppSelector(selectIsSignedIn);
  return (
    <aside className="bg-sidebar border-sidebar-border sticky top-[61px] hidden h-[calc(100svh-61px)] w-64 shrink-0 overflow-y-auto border-r p-2 py-4 md:block">
      <nav aria-label="Tools">
        <NavList groups={navGroups(signedIn)} />
      </nav>
    </aside>
  );
}
