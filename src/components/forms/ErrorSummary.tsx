"use client";

import { useFormikContext } from "formik";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormKit } from "./FormKitContext";
import { useIncompleteFields } from "./useIncompleteFields";

/** Formik `status` shape for an error that belongs to the whole form (e.g. from the API). */
export interface FormStatus {
  formError?: string;
}

/**
 * Lists every problem at the top of the form after a submit attempt, with a
 * link that moves focus to each field. Focus moves here on every failed
 * submit, so screen-reader users hear what to fix. Put it first inside <Form>.
 *
 * For API failures, call `helpers.setStatus({ formError })` with a message
 * chosen by the error `code`; never pass the raw server text.
 */
export function ErrorSummary({ title = "Please fix the following" }: { title?: string }) {
  const { submitCount, isSubmitting, status } = useFormikContext();
  const incomplete = useIncompleteFields();
  const { idPrefix } = useFormKit();
  const titleId = `${idPrefix}-error-summary-title`;
  const ref = useRef<HTMLDivElement>(null);
  const lastFocusedAttempt = useRef(0);
  const formError = (status as FormStatus | undefined)?.formError;

  const show = submitCount > 0 && (incomplete.length > 0 || Boolean(formError));

  useEffect(() => {
    if (show && !isSubmitting && lastFocusedAttempt.current !== submitCount) {
      lastFocusedAttempt.current = submitCount;
      ref.current?.focus();
    }
  }, [show, isSubmitting, submitCount]);

  if (!show) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby={titleId}
      className="border-destructive/40 bg-destructive/5 focus-visible:ring-destructive/30 rounded-lg border p-4 outline-none focus-visible:ring-[3px]"
    >
      <p id={titleId} className="text-destructive flex items-center gap-2 font-medium">
        <AlertCircleIcon aria-hidden="true" className="size-4" />
        {formError && incomplete.length === 0 ? formError : title}
      </p>
      {incomplete.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
          {formError ? <li>{formError}</li> : null}
          {incomplete.map((f) => (
            <li key={f.name}>
              <a
                href={`#${f.id}`}
                className="text-destructive underline underline-offset-2"
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(f.id)?.focus();
                }}
              >
                {f.label}: {f.message}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
