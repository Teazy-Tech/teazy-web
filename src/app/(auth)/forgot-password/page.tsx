import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth";

export const metadata: Metadata = { title: "Reset your password · Teazy AI" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-navy text-center text-2xl font-bold">Reset your password</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-center text-sm">
        Enter the email you signed up with and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/sign-in" className="text-primary underline underline-offset-2">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
