import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormFallback, SignInPanel } from "@/components/auth";

export const metadata: Metadata = { title: "Sign in · Teazy AI" };

export default function SignInPage() {
  return (
    <>
      <h1 className="text-navy text-2xl font-semibold">Welcome back</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">Sign in to your Teazy AI account.</p>
      <Suspense fallback={<AuthFormFallback />}>
        <SignInPanel />
      </Suspense>
    </>
  );
}
