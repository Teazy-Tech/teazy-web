"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { SignUpForm } from "./SignUpForm";
import { safeNextPath } from "@/lib/auth/routes";

export function SignUpPanel() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const nextQuery = params.get("next") ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="flex flex-col gap-4">
      <GoogleButton next={next} />
      <OrDivider />
      <SignUpForm next={next} />
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href={`/sign-in${nextQuery}`}
          className="text-primary font-medium underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
