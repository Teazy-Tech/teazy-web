"use client";

import { getIn, useFormikContext } from "formik";
import { fieldId, useFormKit } from "./FormKitContext";

export interface IncompleteField {
  name: string;
  id: string;
  label: string;
  message: string;
}

/** Registered fields that currently fail validation, in the order they registered. */
export function useIncompleteFields(): IncompleteField[] {
  const { errors } = useFormikContext();
  const { fields, idPrefix } = useFormKit();
  const result: IncompleteField[] = [];
  for (const [name, { label }] of fields) {
    const message = getIn(errors, name) as unknown;
    if (typeof message === "string")
      result.push({ name, id: fieldId(idPrefix, name), label, message });
  }
  return result;
}
