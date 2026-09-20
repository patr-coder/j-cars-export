-- profiles --------------------------------------------------------------
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.get_my_role() = 'admin');
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.get_my_role() = 'admin');

-- makes / models / locations / countries / ports (public reference data) --
create policy "makes_select_public" on public.makes for select using (true);
create policy "makes_write_admin" on public.makes for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "models_select_public" on public.models for select using (true);
create policy "models_write_admin" on public.models for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "locations_select_public" on public.locations for select using (true);
create policy "locations_write_admin" on public.locations for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "countries_select_public" on public.countries for select using (true);
create policy "countries_write_admin" on public.countries for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "ports_select_public" on public.ports for select using (true);
create policy "ports_write_admin" on public.ports for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

-- shipping_rates: public reads only the active rows (needed by the public
-- quote calculator later); staff read/write everything.
create policy "shipping_rates_select_active" on public.shipping_rates
  for select using (active or public.get_my_role() in ('admin', 'sales', 'inventory_manager'));
create policy "shipping_rates_write_admin" on public.shipping_rates for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

-- vehicles ----------------------------------------------------------------
create policy "vehicles_select_published_or_staff" on public.vehicles
  for select using (
    (published and deleted_at is null)
    or public.get_my_role() in ('admin', 'sales', 'inventory_manager')
  );
create policy "vehicles_write_staff" on public.vehicles for all
  using (public.get_my_role() in ('admin', 'inventory_manager'))
  with check (public.get_my_role() in ('admin', 'inventory_manager'));

-- vehicle_images / vehicle_features: same visibility as their vehicle.
create policy "vehicle_images_select_published_or_staff" on public.vehicle_images
  for select using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_images.vehicle_id
        and ((v.published and v.deleted_at is null)
          or public.get_my_role() in ('admin', 'sales', 'inventory_manager'))
    )
  );
create policy "vehicle_images_write_staff" on public.vehicle_images for all
  using (public.get_my_role() in ('admin', 'inventory_manager'))
  with check (public.get_my_role() in ('admin', 'inventory_manager'));

create policy "vehicle_features_select_published_or_staff" on public.vehicle_features
  for select using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_features.vehicle_id
        and ((v.published and v.deleted_at is null)
          or public.get_my_role() in ('admin', 'sales', 'inventory_manager'))
    )
  );
create policy "vehicle_features_write_staff" on public.vehicle_features for all
  using (public.get_my_role() in ('admin', 'inventory_manager'))
  with check (public.get_my_role() in ('admin', 'inventory_manager'));

-- inquiries -----------------------------------------------------------------
-- Anyone (including anon) can submit an inquiry; only the owner, the
-- assigned rep, or staff can read/update it afterwards.
create policy "inquiries_insert_anyone" on public.inquiries
  for insert with check (true);
create policy "inquiries_select_owner_or_staff" on public.inquiries
  for select using (
    auth.uid() = user_id or auth.uid() = assigned_to
    or public.get_my_role() in ('admin', 'sales')
  );
create policy "inquiries_update_staff" on public.inquiries
  for update using (public.get_my_role() in ('admin', 'sales'));

-- quotes ----------------------------------------------------------------
create policy "quotes_select_owner_or_staff" on public.quotes
  for select using (auth.uid() = user_id or public.get_my_role() in ('admin', 'sales'));
create policy "quotes_write_staff" on public.quotes for all
  using (public.get_my_role() in ('admin', 'sales'))
  with check (public.get_my_role() in ('admin', 'sales'));

-- orders -------------------------------------------------------------------
create policy "orders_select_owner_or_staff" on public.orders
  for select using (auth.uid() = user_id or public.get_my_role() in ('admin', 'sales'));
create policy "orders_write_staff" on public.orders for all
  using (public.get_my_role() in ('admin', 'sales'))
  with check (public.get_my_role() in ('admin', 'sales'));

-- payments -------------------------------------------------------------------
create policy "payments_select_owner_or_staff" on public.payments
  for select using (
    exists (select 1 from public.orders o where o.id = payments.order_id and o.user_id = auth.uid())
    or public.get_my_role() in ('admin', 'sales')
  );
create policy "payments_insert_owner_or_staff" on public.payments
  for insert with check (
    exists (select 1 from public.orders o where o.id = payments.order_id and o.user_id = auth.uid())
    or public.get_my_role() in ('admin', 'sales')
  );
create policy "payments_update_staff" on public.payments
  for update using (public.get_my_role() in ('admin', 'sales'));

-- shipments -------------------------------------------------------------------
create policy "shipments_select_owner_or_staff" on public.shipments
  for select using (
    exists (select 1 from public.orders o where o.id = shipments.order_id and o.user_id = auth.uid())
    or public.get_my_role() in ('admin', 'sales')
  );
create policy "shipments_write_staff" on public.shipments for all
  using (public.get_my_role() in ('admin', 'sales'))
  with check (public.get_my_role() in ('admin', 'sales'));

-- favorites / saved_searches: owner-only full access. -----------------------
create policy "favorites_owner_all" on public.favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_searches_owner_all" on public.saved_searches for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cms_pages / site_settings ---------------------------------------------
create policy "cms_pages_select_published_or_admin" on public.cms_pages
  for select using (published or public.get_my_role() = 'admin');
create policy "cms_pages_write_admin" on public.cms_pages for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

create policy "site_settings_select_public" on public.site_settings for select using (true);
create policy "site_settings_write_admin" on public.site_settings for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

-- audit_logs: admin-only, no exceptions. -------------------------------
create policy "audit_logs_admin_all" on public.audit_logs for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');
