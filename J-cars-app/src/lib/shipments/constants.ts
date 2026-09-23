// Matches the shipment_status and order_document_kind enums (migrations 0003, 0012).
export const SHIPMENT_STATUSES = ["booked", "in_transit", "arrived", "released"] as const;

export const ORDER_DOCUMENT_KINDS = [
  { value: "bill_of_lading", label: "Bill of lading" },
  { value: "export_certificate", label: "Export certificate" },
  { value: "invoice", label: "Invoice" },
  { value: "inspection_certificate", label: "Inspection certificate" },
  { value: "other", label: "Other" },
] as const;
