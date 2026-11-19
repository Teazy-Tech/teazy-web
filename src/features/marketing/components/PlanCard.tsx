import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/plans";

/** One plan: name, price, call to action, what's included. Presentational only. */
export function PlanCard({
  plan,
  price,
  subPrice,
  cta,
  footer,
}: {
  plan: Plan;
  price: string;
  /** Small line under the price, e.g. the other currencies. */
  subPrice?: string;
  cta: ReactNode;
  footer?: ReactNode;
}) {
  const featured = plan.id === "standard";
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        "bg-card relative flex flex-col rounded-2xl border p-6 sm:p-8",
        featured && "border-primary shadow-card border-2",
        plan.id === "pro" && "border-cta border-2",
      )}
    >
      {plan.badge && (
        <p
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
            featured ? "bg-primary text-primary-foreground" : "bg-cta text-cta-foreground",
          )}
        >
          {plan.badge}
        </p>
      )}
      <h3 id={`plan-${plan.id}`} className="text-navy text-sm font-bold tracking-wider uppercase">
        {plan.name}
      </h3>
      <p className="text-muted-foreground mt-1 text-sm">{plan.tagline}</p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-navy text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/ {plan.period}</span>
      </p>
      {subPrice && <p className="text-muted-foreground mt-1 text-xs">{subPrice}</p>}
      <div className="mt-6">{cta}</div>
      <ul className="mt-6 flex flex-col gap-2.5 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="text-navy">{feature}</span>
          </li>
        ))}
        {plan.limits?.map((limit) => (
          <li key={limit} className="text-muted-foreground flex items-start gap-2">
            <Minus className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{limit}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-6 border-t pt-6">{footer}</div>}
    </article>
  );
}
