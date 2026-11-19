"use client";

import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * The sheet behind the phone menu and "All tools". Loaded on first tap
 * (next/dynamic), so the dialog code isn't in every page's first load.
 */
export default function NavSheet({
  open,
  onOpenChange,
  side,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: "right" | "bottom";
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={
          side === "bottom"
            ? "bg-sidebar max-h-[85svh] overflow-y-auto"
            : "bg-sidebar w-[85vw] max-w-sm overflow-y-auto"
        }
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
