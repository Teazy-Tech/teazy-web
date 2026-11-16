"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { FieldShell } from "./FieldShell";
import { useKitField, type KitFieldOptions } from "./useKitField";

type InputProps = Omit<
  ComponentProps<typeof Input>,
  "name" | "id" | "value" | "onChange" | "onBlur" | "required"
>;

export function TextField({
  name,
  label,
  required,
  description,
  className,
  ...inputProps
}: KitFieldOptions & InputProps) {
  const { field, id, error, errorId, descriptionId, controlProps } = useKitField<string>({
    name,
    label,
    required,
    description,
  });
  return (
    <FieldShell {...{ id, label, required, description, descriptionId, error, errorId, className }}>
      <Input {...inputProps} {...field} value={field.value ?? ""} {...controlProps} />
    </FieldShell>
  );
}
