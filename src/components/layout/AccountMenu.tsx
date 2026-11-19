"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { useSignOut } from "@/components/auth/useSignOut";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERSONAL_ITEMS } from "./nav";

/** Signed-in account menu. Loaded on demand by HeaderAccount. */
export default function AccountMenu({ email }: { email: string | null }) {
  const signOut = useSignOut();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground"
          aria-label="Account menu"
        >
          <UserRound className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {email && (
          <DropdownMenuLabel className="text-muted-foreground truncate font-normal">
            {email}
          </DropdownMenuLabel>
        )}
        {PERSONAL_ITEMS.map((item) => (
          <DropdownMenuItem key={item.id} asChild>
            <Link href={item.href}>
              <item.icon />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
