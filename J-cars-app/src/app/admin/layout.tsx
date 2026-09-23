import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { requireRole } from "@/lib/auth/roles";
import type { Role } from "@/types";

const ALL_STAFF: readonly Role[] = ["admin", "sales", "inventory_manager"];

// Mirrors each page's own requireRole() so nobody sees a link that just
// bounces them back to the home page.
const ADMIN_NAV: { href: string; label: string; roles: readonly Role[] }[] = [
  { href: "/admin", label: "Dashboard", roles: ALL_STAFF },
  { href: "/admin/vehicles", label: "Vehicles", roles: ALL_STAFF },
  { href: "/admin/promotions", label: "Promotions", roles: ["admin", "inventory_manager"] },
  { href: "/admin/catalog", label: "Catalog", roles: ALL_STAFF },
  { href: "/admin/inquiries", label: "Inquiries", roles: ALL_STAFF },
  { href: "/admin/quotes", label: "Quotes", roles: ALL_STAFF },
  { href: "/admin/orders", label: "Orders", roles: ALL_STAFF },
  { href: "/admin/payments", label: "Payments", roles: ["admin", "sales"] },
  { href: "/admin/shipping", label: "Shipping", roles: ALL_STAFF },
  { href: "/admin/customers", label: "Customers", roles: ["admin", "sales"] },
  { href: "/admin/content", label: "Content", roles: ["admin"] },
  { href: "/admin/settings", label: "Settings", roles: ["admin"] },
  { href: "/admin/audit", label: "Audit log", roles: ["admin"] },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(ALL_STAFF);
  const nav = ADMIN_NAV.filter((item) => item.roles.includes(profile.role));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-secondary/30 md:block">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/admin" aria-label="J-cars Exports admin">
            <Logo height={30} />
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3" aria-label="Admin">
          {nav.map((item) => (
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
      <div className="flex min-w-0 flex-1 flex-col">
        {/* The sidebar is desktop-only; on small screens the same links scroll
            horizontally so every admin page stays reachable. */}
        <nav className="flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden" aria-label="Admin">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
