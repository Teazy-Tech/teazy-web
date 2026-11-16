"use client";

import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { FieldShell } from "./FieldShell";
import { useKitField, type KitFieldOptions } from "./useKitField";

export interface SelectOption {
  value: string;
  label: string;
}

type NativeSelectProps = Omit<
  ComponentProps<"select">,
  "name" | "id" | "value" | "onChange" | "onBlur" | "required" | "children" | "multiple"
>;

/**
 * Single choice from a short, fixed list. Deliberately a styled native
 * <select>: on Android it opens the system picker, which is faster, lighter and
 * more accessible than a custom popup. Use ComboboxField for long or searchable lists.
 */
export function SelectField({
  name,
  label,
  required,
  description,
  className,
  options,
  placeholder = "Choose…",
  ...selectProps
}: KitFieldOptions &
  NativeSelectProps & { options: readonly SelectOption[]; placeholder?: string }) {
  const { field, id, error, errorId, descriptionId, controlProps } = useKitField<string>({
    name,
    label,
    required,
    description,
  });
  return (
    <FieldShell {...{ id, label, required, description, descriptionId, error, errorId, className }}>
      <div className="relative">
        <select
          {...selectProps}
          {...field}
          value={field.value ?? ""}
          {...controlProps}
          className={cn(
            "border-input bg-background h-11 w-full appearance-none rounded-md border px-3 pr-9 text-base shadow-xs md:h-9 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50",
            !field.value && "text-muted-foreground",
          )}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        />
      </div>
    </FieldShell>
  );
}
