-- inquiries.vehicle_id becomes optional so /contact can work as a general
-- contact form, not just a per-vehicle "Get Quote" (Phase 3, see DECISIONS.md).
alter table public.inquiries alter column vehicle_id drop not null;

-- shipping_rates gains the "autres frais configurables" spec §3.4 calls
-- for — kept on this table (not a new config table) so they vary by
-- route/destination and stay admin-table-driven, not hardcoded.
alter table public.shipping_rates
  add column inspection_fee_usd numeric(12, 2),
  add column certificate_fee_usd numeric(12, 2),
  add column local_export_fee_usd numeric(12, 2);
