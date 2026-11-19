import type { Metadata } from "next";
import { DashboardHome } from "@/features/dashboard";

export const metadata: Metadata = { title: "Dashboard · Teazy AI" };

export default function DashboardPage() {
  return <DashboardHome />;
}
