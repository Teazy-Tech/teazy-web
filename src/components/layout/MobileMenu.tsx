"use client";

import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectIsSignedIn } from "@/store/slices/session";
import { navGroups, PUBLIC_LINKS } from "./nav";
import { NavList } from "./NavList";

const NavSheet = dynamic(() => import("./NavSheet"), { ssr: false });

/** Phone menu on public pages: site links plus every tool. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const signedIn = useAppSelector(selectIsSignedIn);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground md:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        <Menu className="size-5" />
      </Button>
      {requested && (
        <NavSheet
          open={open}
          onOpenChange={setOpen}
          side="right"
          title="Menu"
          description="Site pages and Teazy AI tools"
        >
          <nav aria-label="Menu" className="flex flex-col gap-5 px-4 pb-6">
            <ul className="flex flex-col gap-0.5">
              {PUBLIC_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="text-sidebar-foreground hover:bg-sidebar-accent flex min-h-11 items-center rounded-md px-3 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <NavList groups={navGroups(signedIn)} onNavigate={close} />
          </nav>
        </NavSheet>
      )}
    </>
  );
}
