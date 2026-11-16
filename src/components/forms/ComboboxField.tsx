"use client";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FieldShell } from "./FieldShell";
import type { SelectOption } from "./SelectField";
import { useKitField, type KitFieldOptions } from "./useKitField";

interface ComboboxBaseProps extends KitFieldOptions {
  options: readonly SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Searchable choice from a long list (subjects, topics). With `multiple`, the
 * value is a string[] and chosen items show as chips with labelled remove buttons.
 */
export function ComboboxField({
  name,
  label,
  required,
  description,
  options,
  multiple = false,
  placeholder = "Search…",
  searchPlaceholder = "Type to search",
  emptyText = "No match found.",
  disabled,
  className,
}: ComboboxBaseProps & { multiple?: boolean }) {
  const [open, setOpen] = useState(false);
  const { field, helpers, id, error, errorId, descriptionId, controlProps } = useKitField<
    string | string[] | null
  >({ name, label, required, description });

  const selectedValues: string[] = Array.isArray(field.value)
    ? field.value
    : field.value
      ? [field.value]
      : [];
  const labelFor = (value: string) => options.find((o) => o.value === value)?.label ?? value;
  const listId = `${id}-list`;

  function choose(value: string) {
    if (multiple) {
      const next = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      void helpers.setValue(next);
    } else {
      void helpers.setValue(value);
      setOpen(false);
    }
  }

  function remove(value: string) {
    void helpers.setValue(multiple ? selectedValues.filter((v) => v !== value) : null);
  }

  const triggerText =
    multiple || selectedValues.length === 0 ? placeholder : labelFor(selectedValues[0]);

  return (
    <FieldShell {...{ id, label, required, description, descriptionId, error, errorId, className }}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) void helpers.setTouched(true);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            disabled={disabled}
            {...controlProps}
            className={cn(
              "h-11 w-full justify-between font-normal md:h-9",
              (multiple || selectedValues.length === 0) && "text-muted-foreground",
              "aria-invalid:border-destructive",
            )}
          >
            <span className="truncate">{triggerText}</span>
            <ChevronsUpDownIcon aria-hidden="true" className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} aria-label={`Search ${label}`} />
            <CommandList id={listId} aria-label={label}>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((o) => {
                  const selected = selectedValues.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={o.label}
                      onSelect={() => choose(o.value)}
                      aria-selected={selected}
                      data-checked={selected || undefined}
                    >
                      <CheckIcon
                        aria-hidden="true"
                        className={cn("size-4", selected ? "opacity-100" : "opacity-0")}
                      />
                      {o.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {multiple && selectedValues.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label={`Chosen ${label}`}>
          {selectedValues.map((value) => (
            <li
              key={value}
              className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-sm"
            >
              {labelFor(value)}
              <button
                type="button"
                onClick={() => remove(value)}
                aria-label={`Remove ${labelFor(value)}`}
                className="hover:bg-background focus-visible:ring-ring/50 rounded-full p-1 outline-none focus-visible:ring-[3px]"
              >
                <XIcon aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </FieldShell>
  );
}
