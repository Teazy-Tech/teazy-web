"use client";

import { useFormikContext } from "formik";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormKit } from "./FormKitContext";
import { useIncompleteFields } from "./useIncompleteFields";

/**
 * The form's submit button. It is never a silent grey button (legacy "grey
 * button, no reason" finding): it is never disabled, not even with
 * aria-disabled (screen readers would announce it as unavailable). Once the
 * teacher has started filling the form, a hint below it names the fields still
 * missing; pressing it early shows the ErrorSummary instead of doing nothing.
 */
export function SubmitButton({
  children,
  pendingLabel = "Working…",
  className,
}: {
  children: ReactNode;
  /** Shown while the submit handler runs, e.g. "Generating lesson…". */
  pendingLabel?: string;
  className?: string;
}) {
  const { isSubmitting, dirty, submitCount } = useFormikContext();
  const { idPrefix } = useFormKit();
  const incomplete = useIncompleteFields();
  const hintId = `${idPrefix}-submit-hint`;
  // No hint on an untouched form: an empty sign-in form needs no explanation.
  const blocked = incomplete.length > 0 && (dirty || submitCount > 0);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="submit"
        size="lg"
        aria-busy={isSubmitting || undefined}
        aria-describedby={blocked ? hintId : undefined}
        onClick={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        className={cn("h-12 w-full sm:w-auto", className)}
      >
        {isSubmitting ? (
          <>
            <Loader2Icon aria-hidden="true" className="animate-spin" />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </Button>
      {blocked && !isSubmitting ? (
        <p id={hintId} className="text-muted-foreground text-sm">
          Still needed: {incomplete.map((f) => f.label).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
