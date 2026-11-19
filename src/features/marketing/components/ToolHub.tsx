import Link from "next/link";
import { toolById } from "@/components/layout";
import type { Hub } from "../content";

/** K-12 / Higher Ed landing: the tools for one audience, grouped. Static. */
export function ToolHub({ hub }: { hub: Hub }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-navy text-3xl font-bold sm:text-4xl">{hub.title}</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl">{hub.intro}</p>

      {hub.groups.map((group) => (
        <section key={group.title} className="mt-10">
          <h2 className="text-navy text-lg font-semibold">{group.title}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const tool = toolById(item.tool);
              const href = item.query ? `${tool.href}?${item.query}` : tool.href;
              return (
                <li key={item.tool}>
                  <Link
                    href={href}
                    className="bg-card hover:border-primary/50 hover:shadow-soft flex h-full gap-3 rounded-xl border p-4 transition"
                  >
                    <tool.icon className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />
                    <span>
                      <span className="text-navy block font-semibold">{tool.label}</span>
                      <span className="text-muted-foreground mt-1 block text-sm">
                        {item.description ?? tool.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-muted-foreground mt-12 text-sm">
        Looking for something else? Visit{" "}
        <Link href={hub.other.href} className="text-primary underline underline-offset-2">
          {hub.other.label}
        </Link>{" "}
        or open{" "}
        <Link href="/workspace" className="text-primary underline underline-offset-2">
          My Workspace
        </Link>{" "}
        for everything you have saved.
      </p>
    </div>
  );
}
