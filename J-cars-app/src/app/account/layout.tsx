import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { requireRole } from "@/lib/auth/roles";

const ACCOUNT_NAV = [
  { href: "/account", label: "Summary" },
  { href: "/account/favorites", label: "Favorites" },
  { href: "/account/searches", label: "Saved searches" },
  { href: "/account/inquiries", label: "Inquiries" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/invoices", label: "Invoices" },
  { href: "/account/profile", label: "Profile" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["client", "sales", "inventory_manager", "admin"]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-10">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="flex flex-col gap-1" aria-label="Account">
            {ACCOUNT_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <Footer />
    </>
  );
}
