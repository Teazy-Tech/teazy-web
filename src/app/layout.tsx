import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthGateModal, AuthListener } from "@/components/auth";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import { StoreProvider } from "@/store/StoreProvider";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  // Absolute share and canonical URLs for WhatsApp and Google (F-68).
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: "Teazy AI",
  description: "AI teaching tools for African educators.",
  openGraph: { siteName: "Teazy AI", type: "website", locale: "en" },
  twitter: { card: "summary_large_image" },
};

// Root layout. Global providers only; keep this file small.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          {children}
          <AuthListener />
          <AuthGateModal />
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
