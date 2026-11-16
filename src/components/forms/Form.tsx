"use client";

import {
  Formik,
  Form as FormikForm,
  type FormikHelpers,
  type FormikProps,
  type FormikValues,
} from "formik";
import { useId, useMemo, type ReactNode } from "react";
import type { z } from "zod";
import { toFormikValidate } from "zod-formik-adapter";
import { cn } from "@/lib/utils";
import { FormKitProvider } from "./FormKitContext";

export interface FormProps<S extends z.ZodType<FormikValues, FormikValues>> {
  /** The feature's Zod schema (`<feature>.schema.ts`). Validation runs on every change. */
  schema: S;
  initialValues: z.input<S>;
  /** Receives the values parsed by `schema`, so trimming/coercion has already happened. */
  onSubmit: (values: z.output<S>, helpers: FormikHelpers<z.input<S>>) => void | Promise<void>;
  /** Accessible name of the form, e.g. "Lesson details". */
  "aria-label"?: string;
  className?: string;
  /** Re-initialise when `initialValues` changes (e.g. a pending action was restored). */
  enableReinitialize?: boolean;
  children: ReactNode | ((formik: FormikProps<z.input<S>>) => ReactNode);
}

/**
 * Formik wrapper used by every tool form. Pair it with the kit's fields,
 * `ErrorSummary` at the top and `SubmitButton` at the bottom.
 */
export function Form<S extends z.ZodType<FormikValues, FormikValues>>({
  schema,
  initialValues,
  onSubmit,
  className,
  enableReinitialize,
  children,
  ...rest
}: FormProps<S>) {
  const idPrefix = useId().replace(/:/g, "");
  const validate = useMemo(() => toFormikValidate(schema), [schema]);

  return (
    <Formik<z.input<S>>
      initialValues={initialValues}
      validate={validate as (values: z.input<S>) => Promise<Record<string, unknown> | undefined>}
      validateOnMount
      enableReinitialize={enableReinitialize}
      onSubmit={(values, helpers) => onSubmit(schema.parse(values), helpers)}
    >
      {(formik) => (
        <FormKitProvider idPrefix={idPrefix}>
          <FormikForm
            // POST, so a submit before hydration (slow 3G) can never put
            // field values such as passwords into the URL, history or logs.
            method="post"
            noValidate
            aria-label={rest["aria-label"]}
            className={cn("flex flex-col gap-5", className)}
          >
            {typeof children === "function" ? children(formik) : children}
          </FormikForm>
        </FormKitProvider>
      )}
    </Formik>
  );
}
