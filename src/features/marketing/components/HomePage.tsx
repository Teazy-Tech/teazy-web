import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Globe,
  GraduationCap,
  Play,
  Shield,
  Zap,
} from "lucide-react";
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
      <TrustBar />
      <Section id="features" eyebrow="Features" title="Everything a modern teacher needs">
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg">
          One place for K-12 and Higher Ed teaching: plan, teach, practise and assess.
        </p>
        <ul className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const tool = toolById(feature.tool);
            return (
              <li key={feature.tool}>
                <Link
                  href={tool.href}
                  className="group bg-card hover:shadow-elevated relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 sm:p-8"
                >
                  <span
                    aria-hidden
                    className="from-primary/10 to-primary/0 pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60"
                  />
                  <span className="bg-gradient-primary shadow-glow relative flex size-12 items-center justify-center rounded-xl text-white">
                    <tool.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="text-navy relative mt-5 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground relative mt-2 min-h-[72px] flex-1 leading-relaxed">
                    {feature.body}
                  </p>
                  <span className="relative mt-5 flex flex-wrap gap-2">
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
        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="bg-card hover:shadow-card h-full rounded-2xl border p-6 transition-shadow sm:p-8">
                <span className="bg-gradient-primary shadow-glow flex size-10 items-center justify-center rounded-xl font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="text-navy mt-5 text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{step.body}</p>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight
                  aria-hidden
                  className="text-primary/40 absolute top-1/2 -right-5 hidden size-6 -translate-y-1/2 md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Priced for teachers, not enterprises" tinted>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-center text-lg">
          Start free. Usage resets every month. Upgrade when you need more.
        </p>
        <div className="mx-auto mt-16 grid max-w-5xl items-stretch gap-6 md:grid-cols-3">
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

      <Section id="faq" eyebrow="FAQ" title="Frequently asked questions" narrow>
        <Faq />
      </Section>

      <section className="px-4 py-24">
        <div className="bg-gradient-cta shadow-elevated relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-12 text-center sm:p-16 lg:p-20">
          <div
            aria-hidden
            className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)] opacity-20"
          />
          <div
            aria-hidden
            className="bg-primary-glow/40 absolute -top-20 left-1/2 size-64 -translate-x-1/2 rounded-full blur-3xl"
          />
          <div className="relative">
            <GraduationCap className="mx-auto size-12 text-white" aria-hidden />
            <h2 className="mt-6 text-4xl leading-tight font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              Spend less time preparing.
              <span className="block text-white/80">Spend more time teaching.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
              Join teachers across Africa using Teazy AI to reclaim their evenings.
            </p>
            <Button
              asChild
              size="lg"
              className="text-navy shadow-glow mt-10 h-14 bg-white px-8 text-base hover:bg-white/90"
            >
              <Link href="/lessons">
                Start using Teazy AI <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
      <div aria-hidden className="bg-gradient-hero absolute inset-0" />
      <div
        aria-hidden
        className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] opacity-40"
      />
      <div className="relative mx-auto max-w-4xl">
        <p className="border-primary/20 bg-primary/5 text-primary inline-flex rounded-full border px-3 py-1 text-xs font-semibold">
          Built for teachers in Nigeria, Ghana, Kenya and across Africa
        </p>
        <h1 className="text-navy mt-6 text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
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
            className="bg-gradient-primary shadow-glow h-12 px-6 text-base transition-all hover:scale-[1.02] hover:opacity-90"
          >
            <Link href="/lessons">
              Generate lesson notes <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
            <a href="#features">
              <Play aria-hidden /> See features
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: Zap, label: "AI Powered" },
  { icon: Globe, label: "Built for African Schools" },
  { icon: BookOpen, label: "Curriculum Aligned" },
  { icon: Shield, label: "Trusted by Educators" },
] as const;

function TrustBar() {
  return (
    <div className="bg-secondary/40 border-y">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
        {TRUST.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="text-muted-foreground flex items-center justify-center gap-2 text-center text-sm font-semibold"
          >
            <Icon className="text-primary size-4 shrink-0" aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </div>
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
      className={tinted ? "bg-gradient-soft px-4 py-24" : "px-4 py-24 sm:py-32"}
    >
      <div className={narrow ? "mx-auto max-w-3xl" : "mx-auto max-w-6xl"}>
        <p className="text-primary text-center text-xs font-bold tracking-wider uppercase">
          {eyebrow}
        </p>
        <h2
          id={`${id}-title`}
          className="text-navy mt-3 text-center text-4xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
