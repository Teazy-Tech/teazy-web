"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Friendly fallback for unexpected errors; never shows the raw message (F-22).
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16">
      <h1 className="text-navy text-3xl font-bold">Something went wrong</h1>
      <p className="text-muted-foreground mt-3">
        This page hit a problem. Your saved work is safe. Try again, or go back home.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
