"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorSummary, Form, SubmitButton, TextField } from "@/components/forms";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { authErrorMessage } from "@/lib/auth/errors";
import { isSupabaseConfigured } from "@/lib/env";
import { DEFAULT_SIGNED_IN_PATH } from "@/lib/auth/routes";
import { resetPasswordSchema } from "./auth.schema";
import { PasswordChecklist } from "./PasswordChecklist";
import { authClient, NOT_CONFIGURED_MESSAGE } from "./supabase";

/**
 * Choose a new password. The reset email link signs the teacher in through
 * /auth/callback, so a session must exist here; otherwise the link expired.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ready" | "expired">(() =>
    isSupabaseConfigured() ? "checking" : "expired",
  );

  useEffect(() => {
    const supabase = authClient();
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setState(data.session ? "ready" : "expired");
    });
    return () => {
      active = false;
    };
  }, []);

  if (state === "checking") return <Skeleton className="h-48 w-full" />;
  if (state === "expired") {
    return (
      <Alert variant="destructive">
        <AlertTitle>This reset link has expired</AlertTitle>
        <AlertDescription>
          <p>
            Reset links work once, for one hour.{" "}
            <Link href="/forgot-password" className="underline underline-offset-2">
              Request a new link
            </Link>
            .
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form
      schema={resetPasswordSchema}
      initialValues={{ password: "", confirmPassword: "" }}
      aria-label="Choose a new password"
      onSubmit={async ({ password }, helpers) => {
        helpers.setStatus(undefined);
        const supabase = authClient();
        if (!supabase) return helpers.setStatus({ formError: NOT_CONFIGURED_MESSAGE });
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return helpers.setStatus({ formError: authErrorMessage(error) });
        toast.success("Your password has been changed.");
        router.replace(DEFAULT_SIGNED_IN_PATH);
        router.refresh();
      }}
    >
      <ErrorSummary />
      <TextField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
      />
      <PasswordChecklist />
      <TextField
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
      />
      <SubmitButton pendingLabel="Saving…" className="sm:w-full">
        Save new password
      </SubmitButton>
    </Form>
  );
}
