import type { Metadata } from "next";
import { PricingPlans } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Pricing · Teazy AI",
  description:
    "Free forever plan, Teazy AI Pro from ₦3,000 a month, and Assessment Pro for heavy marking. Prices in naira, cedi and shilling.",
  alternates: { canonical: "/pricing" },
};

// Static plans for now; checkout and plan preselection arrive in WEB-15.
export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-navy text-3xl font-bold sm:text-5xl">
          Simple pricing that grows with you
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl">
          Built for teachers in Nigeria, Ghana and Kenya. Start free, upgrade when you need more.
        </p>
      </div>
      <PricingPlans />
    </div>
  );
}
