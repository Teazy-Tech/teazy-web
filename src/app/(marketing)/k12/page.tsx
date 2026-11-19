import type { Metadata } from "next";
import { K12_HUB, ToolHub } from "@/features/marketing";

export const metadata: Metadata = {
  title: "K-12 tools · Teazy AI",
  description:
    "Lesson notes, quizzes, worksheets, slides and script marking for primary and secondary teachers.",
  alternates: { canonical: "/k12" },
};

export default function K12Page() {
  return <ToolHub hub={K12_HUB} />;
}
