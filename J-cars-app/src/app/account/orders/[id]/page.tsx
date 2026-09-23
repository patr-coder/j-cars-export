import Link from "next/link";
import { notFound } from "next/navigation";

import {
  BankDetailsCard,
  DocumentRow,
  Panel,
  PaymentRow,
  PaymentSummary,
  ShipmentDetails,
} from "@/components/orders/order-panels";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { PaymentProofForm } from "@/components/orders/payment-proof-form";
import { OrderStatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderById } from "@/lib/orders/queries";
import { getOrderPayments } from "@/lib/payments/queries";
import { remainingBalance, verifiedTotal } from "@/lib/payments/rules";
import { getBankDetails } from "@/lib/settings/queries";
import { getOrderDocuments, getShipment } from "@/lib/shipments/queries";

const PAYABLE_STATUSES = new Set(["reserved", "awaiting_payment"]);

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, order] = await Promise.all([getCurrentUser(), getOrderById(id)]);
  // RLS already hides other clients' orders; the explicit owner check keeps
  // staff (who can read every order) on the admin view instead of this one.
  if (!order || order.userId !== user?.id) notFound();

  const [payments, shipment, documents, bank] = await Promise.all([
    getOrderPayments(id),
    getShipment(id),
    getOrderDocuments(id),
    getBankDetails(),
  ]);
  const remaining = remainingBalance(order.totalUsd, payments);
  const canPay = PAYABLE_STATUSES.has(order.status) && remaining > 0;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/account/orders" className="text-sm text-muted-foreground hover:underline">
          ← All orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">{order.vehicleLabel}</h1>
            <p className="text-sm text-muted-foreground">Order {order.orderNo}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <Panel title="Progress">
        <OrderTimeline status={order.status} />
      </Panel>

      <Panel title="Payment">
        <PaymentSummary totalUsd={order.totalUsd} paidUsd={verifiedTotal(payments)} remainingUsd={remaining} />
        {payments.length > 0 && (
          <ul className="flex flex-col divide-y border-t pt-3">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </ul>
        )}
        {canPay && (
          <div className="flex flex-col gap-4 border-t pt-4">
            {bank && <BankDetailsCard bank={bank} orderNo={order.orderNo} />}
            <PaymentProofForm orderId={order.id} remainingUsd={remaining} />
          </div>
        )}
      </Panel>

      <Panel title="Shipping">
        {shipment ? (
          <ShipmentDetails shipment={shipment} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Shipping details will appear here once your vehicle is booked on a vessel.
          </p>
        )}
      </Panel>

      <Panel title="Documents">
        {documents.length > 0 ? (
          <ul className="flex flex-col divide-y">
            {documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Export documents (bill of lading, certificates) will be available to download here.
          </p>
        )}
      </Panel>
    </div>
  );
}
