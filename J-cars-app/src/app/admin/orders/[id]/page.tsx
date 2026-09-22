import Link from "next/link";
import { notFound } from "next/navigation";

import { cancelOrder, setOrderStatus } from "@/actions/orders";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { OrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency/format";
import { getOrderById } from "@/lib/orders/queries";
import type { ORDER_STATUSES } from "@/lib/orders/constants";

// Only the pre-payment transitions this app can actually drive today.
// paid/preparing_export/booked_shipping/shipped/arrived/completed need
// Phase 5's payment/shipment verification workflow, not built yet.
const NEXT_STATUS_OPTIONS: Partial<Record<(typeof ORDER_STATUSES)[number], (typeof ORDER_STATUSES)[number][]>> = {
  reserved: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["cancelled"],
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const expired =
    order.status === "reserved" &&
    order.reservedUntil &&
    new Date(order.reservedUntil).getTime() < new Date().getTime();
  const nextOptions = NEXT_STATUS_OPTIONS[order.status as (typeof ORDER_STATUSES)[number]] ?? [];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNo}</h1>
          <Link href={`/cars/${order.vehicleSlug}`} target="_blank" className="text-sm text-primary hover:underline">
            {order.vehicleLabel} ↗
          </Link>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {expired && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          This reservation hold expired on {new Date(order.reservedUntil!).toLocaleString()}.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-y-2 rounded-xl border p-4 text-sm">
        <dt className="text-muted-foreground">Client</dt>
        <dd>{order.clientLabel}</dd>
        <dt className="text-muted-foreground">Total</dt>
        <dd>{formatCurrency(order.totalUsd)}</dd>
        <dt className="text-muted-foreground">Reserved until</dt>
        <dd>{order.reservedUntil ? new Date(order.reservedUntil).toLocaleString() : "—"}</dd>
        <dt className="text-muted-foreground">Created</dt>
        <dd>{new Date(order.createdAt).toLocaleString()}</dd>
        {order.cancelReason && (
          <>
            <dt className="text-muted-foreground">Cancel reason</dt>
            <dd>{order.cancelReason}</dd>
          </>
        )}
      </dl>

      {nextOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nextOptions.map((s) =>
            s === "cancelled" ? (
              <form key={s} action={cancelOrder.bind(null, order.id)}>
                <input type="hidden" name="reason" value="Cancelled by staff" />
                <ConfirmSubmitButton
                  type="submit"
                  size="sm"
                  variant="outline"
                  confirmMessage="Cancel this order?"
                >
                  Cancel
                </ConfirmSubmitButton>
              </form>
            ) : (
              <form key={s} action={setOrderStatus.bind(null, order.id, s)}>
                <Button type="submit" size="sm" variant="outline" className="capitalize">
                  Mark {s.replace("_", " ")}
                </Button>
              </form>
            ),
          )}
        </div>
      )}
    </div>
  );
}
