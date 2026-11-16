import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Label, optional description, the control, and the error line, in that order. */
export function FieldShell({
  id,
  label,
  required,
  description,
  descriptionId,
  error,
  errorId,
  className,
  labelAs = "label",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
  descriptionId?: string;
  error?: string;
  errorId?: string;
  className?: string;
  /** Use "legend" content (rendered as a plain span) for grouped controls. */
  labelAs?: "label" | "span";
  children: ReactNode;
}) {
  const labelContent = (
    <>
      {label}
      {required ? (
        <span aria-hidden="true" className="text-cta">
          {" "}
          *
        </span>
      ) : (
        <span className="text-muted-foreground font-normal"> (optional)</span>
      )}
    </>
  );
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {labelAs === "label" ? (
        <Label htmlFor={id}>{labelContent}</Label>
      ) : (
        <span id={`${id}-label`} className="text-sm leading-none font-medium">
          {labelContent}
        </span>
      )}
      {description ? (
        <p id={descriptionId} className="text-muted-foreground text-sm">
          {description}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
