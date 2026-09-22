-- Phase 4: client self-service reservation, cancellation reason, and
-- consignee fields on profiles (see DECISIONS.md for the reasoning).

alter table public.orders add column cancel_reason text;

alter table public.profiles
  add column consignee_name text,
  add column consignee_company text,
  add column consignee_address text,
  add column consignee_city text,
  add column consignee_country text,
  add column consignee_phone text;

-- Clients can now reserve a vehicle themselves (mirrors inquiries_insert_anyone's
-- self-service pattern, but scoped to their own user_id since orders.user_id
-- is not null — no guest reservations). orders_write_staff previously covered
-- every operation; splitting it lets an owner update their own order (to
-- cancel it) without granting them insert/delete, which stay staff-only.
drop policy "orders_write_staff" on public.orders;

create policy "orders_insert_owner" on public.orders
  for insert with check (auth.uid() = user_id);
create policy "orders_insert_staff" on public.orders
  for insert with check (public.get_my_role() in ('admin', 'sales'));
create policy "orders_update_owner_or_staff" on public.orders
  for update using (auth.uid() = user_id or public.get_my_role() in ('admin', 'sales'))
  with check (auth.uid() = user_id or public.get_my_role() in ('admin', 'sales'));
create policy "orders_delete_staff" on public.orders
  for delete using (public.get_my_role() in ('admin', 'sales'));

-- Keeps vehicles.status in sync with orders.status without granting clients
-- RLS write access to vehicles (which stays admin/inventory_manager-only).
-- Scoped narrowly to the reserve <-> cancel transition Phase 4 owns; paid/sold
-- handling belongs to Phase 5 once payments exist.
create function public.sync_vehicle_status_from_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'reserved' then
    update public.vehicles set status = 'reserved'
      where id = new.vehicle_id and status = 'available';
  elsif tg_op = 'UPDATE' and new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.vehicles set status = 'available'
      where id = new.vehicle_id and status = 'reserved';
  end if;
  return new;
end;
$$;

create trigger orders_sync_vehicle_status
  after insert or update on public.orders
  for each row execute function public.sync_vehicle_status_from_order();
