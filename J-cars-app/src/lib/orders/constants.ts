// Matches the full order_status enum (migration 0003) so admin UI/typing
// stays correct end to end, but Phase 4's setOrderStatus only offers the
// pre-payment transitions in the UI (reserved/awaiting_payment/cancelled) —
// paid/preparing_export/booked_shipping/shipped/arrived/completed are
// driven by Phase 5's payment/shipment verification workflow, not built yet.
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

export const RESERVATION_HOLD_HOURS = 72;
