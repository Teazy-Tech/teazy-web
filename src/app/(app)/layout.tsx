import { Suspense } from "react";
import { SiteHeader, ToolsBottomBar, ToolsSidebar } from "@/components/layout";

// Tool and personal pages: sidebar on desktop, bottom bar on phones.
// No marketing banner here (F-30): each tool page starts with its own heading.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader menu={false} />
      <div className="mx-auto flex w-full max-w-7xl flex-1">
        <Suspense>
          <ToolsSidebar />
        </Suspense>
        <main className="min-w-0 flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>
      <Suspense>
        <ToolsBottomBar />
      </Suspense>
    </>
  );
}
