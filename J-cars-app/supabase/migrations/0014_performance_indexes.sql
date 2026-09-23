-- Phase 7: indexes for the queries the app actually runs most.

-- Public catalogue: every listing filters published + not deleted and sorts
-- by newest first.
create index vehicles_public_listing_idx on public.vehicles (created_at desc)
  where published and deleted_at is null;

-- /stock keyword search is `description ilike '%q%'`, which a btree can't
-- serve; pg_trgm is enabled since 0001.
create index vehicles_description_trgm_idx on public.vehicles
  using gin (description gin_trgm_ops);

-- Admin inboxes and dashboard_metrics() (0013) filter on status and date.
create index inquiries_created_at_idx on public.inquiries (created_at desc);
create index inquiries_status_idx on public.inquiries (status);
create index orders_status_idx on public.orders (status);
create index payments_status_idx on public.payments (status);
create index quotes_status_idx on public.quotes (status);
