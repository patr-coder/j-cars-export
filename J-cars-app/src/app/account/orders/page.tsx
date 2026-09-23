import Link from "next/link";

import { cancelOrder } from "@/actions/orders";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { OrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/currency/format";
import { getClientOrders } from "@/lib/orders/queries";

const CANCELLABLE_STATUSES = new Set(["reserved", "awaiting_payment"]);

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  const orders = user ? await getClientOrders(user.id) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Orders</h1>
      <p className="mt-2 text-muted-foreground">Your reservations and orders.</p>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No orders yet — reserve a vehicle from its listing page to get started.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-2 rounded-xl border p-4">
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
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold">{formatCurrency(order.totalUsd)}</span>
                {order.status === "reserved" && order.reservedUntil && (
                  <span className="text-muted-foreground">
                    Hold expires {new Date(order.reservedUntil).toLocaleString()}
                  </span>
                )}
              </div>
              {order.cancelReason && (
                <p className="text-xs text-muted-foreground">Cancelled: {order.cancelReason}</p>
              )}
              {CANCELLABLE_STATUSES.has(order.status) && (
                <form action={cancelOrder.bind(null, order.id)} className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <label htmlFor={`reason-${order.id}`} className="text-xs text-muted-foreground">
                      Reason (optional)
                    </label>
                    <input
                      id={`reason-${order.id}`}
                      name="reason"
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                  <ConfirmSubmitButton
                    type="submit"
                    size="sm"
                    variant="outline"
                    confirmMessage="Cancel this reservation?"
                  >
                    Cancel
                  </ConfirmSubmitButton>
                </form>
              )}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/account/orders/${order.id}`}>Payment &amp; tracking</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/account/invoices">View invoice</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
