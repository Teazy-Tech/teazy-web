import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth";

export const metadata: Metadata = { title: "Choose a new password · Teazy AI" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-navy text-center text-2xl font-bold">Choose a new password</h1>
      <p className="text-muted-foreground mt-2 mb-6 text-center text-sm">
        You&apos;ll stay signed in on this device.
      </p>
      <ResetPasswordForm />
    </>
  );
}
