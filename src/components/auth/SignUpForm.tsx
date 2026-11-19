"use client";

import { MailCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorSummary, Form, SubmitButton, TextField } from "@/components/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authErrorMessage } from "@/lib/auth/errors";
import { signUpSchema } from "./auth.schema";
import { PasswordChecklist } from "./PasswordChecklist";
import { authClient, callbackUrl, NOT_CONFIGURED_MESSAGE } from "./supabase";

/**
 * Sign-up with the legacy password rules. With email auto-confirm (current
 * production setting) the teacher is signed in straight away; if the project
 * requires confirmation, we show "check your email" instead.
 */
export function SignUpForm({ next, onSuccess }: { next: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  if (confirmEmail) {
    return (
      <Alert>
        <MailCheckIcon aria-hidden="true" />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          We sent a confirmation link to {confirmEmail}. Open it on this phone to finish creating
          your account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form
      schema={signUpSchema}
      initialValues={{ displayName: "", email: "", password: "", confirmPassword: "" }}
      aria-label="Create account"
      onSubmit={async ({ displayName, email, password }, helpers) => {
        helpers.setStatus(undefined);
        const supabase = authClient();
        if (!supabase) return helpers.setStatus({ formError: NOT_CONFIGURED_MESSAGE });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: callbackUrl(next),
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) return helpers.setStatus({ formError: authErrorMessage(error) });
        if (!data.session) return setConfirmEmail(email);
        if (onSuccess) onSuccess();
        else {
          router.replace(next);
          router.refresh();
        }
      }}
    >
      <ErrorSummary title="We couldn't create your account" />
      <TextField
        name="displayName"
        label="Your name"
        autoComplete="name"
        description="Shown on your account."
      />
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
        autoComplete="new-password"
        required
      />
      <PasswordChecklist />
      <TextField
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
      />
      <SubmitButton pendingLabel="Creating account…" className="sm:w-full">
        Create account
      </SubmitButton>
    </Form>
  );
}
