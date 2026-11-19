import { SiteFooter, SiteHeader } from "@/components/layout";

// Shared frame for sign-in, sign-up and password pages: the site header and
// footer around one narrow, centred card (the legacy auth page's look).
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-[80vh] flex-1 items-center justify-center px-4 py-12">
        <main className="bg-card w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-8">
          {children}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
