-- Three fixes surfaced while building/testing Phase 4:

-- 1. profiles_select_own_or_admin only allowed 'admin', not 'sales', unlike
-- every other staff-facing policy in this app (orders/inquiries/quotes all
-- treat admin+sales as "staff"). This silently broke the client-name column
-- on /admin/orders (and would have on /admin/quotes /admin/inquiries too)
-- for anyone signed in as sales — the embedded profiles join returns null
-- under RLS rather than erroring, so it just showed "Unknown".
drop policy "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (auth.uid() = id or public.get_my_role() in ('admin', 'sales'));

-- 2. profiles_update_own_or_admin let a client PATCH their own row with no
-- column restriction and no `with check` — including `role`. Since
-- get_my_role() reads profiles.role live, a client could self-escalate to
-- admin with one authenticated request against the public REST endpoint,
-- bypassing updateProfile's field allowlist entirely (security-auditor
-- finding, flagged urgent — Phase 4 is the first phase where that role also
-- grants write access to commerce data via orders_update_owner_or_staff).
drop policy "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.get_my_role() = 'admin')
  with check (auth.uid() = id or public.get_my_role() = 'admin');

create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and public.get_my_role() <> 'admin' then
    raise exception 'Only an admin can change a profile''s role.';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- 3. reserveVehicle checks vehicle.status = 'available' in application code
-- before inserting, but two concurrent reservations of the same vehicle
-- could both pass that check before either insert commits (TOCTOU). This
-- enforces "at most one active reservation per vehicle" at the DB level
-- regardless of application-layer timing, so the loser gets a clean unique-
-- constraint error instead of silently over-booking the vehicle.
create unique index orders_one_active_per_vehicle
  on public.orders (vehicle_id)
  where status in ('reserved', 'awaiting_payment');
