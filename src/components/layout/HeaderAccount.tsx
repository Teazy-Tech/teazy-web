"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectSessionStatus, selectSessionUser } from "@/store/slices/session";

const onNavy = "text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground";

// Only signed-in teachers need the menu, so visitors don't download it.
const AccountMenu = dynamic(() => import("./AccountMenu"), {
  ssr: false,
  loading: () => <div aria-hidden className="size-9" />,
});

/**
 * Right side of the header. Signed out: Sign in + Start free. Signed in: an
 * account menu. Plan badges and "Upgrade" arrive with billing (WEB-15).
 */
export function HeaderAccount() {
  const status = useAppSelector(selectSessionStatus);
  const user = useAppSelector(selectSessionUser);

  // Reserve the space until the auth client reports, so nothing jumps.
  if (status === "unknown") return <div aria-hidden className="h-9 w-36" />;

  if (status === "signedIn") return <AccountMenu email={user?.email ?? null} />;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button asChild variant="ghost" size="sm" className={onNavy}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" className="bg-cta text-cta-foreground hover:bg-cta/90">
        <Link href="/sign-up">Start free</Link>
      </Button>
    </div>
  );
}
