import { ChevronDown } from "lucide-react";
import { FAQS } from "../content";

/** FAQ as native <details>: keyboard and screen-reader friendly with no JavaScript. */
export function Faq() {
  return (
    <div className="bg-card shadow-soft mt-10 divide-y rounded-2xl border">
      {FAQS.map((item) => (
        <details key={item.q} className="group px-5 sm:px-6">
          <summary className="text-navy flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="text-muted-foreground pb-5 leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** schema.org FAQPage data for search results. */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
