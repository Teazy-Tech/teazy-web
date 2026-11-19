"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectIsSignedIn } from "@/store/slices/session";

const LABELS: Record<PlanId, string> = {
  free: "Start free",
  standard: "Sign up for Teazy AI Pro",
  pro: "Sign up for Assessment Pro",
};

/**
 * Signed out (and before the session is known, so the static HTML works):
 * a sign-up link that returns to pricing with the plan named, for WEB-15's
 * checkout to preselect. Signed in: Free goes to the dashboard; the paid
 * buttons arrive with checkout in WEB-15.
 */
export function PlanCta({ plan }: { plan: PlanId }) {
  const signedIn = useAppSelector(selectIsSignedIn);
  const className = cn(
    "h-11 w-full",
    plan === "standard" && "bg-gradient-primary shadow-glow text-white hover:opacity-90",
    plan === "pro" && "bg-cta text-cta-foreground hover:bg-cta/90",
  );

  if (signedIn) {
    if (plan !== "free") return null;
    return (
      <Button asChild variant="outline" className={className}>
        <Link href="/dashboard">Go to your dashboard</Link>
      </Button>
    );
  }

  const href =
    plan === "free" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(`/pricing?plan=${plan}`)}`;
  return (
    <Button asChild variant={plan === "free" ? "outline" : "default"} className={className}>
      <Link href={href}>{LABELS[plan]}</Link>
    </Button>
  );
}
