"use client";

import { useRouter } from "next/navigation";
import { ErrorSummary, Form, SubmitButton, TextField } from "@/components/forms";
import { authErrorMessage } from "@/lib/auth/errors";
import { signInSchema } from "./auth.schema";
import { authClient, NOT_CONFIGURED_MESSAGE } from "./supabase";

/**
 * Email + password sign-in. On a page it navigates to `next`; inside the
 * auth-gate modal it calls `onSuccess` instead, so the teacher stays on the
 * tool page and the pending action resumes there.
 */
export function SignInForm({ next, onSuccess }: { next: string; onSuccess?: () => void }) {
  const router = useRouter();
  return (
    <Form
      schema={signInSchema}
      initialValues={{ email: "", password: "" }}
      aria-label="Sign in"
      onSubmit={async (values, helpers) => {
        helpers.setStatus(undefined);
        const supabase = authClient();
        if (!supabase) return helpers.setStatus({ formError: NOT_CONFIGURED_MESSAGE });
        const { error } = await supabase.auth.signInWithPassword(values);
        if (error) return helpers.setStatus({ formError: authErrorMessage(error) });
        if (onSuccess) onSuccess();
        else {
          router.replace(next);
          router.refresh();
        }
      }}
    >
      <ErrorSummary title="We couldn't sign you in" />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
      />
      <SubmitButton
        pendingLabel="Signing in…"
        className="bg-cta text-cta-foreground hover:bg-cta/90 h-11 sm:w-full"
      >
        Sign in
      </SubmitButton>
    </Form>
  );
}
