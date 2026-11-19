import { SiteFooter, SiteHeader } from "@/components/layout";

// Public pages: static, header + footer, no tools sidebar.
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
