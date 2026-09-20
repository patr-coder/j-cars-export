import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { requireRole } from "@/lib/auth/roles";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin", "sales", "inventory_manager"]);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-secondary/30 md:block">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/admin" aria-label="J-cars Exports admin">
            <Logo height={22} />
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3" aria-label="Admin">
          {ADMIN_NAV.map((item) => (
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
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
