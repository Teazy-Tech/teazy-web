"use client";

import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  CURRENCIES,
  currencyFromLocales,
  PER_DOWNLOAD_PRICE,
  PLANS,
  type Currency,
} from "@/lib/plans";
import { PlanCard } from "./PlanCard";
import { PlanCta } from "./PlanCta";

const noSubscribe = () => () => {};

/**
 * The three plans with a currency switch. The default currency follows the
 * browser's languages (Naira in the static HTML); the teacher can change it.
 */
export function PricingPlans() {
  const detected = useSyncExternalStore<Currency>(
    noSubscribe,
    () => currencyFromLocales(navigator.languages ?? [navigator.language]),
    () => "NGN",
  );
  const [chosen, setChosen] = useState<Currency | null>(null);
  const currency = chosen ?? detected;

  return (
    <>
      <div
        role="group"
        aria-label="Currency"
        className="bg-secondary mx-auto flex w-fit gap-1 rounded-lg p-1"
      >
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            type="button"
            aria-pressed={currency === c.code}
            onClick={() => setChosen(c.code)}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm font-semibold transition-colors",
              currency === c.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            price={plan.price[currency]}
            cta={<PlanCta plan={plan.id} />}
            footer={
              plan.id === "free" ? (
                <p className="text-muted-foreground text-sm">
                  Need just one file? Unlock a single PDF or Word download for{" "}
                  <span className="text-navy font-semibold">{PER_DOWNLOAD_PRICE[currency]}</span>,
                  no subscription.
                </p>
              ) : undefined
            }
          />
        ))}
      </div>
    </>
  );
}
