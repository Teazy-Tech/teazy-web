"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { SignInForm } from "./SignInForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { safeNextPath } from "@/lib/auth/routes";

export function SignInPanel() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const nextQuery = params.get("next") ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="flex flex-col gap-4">
      {params.get("error") === "link" ? (
        <Alert variant="destructive">
          <AlertDescription>
            That sign-in link has expired or was already used. Please sign in again.
          </AlertDescription>
        </Alert>
      ) : null}
      <GoogleButton next={next} />
      <OrDivider />
      <SignInForm next={next} />
      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href="/forgot-password" className="text-primary underline underline-offset-2">
          Forgot your password?
        </Link>
        <p className="text-muted-foreground">
          New to Teazy?{" "}
          <Link
            href={`/sign-up${nextQuery}`}
            className="text-primary font-medium underline underline-offset-2"
          >
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}
