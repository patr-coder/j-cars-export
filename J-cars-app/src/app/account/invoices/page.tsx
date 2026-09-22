import Link from "next/link";

import { OrderStatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/currency/format";
import { getClientOrders } from "@/lib/orders/queries";

export default async function AccountInvoicesPage() {
  const user = await getCurrentUser();
  const orders = user ? await getClientOrders(user.id) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <p className="mt-2 text-muted-foreground">
        A breakdown of each order. Formal invoice numbers and payment tracking arrive in a later phase.
      </p>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {orders.map((order) => {
            const rows = order.quoteBreakdown
              ? [
                  { label: "Vehicle price", amount: order.quoteBreakdown.vehiclePrice },
                  { label: "Freight", amount: order.quoteBreakdown.freight },
                  { label: "Insurance", amount: order.quoteBreakdown.insurance },
                  { label: "Inspection", amount: order.quoteBreakdown.inspection },
                  { label: "Certificate", amount: order.quoteBreakdown.certificate },
                  { label: "Other fees", amount: order.quoteBreakdown.otherFees },
                  { label: "Discount", amount: -order.quoteBreakdown.discount },
                ].filter((row) => row.amount !== 0)
              : [{ label: "Vehicle price", amount: order.totalUsd }];

            return (
              <li key={order.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={`/cars/${order.vehicleSlug}`} className="font-medium hover:underline">
                      {order.vehicleLabel}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {order.orderNo} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <table className="mt-3 w-full text-sm">
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label}>
                        <td className="py-1 text-muted-foreground">{row.label}</td>
                        <td className="py-1 text-right">{formatCurrency(row.amount)}</td>
                      </tr>
                    ))}
                    <tr className="border-t font-semibold">
                      <td className="py-1">Total</td>
                      <td className="py-1 text-right">{formatCurrency(order.totalUsd)}</td>
                    </tr>
                  </tbody>
                </table>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
