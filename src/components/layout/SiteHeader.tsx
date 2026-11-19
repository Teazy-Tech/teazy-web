import { Suspense } from "react";
import { HeaderAccount } from "./HeaderAccount";
import { HeaderNav } from "./HeaderNav";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

/**
 * The one header for public and app pages. Server component; only the
 * session-aware and path-aware parts are client components.
 * `menu={false}` on app pages, where the bottom bar replaces the phone menu.
 */
export function SiteHeader({ menu = true }: { menu?: boolean }) {
  return (
    <header className="bg-navy sticky top-0 z-40 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <Suspense>
          <HeaderNav />
        </Suspense>
        <div className="flex items-center gap-1">
          <HeaderAccount />
          {menu && (
            <Suspense>
              <MobileMenu />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}
