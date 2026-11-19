/**
 * Plan names, prices and allowances as shown to teachers. One vocabulary
 * everywhere: Free · Teazy AI Pro · Assessment Pro (F-18, F-38).
 *
 * Display copy only. The API enforces limits and charges; when `GET /plans`
 * lands (API-13), WEB-15 reads prices from it and this file keeps only the
 * wording. Values match legacy `src/lib/pricing.ts`.
 */
export type Currency = "NGN" | "GHS" | "KES";

export const CURRENCIES: readonly { code: Currency; label: string; country: string }[] = [
  { code: "NGN", label: "₦ Naira", country: "Nigeria" },
  { code: "GHS", label: "GH₵ Cedi", country: "Ghana" },
  { code: "KES", label: "KSh Shilling", country: "Kenya" },
];

export type PlanId = "free" | "standard" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price per currency. */
  price: Record<Currency, string>;
  period: string;
  features: readonly string[];
  limits?: readonly string[];
  badge?: string;
}

/** Free monthly allowances (the server enforces the same values). */
export const FREE_MONTHLY = {
  lesson: 10,
  quiz: 10,
  worksheet: 2,
  slides: 2,
  video: 1,
  writing: 2,
} as const;

export const PER_DOWNLOAD_PRICE: Record<Currency, string> = {
  NGN: "₦500",
  GHS: "GH₵5",
  KES: "KSh50",
};

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For teachers exploring Teazy AI.",
    price: { NGN: "₦0", GHS: "GH₵0", KES: "KSh0" },
    period: "forever",
    features: [
      `${FREE_MONTHLY.lesson} lesson notes per month`,
      `${FREE_MONTHLY.quiz} quizzes per month`,
      `${FREE_MONTHLY.worksheet} worksheets per month`,
      `${FREE_MONTHLY.slides} presentation slide decks per month`,
      `${FREE_MONTHLY.video} animated video per month`,
      `${FREE_MONTHLY.writing} Writing Assessment uploads per month`,
      "Usage resets every month",
    ],
    limits: ["No editing", "No PDF or Word downloads"],
  },
  {
    id: "standard",
    name: "Teazy AI Pro",
    tagline: "For everyday lesson preparation.",
    price: { NGN: "₦3,000", GHS: "GH₵30", KES: "KSh300" },
    period: "month",
    badge: "Most popular",
    features: [
      "Everything in Free",
      "Unlimited lesson notes and quizzes",
      "Worksheet designer",
      "Presentation slides",
      "Animated video generation",
      "Unlimited lesson editing",
      "Unlimited PDF and Word downloads",
      "40 Writing Assessment uploads per month",
      "Assessment history",
    ],
  },
  {
    id: "pro",
    name: "Assessment Pro",
    tagline: "For schools and lecturers who mark a lot.",
    price: { NGN: "₦8,000", GHS: "GH₵80", KES: "KSh800" },
    period: "month",
    badge: "For schools and lecturers",
    features: [
      "Everything in Teazy AI Pro",
      "Up to 1000 handwritten scripts per month",
      "Bulk marking of many scripts at once",
      "Mark against your own marking scheme and question paper",
      "Saved marking schemes",
      "Subject and course folders",
      "Teacher dashboard with analytics and student reports",
      "Excel and CSV export",
      "Priority AI processing",
    ],
  },
];

export function planById(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

/** Display currency from the browser's languages (e.g. en-KE → KES); Naira otherwise. */
export function currencyFromLocales(locales: readonly string[]): Currency {
  for (const locale of locales) {
    const up = locale.toUpperCase();
    if (up.endsWith("-KE") || up.startsWith("SW")) return "KES";
    if (up.endsWith("-GH")) return "GHS";
    if (up.endsWith("-NG")) return "NGN";
  }
  return "NGN";
}
