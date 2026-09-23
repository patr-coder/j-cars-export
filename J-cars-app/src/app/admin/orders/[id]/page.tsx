import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrderDocument, uploadOrderDocument } from "@/actions/order-documents";
import { cancelOrder, setOrderStatus } from "@/actions/orders";
import { upsertShipment } from "@/actions/shipments";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { DocumentRow, Panel, PaymentRow, PaymentSummary } from "@/components/orders/order-panels";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { PaymentReviewActions } from "@/components/orders/payment-review-actions";
import { OrderStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/currency/format";
import { nextStatuses } from "@/lib/orders/constants";
import { getOrderById } from "@/lib/orders/queries";
import { getOrderPayments } from "@/lib/payments/queries";
import { remainingBalance, verifiedTotal } from "@/lib/payments/rules";
import { ORDER_DOCUMENT_KINDS, SHIPMENT_STATUSES } from "@/lib/shipments/constants";
import { getOrderDocuments, getShipment } from "@/lib/shipments/queries";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

const SHIPMENT_TEXT_FIELDS = [
  ["carrier", "Carrier"],
  ["vesselName", "Vessel"],
  ["voyageNo", "Voyage no."],
  ["bookingNo", "Booking no."],
  ["originPort", "Origin port"],
  ["destinationPort", "Destination port"],
] as const;

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  // The /admin layout also admits inventory_manager; orders are sales/admin only.
  await requireRole(["admin", "sales"]);
  const { id } = await params;
  const { error } = await searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();

  const [payments, shipment, documents] = await Promise.all([
    getOrderPayments(id),
    getShipment(id),
    getOrderDocuments(id),
  ]);
  const returnTo = `/admin/orders/${order.id}`;
  const expired =
    order.status === "reserved" &&
    order.reservedUntil &&
    new Date(order.reservedUntil).getTime() < new Date().getTime();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">{order.orderNo}</h1>
          <Link href={`/cars/${order.vehicleSlug}`} target="_blank" className="text-sm text-primary hover:underline">
            {order.vehicleLabel} <span aria-hidden>↗</span>
            <span className="sr-only">(opens in new tab)</span>
          </Link>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {expired && (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
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

      <Panel title="Progress">
        <OrderTimeline status={order.status} />
        <div className="flex flex-wrap gap-2">
          {nextStatuses(order.status).map((s, index) =>
            s === "cancelled" ? (
              <form key={s} action={cancelOrder.bind(null, order.id)}>
                <input type="hidden" name="reason" value="Cancelled by staff" />
                <ConfirmSubmitButton type="submit" size="sm" variant="outline" confirmMessage="Cancel this order?">
                  Cancel
                </ConfirmSubmitButton>
              </form>
            ) : (
              <form key={s} action={setOrderStatus.bind(null, order.id, s)}>
                <Button type="submit" size="sm" variant={index === 0 ? "default" : "outline"} className="capitalize">
                  Mark {s.replaceAll("_", " ")}
                </Button>
              </form>
            ),
          )}
        </div>
        {order.status === "awaiting_payment" && (
          <p className="text-xs text-muted-foreground">
            The order moves to paid automatically once verified payments cover the total.
          </p>
        )}
      </Panel>

      <Panel title="Payments">
        <PaymentSummary
          totalUsd={order.totalUsd}
          paidUsd={verifiedTotal(payments)}
          remainingUsd={remainingBalance(order.totalUsd, payments)}
        />
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment proof submitted yet.</p>
        ) : (
          <ul className="flex flex-col divide-y border-t pt-3">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment}>
                {payment.status === "pending" && <PaymentReviewActions paymentId={payment.id} returnTo={returnTo} />}
              </PaymentRow>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Shipment">
        <form action={upsertShipment.bind(null, order.id)} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SHIPMENT_TEXT_FIELDS.map(([name, label]) => (
              <div key={name} className="flex flex-col gap-1">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} name={name} defaultValue={shipment?.[name] ?? ""} maxLength={200} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <Label htmlFor="etd">ETD</Label>
              <Input id="etd" name="etd" type="date" defaultValue={shipment?.etd ?? ""} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="eta">ETA</Label>
              <Input id="eta" name="eta" type="date" defaultValue={shipment?.eta ?? ""} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="shipmentStatus">Status</Label>
              <select
                id="shipmentStatus"
                name="status"
                defaultValue={shipment?.status ?? "booked"}
                className={`${selectClassName} capitalize`}
              >
                {SHIPMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="trackingUrl">Tracking URL</Label>
              <Input
                id="trackingUrl"
                name="trackingUrl"
                type="url"
                placeholder="https://"
                defaultValue={shipment?.trackingUrl ?? ""}
              />
            </div>
          </div>
          <Button type="submit" size="sm" className="w-fit">
            {shipment ? "Update shipment" : "Save shipment"}
          </Button>
        </form>
      </Panel>

      <Panel title="Documents">
        {documents.length > 0 && (
          <ul className="flex flex-col divide-y">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc}>
                <form action={deleteOrderDocument.bind(null, doc.id, order.id)}>
                  <ConfirmSubmitButton
                    type="submit"
                    size="xs"
                    variant="destructive"
                    confirmMessage={`Delete "${doc.title}"?`}
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </DocumentRow>
            ))}
          </ul>
        )}
        <form
          action={uploadOrderDocument.bind(null, order.id)}
          className="grid grid-cols-1 items-end gap-3 border-t pt-3 sm:grid-cols-2"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="kind">Type</Label>
            <select id="kind" name="kind" required className={selectClassName}>
              {ORDER_DOCUMENT_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" maxLength={120} />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
          </div>
          <Button type="submit" size="sm" className="w-fit">
            Upload document
          </Button>
        </form>
      </Panel>
    </div>
  );
}
