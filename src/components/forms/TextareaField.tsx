"use client";

import type { ComponentProps } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FieldShell } from "./FieldShell";
import { useKitField, type KitFieldOptions } from "./useKitField";

type TextareaProps = Omit<
  ComponentProps<typeof Textarea>,
  "name" | "id" | "value" | "onChange" | "onBlur" | "required"
>;

export function TextareaField({
  name,
  label,
  required,
  description,
  className,
  maxLength,
  ...textareaProps
}: KitFieldOptions & TextareaProps) {
  const { field, id, error, errorId, descriptionId, controlProps } = useKitField<string>({
    name,
    label,
    required,
    description,
  });
  const value = field.value ?? "";
  return (
    <FieldShell {...{ id, label, required, description, descriptionId, error, errorId, className }}>
      <Textarea
        {...textareaProps}
        {...field}
        value={value}
        maxLength={maxLength}
        {...controlProps}
      />
      {maxLength ? (
        <p className="text-muted-foreground self-end text-xs" aria-live="polite">
          {value.length} / {maxLength}
        </p>
      ) : null}
    </FieldShell>
  );
}
