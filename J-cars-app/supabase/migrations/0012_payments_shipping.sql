-- Phase 5: payment proofs + verification, shipment tracking, order
-- documents, and a private Storage bucket for both kinds of file.

-- 1. Close two pre-existing holes that become commercially exploitable now
-- that payments drive order status (see DECISIONS.md).

-- orders_update_owner_or_staff (0010) lets a client PATCH any column of
-- their own order over REST — e.g. status = 'paid' — and lets staff jump
-- to any status too. RLS can't restrict columns or transitions, so this
-- trigger is the real lifecycle gate; ORDER_TRANSITIONS in
-- src/lib/orders/constants.ts mirrors it for the UI and must stay in sync.
create function public.enforce_order_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_staff boolean := public.get_my_role() in ('admin', 'sales');
  verified numeric;
begin
  -- No JWT (service role, migrations, psql): trusted server-side context.
  if auth.uid() is null then
    return new;
  end if;

  if not is_staff then
    if new.status <> 'cancelled'
       or old.status not in ('reserved', 'awaiting_payment')
       or (to_jsonb(new) - 'status' - 'cancel_reason')
          <> (to_jsonb(old) - 'status' - 'cancel_reason') then
      raise exception 'Clients can only cancel a reserved or awaiting-payment order.';
    end if;
    return new;
  end if;

  if new.status = old.status then
    return new;
  end if;

  if new.status = 'paid' then
    if old.status not in ('reserved', 'awaiting_payment') then
      raise exception 'Order % cannot move from % to paid.', old.order_no, old.status;
    end if;
    -- Paid is never a judgement call: it requires verified funds.
    select coalesce(sum(amount), 0) into verified
      from public.payments where order_id = new.id and status = 'verified';
    if verified < new.total_usd then
      raise exception 'Order % is not fully paid (% of % verified).', old.order_no, verified, new.total_usd;
    end if;
    return new;
  end if;

  if (old.status, new.status) not in (
    ('reserved', 'awaiting_payment'),
    ('reserved', 'cancelled'),
    ('awaiting_payment', 'cancelled'),
    ('paid', 'preparing_export'),
    ('preparing_export', 'booked_shipping'),
    ('booked_shipping', 'shipped'),
    ('shipped', 'arrived'),
    ('arrived', 'completed')
  ) then
    raise exception 'Order % cannot move from % to %.', old.order_no, old.status, new.status;
  end if;
  return new;
end;
$$;

create trigger orders_enforce_rules
  before update on public.orders
  for each row execute function public.enforce_order_rules();

alter table public.payments
  add column reference text,
  add column rejection_reason text;

-- payments_insert_owner_or_staff (0006) let a client insert a payment that
-- is already status = 'verified'. Split so the owner branch can only ever
-- create a pending, unverified payment pointing at their own order's files.
drop policy "payments_insert_owner_or_staff" on public.payments;

create policy "payments_insert_owner_pending" on public.payments
  for insert with check (
    status = 'pending'
    and verified_by is null
    and verified_at is null
    and rejection_reason is null
    and proof_path like order_id::text || '/payments/%'
    and exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and o.user_id = auth.uid()
        and o.status in ('reserved', 'awaiting_payment')
    )
  );
create policy "payments_insert_staff" on public.payments
  for insert with check (public.get_my_role() in ('admin', 'sales'));

-- 2. Shipments: at most one per order, so upsertShipment can target it.
alter table public.shipments add constraint shipments_one_per_order unique (order_id);

-- 3. Order documents (B/L, export certificate, ...), staff-uploaded,
-- client-downloadable.
create type public.order_document_kind as enum (
  'bill_of_lading', 'export_certificate', 'invoice', 'inspection_certificate', 'other'
);

create table public.order_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  kind public.order_document_kind not null,
  title text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.order_documents enable row level security;
create index order_documents_order_id_idx on public.order_documents (order_id);

create policy "order_documents_select_owner_or_staff" on public.order_documents
  for select using (
    exists (select 1 from public.orders o where o.id = order_documents.order_id and o.user_id = auth.uid())
    or public.get_my_role() in ('admin', 'sales')
  );
create policy "order_documents_write_staff" on public.order_documents for all
  using (public.get_my_role() in ('admin', 'sales'))
  with check (public.get_my_role() in ('admin', 'sales'));

-- 4. Private bucket. Object keys are {orderId}/payments/<uuid>.<ext> and
-- {orderId}/documents/<uuid>.<ext>; access is derived from the order in the
-- first path segment. Files are only ever served through short-lived
-- signed URLs, which Storage issues only if this select policy passes.
insert into storage.buckets (id, name, public)
values ('order-files', 'order-files', false)
on conflict (id) do nothing;

create policy "order_files_select_owner_or_staff"
on storage.objects for select
using (
  bucket_id = 'order-files'
  and (
    public.get_my_role() in ('admin', 'sales')
    or exists (
      select 1 from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and o.user_id = auth.uid()
    )
  )
);

create policy "order_files_insert_owner_payment_proof"
on storage.objects for insert
with check (
  bucket_id = 'order-files'
  and (storage.foldername(name))[2] = 'payments'
  and array_length(storage.foldername(name), 1) = 2
  and exists (
    select 1 from public.orders o
    where o.id::text = (storage.foldername(name))[1]
      and o.user_id = auth.uid()
      and o.status in ('reserved', 'awaiting_payment')
  )
);

create policy "order_files_write_staff"
on storage.objects for all
using (bucket_id = 'order-files' and public.get_my_role() in ('admin', 'sales'))
with check (bucket_id = 'order-files' and public.get_my_role() in ('admin', 'sales'));

-- 5. Vehicle status follows the order through payment and shipping.
create or replace function public.sync_vehicle_status_from_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'reserved' then
    update public.vehicles set status = 'reserved'
      where id = new.vehicle_id and status = 'available';
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'cancelled' then
      update public.vehicles set status = 'available'
        where id = new.vehicle_id and status = 'reserved';
    elsif new.status = 'paid' then
      update public.vehicles set status = 'sold' where id = new.vehicle_id;
    elsif new.status = 'shipped' then
      update public.vehicles set status = 'in_transit' where id = new.vehicle_id;
    elsif new.status = 'arrived' then
      update public.vehicles set status = 'sold' where id = new.vehicle_id;
    end if;
  end if;
  return new;
end;
$$;

-- 6. A vehicle can only ever have one live order, not just one unpaid one.
drop index public.orders_one_active_per_vehicle;
create unique index orders_one_active_per_vehicle
  on public.orders (vehicle_id)
  where status <> 'cancelled';

-- 7. Bank-transfer instructions shown to clients. Placeholder values until
-- the owner fills them in (Phase 6 adds a CMS screen for site_settings).
insert into public.site_settings (key, value_json)
values (
  'bank_details',
  jsonb_build_object(
    'bank_name', 'TO BE CONFIGURED',
    'account_name', 'J-cars Exports',
    'account_no', 'TO BE CONFIGURED',
    'swift', 'TO BE CONFIGURED',
    'branch', '',
    'note', 'Please quote your order number as the transfer reference.'
  )
)
on conflict (key) do nothing;
