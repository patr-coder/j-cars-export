import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/currency/format";
import { AUDIT_ACTION_LABELS, getAuditLog } from "@/lib/audit/queries";
import { getDashboardMetrics } from "@/lib/dashboard/queries";

type Kpi = { label: string; value: string; href: string; hint?: string };

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <Link
      href={kpi.href}
      className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <p className="text-sm text-muted-foreground">{kpi.label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{kpi.value}</p>
      {kpi.hint && <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>}
    </Link>
  );
}

function Ranking({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {rows.map((r) => (
              <li key={r.label} className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>{r.label}</span>
                  <span className="tabular-nums text-muted-foreground">{r.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted" aria-hidden>
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const profile = await requireRole(["admin", "sales", "inventory_manager"]);
  const isAdmin = profile.role === "admin";
  const [m, recent] = await Promise.all([
    getDashboardMetrics(),
    isAdmin ? getAuditLog({}, 8) : Promise.resolve(null),
  ]);
  const hasCommerce = m.leads_today !== undefined;

  const stockKpis: Kpi[] = [
    { label: "Active vehicles", value: String(m.active_vehicles), href: "/admin/vehicles?status=available&published=true" },
    { label: "Sold vehicles", value: String(m.sold_vehicles), href: "/admin/vehicles?status=sold" },
    { label: "Unpublished", value: String(m.unpublished_vehicles), href: "/admin/vehicles?published=false" },
    { label: "On promotion", value: String(m.featured_vehicles), href: "/admin/promotions" },
  ];
  const commerceKpis: Kpi[] = hasCommerce
    ? [
        { label: "Leads today", value: String(m.leads_today), href: "/admin/inquiries", hint: `${m.leads_7d} in the last 7 days` },
        { label: "Open leads", value: String(m.open_leads), href: "/admin/inquiries" },
        { label: "Quotes sent", value: String(m.quotes_sent), href: "/admin/quotes" },
        { label: "Active reservations", value: String(m.active_reservations), href: "/admin/orders" },
        { label: "Payments to review", value: String(m.pending_payments), href: "/admin/payments" },
        {
          label: "Revenue (verified)",
          value: formatCurrency(m.revenue_usd ?? 0),
          href: "/admin/payments?status=verified",
          hint: `${formatCurrency(m.revenue_30d_usd ?? 0)} in the last 30 days`,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {profile.full_name ?? profile.email}.</p>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="stock-heading">
        <h2 id="stock-heading" className="text-lg font-semibold">Stock</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stockKpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </div>
      </section>

      {hasCommerce && (
        <section className="flex flex-col gap-3" aria-labelledby="sales-heading">
          <h2 id="sales-heading" className="text-lg font-semibold">Sales</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {commerceKpis.map((k) => (
              <KpiCard key={k.label} kpi={k} />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Ranking title="Top makes (orders)" rows={m.top_makes ?? []} />
            <Ranking title="Top countries (orders)" rows={m.top_countries ?? []} />
          </div>
        </section>
      )}

      {recent && (
        <section className="flex flex-col gap-3" aria-labelledby="activity-heading">
          <div className="flex items-center justify-between">
            <h2 id="activity-heading" className="text-lg font-semibold">Recent activity</h2>
            <Link href="/admin/audit" className="text-sm text-primary hover:underline">
              Full audit log
            </Link>
          </div>
          {recent.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="flex flex-col divide-y rounded-xl border">
              {recent.entries.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                  <span>
                    <span className="font-medium">{e.actorName ?? e.actorEmail ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">{AUDIT_ACTION_LABELS[e.action] ?? e.action}</span> {e.entityType.replace(/_/g, " ")}
                  </span>
                  <time dateTime={e.createdAt} className="text-xs text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
