import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFormFallback, SignUpPanel } from "@/components/auth";

export const metadata: Metadata = { title: "Create your account · Teazy AI" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-navy text-2xl font-semibold">Create your free account</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        Lesson notes, quizzes and marking for NERDC, NaCCA and CBC classrooms.
      </p>
      <Suspense fallback={<AuthFormFallback />}>
        <SignUpPanel />
      </Suspense>
    </>
  );
}
