"use client";

import { getIn, useField, useFormikContext } from "formik";
import { fieldId, useFormKit, useRegisterField } from "./FormKitContext";

export interface KitFieldOptions {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
}

/**
 * Shared wiring for every form-kit field: Formik binding, registration with
 * the form, element ids, and when to show the error (after the field is
 * touched or after a submit attempt, never while the teacher is still typing
 * for the first time).
 */
export function useKitField<V = unknown>({
  name,
  label,
  required = false,
  description,
}: KitFieldOptions) {
  const [field, meta, helpers] = useField<V>(name);
  const { submitCount, errors } = useFormikContext();
  const { idPrefix } = useFormKit();
  useRegisterField(name, label, required);

  const id = fieldId(idPrefix, name);
  const rawError = getIn(errors, name) as unknown;
  const error = typeof rawError === "string" ? rawError : undefined;
  const showError = Boolean(error) && (meta.touched || submitCount > 0);
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = showError ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    field,
    meta,
    helpers,
    id,
    error: showError ? error : undefined,
    descriptionId,
    errorId,
    controlProps: {
      id,
      "aria-invalid": showError || undefined,
      "aria-describedby": describedBy,
      "aria-required": required || undefined,
    },
  };
}
