import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { toolById } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";
import { FEATURES, STEPS } from "../content";
import { Faq, faqJsonLd } from "./Faq";
import { PlanCard } from "./PlanCard";
import { PlanCta } from "./PlanCta";

/**
 * The public home page, ported from legacy HomePage.tsx as a static server
 * component. Dropped on purpose: framer-motion and the three rotating timers
 * (F-31), macOS window dots and amber stars (F-32), and the unconfirmed
 * testimonials and avatar row (F-66) until real quotes with permission exist.
 */
export function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static data from content.ts; no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Hero />
      <Section id="features" eyebrow="Features" title="Everything a modern teacher needs">
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg">
          One place for K-12 and Higher Ed teaching: plan, teach, practise and assess.
        </p>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const tool = toolById(feature.tool);
            return (
              <li key={feature.tool}>
                <Link
                  href={tool.href}
                  className="bg-card hover:shadow-card flex h-full flex-col rounded-2xl border p-6 transition-shadow sm:p-8"
                >
                  <span className="bg-gradient-primary flex size-11 items-center justify-center rounded-xl text-white">
                    <tool.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="text-navy mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 flex-1 leading-relaxed">
                    {feature.body}
                  </p>
                  <span className="mt-5 flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border-primary/20 text-primary rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        id="how-it-works"
        eyebrow="How Teazy AI works"
        title="Built for African classrooms"
        tinted
      >
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="bg-card rounded-2xl border p-6 sm:p-8">
              <span className="bg-gradient-primary flex size-10 items-center justify-center rounded-xl font-bold text-white">
                {index + 1}
              </span>
              <h3 className="text-navy mt-5 text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Priced for teachers, not enterprises">
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg">
          Start free. Usage resets every month. Upgrade when you need more.
        </p>
        <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              price={plan.price.NGN}
              subPrice={`${plan.price.GHS} · ${plan.price.KES}`}
              cta={<PlanCta plan={plan.id} />}
            />
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/pricing" className="text-primary font-medium underline underline-offset-2">
            Compare plans and prices in your currency
          </Link>
        </p>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Frequently asked questions" tinted narrow>
        <Faq />
      </Section>

      <section className="px-4 py-20">
        <div className="bg-gradient-cta shadow-elevated mx-auto max-w-6xl rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
          <h2 className="text-3xl font-bold text-balance text-white sm:text-5xl">
            Spend less time preparing.
            <span className="block text-white/80">Spend more time teaching.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
            Join teachers across Africa using Teazy AI to reclaim their evenings.
          </p>
          <Button
            asChild
            size="lg"
            className="text-navy mt-10 h-12 bg-white px-8 hover:bg-white/90"
          >
            <Link href="/lessons">
              Start using Teazy AI <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-hero px-4 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
      <div className="mx-auto max-w-4xl">
        <p className="border-primary/20 bg-primary/5 text-primary inline-flex rounded-full border px-3 py-1 text-xs font-semibold">
          Built for teachers in Nigeria, Ghana, Kenya and across Africa
        </p>
        <h1 className="text-navy mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl">
          AI Teaching Assistant for <span className="text-cta">African</span> Classrooms
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
          Generate curriculum-aligned lesson notes, quizzes, worksheets and presentations, and mark
          handwritten scripts, in minutes. Aligned to NERDC, NaCCA and CBC.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-cta text-cta-foreground hover:bg-cta/90 h-12 px-6"
          >
            <Link href="/lessons">
              Generate lesson notes <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6">
            <a href="#features">See features</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  eyebrow,
  title,
  tinted = false,
  narrow = false,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  tinted?: boolean;
  narrow?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={tinted ? "bg-gradient-soft px-4 py-20" : "px-4 py-20"}
    >
      <div className={narrow ? "mx-auto max-w-3xl" : "mx-auto max-w-6xl"}>
        <p className="text-primary text-center text-xs font-bold tracking-wider uppercase">
          {eyebrow}
        </p>
        <h2
          id={`${id}-title`}
          className="text-navy mt-3 text-center text-3xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
