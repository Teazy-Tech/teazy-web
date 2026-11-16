import Link from "next/link";

// Shared frame for sign-in, sign-up and password pages: one narrow card, phone first.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-gradient-soft flex flex-1 flex-col items-center px-4 py-8 sm:py-16">
      <Link href="/" className="text-navy mb-6 text-xl font-semibold">
        Teazy <span className="text-cta">AI</span>
      </Link>
      <main className="bg-card shadow-card w-full max-w-md rounded-xl border p-5 sm:p-8">
        {children}
      </main>
    </div>
  );
}
