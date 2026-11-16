import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/store/StoreProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teazy AI",
  description: "AI teaching tools for African educators.",
};

// Root layout. Global providers only; keep this file small.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
