"use client";

import { getIn, useFormikContext } from "formik";
import { CheckIcon, CircleIcon } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth/password";
import { cn } from "@/lib/utils";

/** Live checklist of the password rules, read by screen readers as a list. */
export function PasswordChecklist({ name = "password" }: { name?: string }) {
  const { values } = useFormikContext();
  const password = (getIn(values, name) as string | undefined) ?? "";
  return (
    <ul aria-label="Password rules" className="grid gap-1 text-sm sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2",
              met ? "text-success" : "text-muted-foreground",
            )}
          >
            {met ? (
              <CheckIcon aria-hidden="true" className="size-4" />
            ) : (
              <CircleIcon aria-hidden="true" className="size-3.5" />
            )}
            {rule.label}
            <span className="sr-only">{met ? " (done)" : " (not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
