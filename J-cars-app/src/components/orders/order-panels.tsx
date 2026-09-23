import { Download, ExternalLink } from "lucide-react";

import { PaymentStatusBadge, ShipmentStatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/currency/format";
import type { PaymentItem } from "@/lib/payments/queries";
import type { BankDetails } from "@/lib/settings/queries";
import type { OrderDocument, Shipment } from "@/lib/shipments/queries";
import { ORDER_DOCUMENT_KINDS } from "@/lib/shipments/constants";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function PaymentSummary({
  totalUsd,
  paidUsd,
  remainingUsd,
}: {
  totalUsd: number;
  paidUsd: number;
  remainingUsd: number;
}) {
  return (
    <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-muted-foreground">Order total</dt>
        <dd className="font-semibold">{formatCurrency(totalUsd)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Confirmed</dt>
        <dd className="font-semibold">{formatCurrency(paidUsd)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Balance due</dt>
        <dd className="font-semibold">{formatCurrency(remainingUsd)}</dd>
      </div>
    </dl>
  );
}

export function BankDetailsCard({ bank, orderNo }: { bank: BankDetails; orderNo: string }) {
  const rows = [
    ["Bank", bank.bank_name],
    ["Account name", bank.account_name],
    ["Account number", bank.account_no],
    ["SWIFT", bank.swift],
    ["Branch", bank.branch],
    ["Reference", orderNo],
  ].filter(([, value]) => value);

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm">
      <p className="mb-2 font-medium">Bank transfer details</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-mono break-all">{value}</dd>
          </div>
        ))}
      </dl>
      {bank.note && <p className="mt-2 text-xs text-muted-foreground">{bank.note}</p>}
    </div>
  );
}

export function PaymentRow({ payment, children }: { payment: PaymentItem; children?: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
          <span className="text-muted-foreground">
            {" "}
            · {formatDate(payment.createdAt)}
            {payment.reference && ` · Ref. ${payment.reference}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {payment.proofUrl && (
            <a
              href={payment.proofUrl}
              aria-label={`View proof${payment.reference ? ` for ${payment.reference}` : ""} (opens in new tab)`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View proof <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
          <PaymentStatusBadge status={payment.status} />
        </div>
      </div>
      {payment.rejectionReason && (
        <p className="text-xs text-destructive">Rejected: {payment.rejectionReason}</p>
      )}
      {children}
    </li>
  );
}

export function ShipmentDetails({ shipment }: { shipment: Shipment }) {
  const rows = [
    ["Carrier", shipment.carrier],
    ["Vessel", shipment.vesselName],
    ["Voyage", shipment.voyageNo],
    ["Booking no.", shipment.bookingNo],
    ["From", shipment.originPort],
    ["To", shipment.destinationPort],
    ["ETD", formatDate(shipment.etd)],
    ["ETA", formatDate(shipment.eta)],
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <ShipmentStatusBadge status={shipment.status} />
        {shipment.trackingUrl && (
          <a
            href={shipment.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Track shipment <ExternalLink className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in new tab)</span>
          </a>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const KIND_LABEL = new Map<string, string>(ORDER_DOCUMENT_KINDS.map((k) => [k.value, k.label]));

export function DocumentRow({ doc, children }: { doc: OrderDocument; children?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-2 py-2 text-sm first:pt-0 last:pb-0">
      <div className="min-w-0 break-words">
        <p className="font-medium">{doc.title}</p>
        <p className="text-xs text-muted-foreground">
          {KIND_LABEL.get(doc.kind)} · {formatDate(doc.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {doc.url && (
          <a
            href={doc.url}
            aria-label={`Download ${doc.title} (opens in new tab)`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Download className="size-3.5" aria-hidden /> Download
          </a>
        )}
        {children}
      </div>
    </li>
  );
}
