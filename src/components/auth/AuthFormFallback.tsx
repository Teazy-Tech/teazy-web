import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder while the client form (which reads ?next=) streams in. */
export function AuthFormFallback() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
