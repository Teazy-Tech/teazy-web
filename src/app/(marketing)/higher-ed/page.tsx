import type { Metadata } from "next";
import { HIGHER_ED_HUB, ToolHub } from "@/features/marketing";

export const metadata: Metadata = {
  title: "Higher Ed tools · Teazy AI",
  description:
    "Script marking against your own scheme, bulk marking, quizzes, rubrics and lecture slides for lecturers.",
  alternates: { canonical: "/higher-ed" },
};

export default function HigherEdPage() {
  return <ToolHub hub={HIGHER_ED_HUB} />;
}
