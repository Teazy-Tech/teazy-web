import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand mark + product name. Uses the 7.6 KB mark, not the 138 KB legacy JPG
 * (F-31). It is a link, never an <h1>: each page owns its single <h1> (F-68).
 */
export function Logo({ href = "/", tone = "light" }: { href?: string; tone?: "light" | "dark" }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-3 rounded-md">
      <span className="bg-background flex size-9 items-center justify-center rounded-lg p-1.5">
        <Image src="/brand/teazy-mark.png" alt="" width={24} height={28} priority />
      </span>
      <span
        className={cn(
          "font-heading text-lg font-bold sm:text-xl",
          tone === "light" ? "text-navy-foreground" : "text-navy",
        )}
      >
        Teazy AI
      </span>
    </Link>
  );
}
