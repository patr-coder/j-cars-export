import Link from "next/link";

import { OrderStatusBadge, ShipmentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/currency/format";
import { getClientPaymentOverview } from "@/lib/payments/queries";
import { remainingBalance, verifiedTotal } from "@/lib/payments/rules";

export default async function AccountPaymentsPage() {
  const user = await getCurrentUser();
  const orders = user ? await getClientPaymentOverview(user.id) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Payments &amp; tracking</h1>
      <p className="mt-2 text-muted-foreground">Balance due and shipping progress for each of your orders.</p>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No active orders yet — reserve a vehicle from its listing page to get started.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {orders.map((order) => {
            const pending = order.payments.filter((p) => p.status === "pending").length;
            return (
              <li key={order.orderId} className="flex flex-col gap-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{order.vehicleLabel}</p>
                    <p className="text-xs text-muted-foreground">{order.orderNo}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Confirmed</dt>
                    <dd className="font-semibold">
                      {formatCurrency(verifiedTotal(order.payments))} / {formatCurrency(order.totalUsd)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Balance due</dt>
                    <dd className="font-semibold">
                      {formatCurrency(remainingBalance(order.totalUsd, order.payments))}
                      {pending > 0 && (
                        <span className="ml-1 font-normal text-muted-foreground">({pending} under review)</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="flex items-center gap-2">
                      {order.shipmentStatus ? (
                        <>
                          <ShipmentStatusBadge status={order.shipmentStatus} />
                          {order.eta && (
                            <span className="text-muted-foreground">
                              ETA {new Date(order.eta).toLocaleDateString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Not booked yet</span>
                      )}
                    </dd>
                  </div>
                </dl>
                <Button asChild size="sm" variant="outline" className="w-fit">
                  <Link href={`/account/orders/${order.orderId}`}>View details</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
