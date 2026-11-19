"use client";

import Link from "next/link";
import { ASSESS_TOOLS, CREATE_TOOLS, type NavItem } from "@/components/layout";
import { useAppSelector } from "@/store/hooks";
import { selectSessionUser } from "@/store/slices/session";

/**
 * Where a teacher lands after sign-in: every tool, one tap away. The usage
 * panel (WEB-13) and assessment aggregates (API-14) are added here later.
 */
export function DashboardHome() {
  const user = useAppSelector(selectSessionUser);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-navy text-2xl font-bold sm:text-3xl">Welcome back</h1>
      {user?.email && (
        <p className="text-muted-foreground mt-1 text-sm">Signed in as {user.email}</p>
      )}
      <ToolGroup title="Create" tools={CREATE_TOOLS} />
      <ToolGroup title="Assess" tools={ASSESS_TOOLS} />
      <p className="text-muted-foreground mt-10 text-sm">
        Everything you save is in{" "}
        <Link href="/workspace" className="text-primary underline underline-offset-2">
          My Workspace
        </Link>
        .
      </p>
    </div>
  );
}

function ToolGroup({ title, tools }: { title: string; tools: readonly NavItem[] }) {
  return (
    <section className="mt-8" aria-labelledby={`dashboard-${title}`}>
      <h2 id={`dashboard-${title}`} className="text-navy text-lg font-semibold">
        {title}
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link
              href={tool.href}
              className="bg-card hover:border-primary/50 hover:shadow-soft flex h-full gap-3 rounded-xl border p-4 transition"
            >
              <tool.icon className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
              <span>
                <span className="text-navy block font-semibold">{tool.label}</span>
                <span className="text-muted-foreground mt-1 block text-sm">{tool.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
