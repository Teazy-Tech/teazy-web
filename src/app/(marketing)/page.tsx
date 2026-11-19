import type { Metadata } from "next";
import { HomePage } from "@/features/marketing";

export const metadata: Metadata = {
  title: "AI Teaching Assistant for African Classrooms · Teazy AI",
  description:
    "Generate curriculum-aligned lesson notes, quizzes and presentations, and mark handwritten scripts in minutes. Built for teachers in Nigeria, Ghana and Kenya.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePage />;
}
