"use client";

import { MailCheckIcon } from "lucide-react";
import { useState } from "react";
import { ErrorSummary, Form, SubmitButton, TextField } from "@/components/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authErrorMessage } from "@/lib/auth/errors";
import { forgotPasswordSchema } from "./auth.schema";
import { authClient, callbackUrl, NOT_CONFIGURED_MESSAGE } from "./supabase";

/** Sends a reset link. The reply is the same whether or not the email has an account. */
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) {
    return (
      <Alert>
        <MailCheckIcon aria-hidden="true" />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          If {sentTo} has a Teazy account, we&apos;ve sent it a link to choose a new password. The
          link works for one hour. Check your spam folder if it doesn&apos;t arrive.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form
      schema={forgotPasswordSchema}
      initialValues={{ email: "" }}
      aria-label="Reset password"
      onSubmit={async ({ email }, helpers) => {
        helpers.setStatus(undefined);
        const supabase = authClient();
        if (!supabase) return helpers.setStatus({ formError: NOT_CONFIGURED_MESSAGE });
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: callbackUrl("/reset-password"),
        });
        // Rate limits and network failures are worth reporting; "no such user" is never returned.
        if (error) return helpers.setStatus({ formError: authErrorMessage(error) });
        setSentTo(email);
      }}
    >
      <ErrorSummary />
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
      />
      <SubmitButton
        pendingLabel="Sending…"
        className="bg-cta text-cta-foreground hover:bg-cta/90 h-11 sm:w-full"
      >
        Send reset link
      </SubmitButton>
    </Form>
  );
}
