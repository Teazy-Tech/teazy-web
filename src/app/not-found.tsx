import type { Metadata } from "next";
import Link from "next/link";
import { CREATE_TOOLS, SiteFooter, SiteHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found · Teazy AI" };

// Inside the site frame, with useful next steps (F-57).
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-16">
        <p className="text-cta text-sm font-semibold">404</p>
        <h1 className="text-navy mt-2 text-3xl font-bold">We couldn&apos;t find that page</h1>
        <p className="text-muted-foreground mt-3">
          The link may be old or mistyped. These might help:
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Pricing</Link>
          </Button>
        </div>
        <h2 className="text-navy mt-10 font-semibold">Tools</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {CREATE_TOOLS.map((tool) => (
            <li key={tool.id}>
              <Link href={tool.href} className="text-primary underline underline-offset-2">
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
