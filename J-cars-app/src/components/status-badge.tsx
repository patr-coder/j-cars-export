import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

function StatusBadge({ status, variant }: { status: string; variant: BadgeVariant }) {
  return (
    <Badge variant={variant} className="capitalize">
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

const VEHICLE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  available: "success",
  reserved: "warning",
  in_transit: "default",
  sold: "outline",
};

export function VehicleStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} variant={VEHICLE_STATUS_VARIANT[status] ?? "outline"} />;
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? "default" : "outline"}>{published ? "Published" : "Draft"}</Badge>
  );
}

// new: unassigned lead, needs triage. assigned/quoted: actively being worked.
// closed: no longer active — could be won or dropped, kept neutral either way.
const INQUIRY_STATUS_VARIANT: Record<string, BadgeVariant> = {
  new: "warning",
  assigned: "default",
  quoted: "default",
  closed: "outline",
};

export function InquiryStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} variant={INQUIRY_STATUS_VARIANT[status] ?? "outline"} />;
}

// draft: not sent yet. sent: awaiting the client. accepted: won.
// expired: needs attention (a new quote), not a failure. cancelled: explicitly dropped.
const QUOTE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  draft: "outline",
  sent: "default",
  accepted: "success",
  expired: "warning",
  cancelled: "destructive",
};

export function QuoteStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} variant={QUOTE_STATUS_VARIANT[status] ?? "outline"} />;
}

// reserved/awaiting_payment: needs follow-up. paid/completed: success.
// preparing_export/booked_shipping/shipped/arrived: in progress. cancelled: dropped.
const ORDER_STATUS_VARIANT: Record<string, BadgeVariant> = {
  reserved: "warning",
  awaiting_payment: "warning",
  paid: "success",
  preparing_export: "default",
  booked_shipping: "default",
  shipped: "default",
  arrived: "default",
  completed: "success",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} variant={ORDER_STATUS_VARIANT[status] ?? "outline"} />;
}

// pending: waiting on staff review. verified: counted toward the total.
// rejected: client needs to resubmit.
const PAYMENT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: "warning",
  verified: "success",
  rejected: "destructive",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} variant={PAYMENT_STATUS_VARIANT[status] ?? "outline"} />;
}

const SHIPMENT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  booked: "default",
  in_transit: "default",
  arrived: "success",
  released: "success",
};

export function ShipmentStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} variant={SHIPMENT_STATUS_VARIANT[status] ?? "outline"} />;
}
