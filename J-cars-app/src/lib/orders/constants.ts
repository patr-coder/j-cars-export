// Matches the full order_status enum (migration 0003).
export const ORDER_STATUSES = [
  "reserved",
  "awaiting_payment",
  "paid",
  "preparing_export",
  "booked_shipping",
  "shipped",
  "arrived",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Manual (staff-driven) transitions only, mirroring the enforce_order_rules
// trigger (migration 0012), which is the real gate. -> paid is deliberately
// absent: verifyPayment sets it, and the trigger only accepts it once
// verified payments cover the order total.
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  reserved: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["cancelled"],
  paid: ["preparing_export"],
  preparing_export: ["booked_shipping"],
  booked_shipping: ["shipped"],
  shipped: ["arrived"],
  arrived: ["completed"],
  completed: [],
  cancelled: [],
};

export function nextStatuses(from: string): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[from as OrderStatus] ?? [];
}

export function canTransition(from: string, to: string): boolean {
  return nextStatuses(from).includes(to as OrderStatus);
}

// The customer-facing progression shown on the order timeline, in order.
export const ORDER_TIMELINE: readonly OrderStatus[] = ORDER_STATUSES.filter((s) => s !== "cancelled");

export const RESERVATION_HOLD_HOURS = 72;
