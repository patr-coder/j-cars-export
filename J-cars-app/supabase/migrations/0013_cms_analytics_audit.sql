-- Phase 6: CMS content, dashboard metrics, audit log.

-- 1. Audit log ---------------------------------------------------------------
-- Written by a trigger rather than by each server action, so a change made
-- over the REST API directly (or by a future action that forgets to log) is
-- still recorded. security definer: the caller has no insert right on
-- audit_logs at all.
create function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_row jsonb;
  v_actor uuid := auth.uid();
begin
  if tg_op in ('UPDATE', 'DELETE') then v_old := to_jsonb(old); end if;
  if tg_op in ('INSERT', 'UPDATE') then v_new := to_jsonb(new); end if;

  -- set_updated_at alone makes every UPDATE look like a change.
  if tg_op = 'UPDATE' and (v_old - 'updated_at') = (v_new - 'updated_at') then
    return null;
  end if;

  -- The actor may be the profile being deleted in this same statement.
  if v_actor is not null and not exists (select 1 from public.profiles where id = v_actor) then
    v_actor := null;
  end if;

  v_row := coalesce(v_new, v_old);
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, old_data, new_data)
  values (
    v_actor,
    lower(tg_op),
    tg_table_name,
    case when v_row ? 'id' then (v_row ->> 'id')::uuid end,
    v_old,
    v_new
  );
  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'vehicles', 'vehicle_images', 'makes', 'models', 'locations',
    'countries', 'ports', 'shipping_rates',
    'inquiries', 'quotes', 'orders', 'payments', 'shipments', 'order_documents',
    'profiles', 'site_settings', 'cms_pages'
  ] loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function public.audit_row_change()',
      t || '_audit', t
    );
  end loop;
end;
$$;

-- Append-only: admins read, nobody writes except the trigger above.
drop policy "audit_logs_admin_all" on public.audit_logs;
create policy "audit_logs_select_admin" on public.audit_logs
  for select using (public.get_my_role() = 'admin');
revoke insert, update, delete, truncate on public.audit_logs from anon, authenticated;

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id);

-- 2. Dashboard metrics -------------------------------------------------------
-- One round trip, aggregated in SQL. Commerce figures are only returned to
-- admin/sales; inventory_manager gets the stock figures only. "Today" is the
-- business day in Japan, where the yard operates.
create function public.dashboard_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role public.user_role := public.get_my_role();
  v_today date := (now() at time zone 'Asia/Tokyo')::date;
  v_result jsonb;
begin
  if v_role is null or v_role not in ('admin', 'sales', 'inventory_manager') then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  v_result := jsonb_build_object(
    'active_vehicles', (select count(*) from vehicles
      where published and deleted_at is null and status = 'available'),
    'unpublished_vehicles', (select count(*) from vehicles
      where not published and deleted_at is null),
    'sold_vehicles', (select count(*) from vehicles
      where deleted_at is null and status = 'sold'),
    'featured_vehicles', (select count(*) from vehicles
      where published and deleted_at is null and (featured or sale_price_usd is not null))
  );

  if v_role in ('admin', 'sales') then
    v_result := v_result || jsonb_build_object(
      'leads_today', (select count(*) from inquiries
        where (created_at at time zone 'Asia/Tokyo')::date = v_today),
      'leads_7d', (select count(*) from inquiries
        where (created_at at time zone 'Asia/Tokyo')::date > v_today - 7),
      'open_leads', (select count(*) from inquiries where status in ('new', 'assigned')),
      'quotes_sent', (select count(*) from quotes where status in ('sent', 'accepted')),
      'active_reservations', (select count(*) from orders
        where status in ('reserved', 'awaiting_payment')),
      'pending_payments', (select count(*) from payments where status = 'pending'),
      'revenue_usd', (select coalesce(sum(amount), 0) from payments where status = 'verified'),
      'revenue_30d_usd', (select coalesce(sum(amount), 0) from payments
        where status = 'verified' and verified_at >= now() - interval '30 days'),
      'top_makes', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select m.name as label, count(*) as count
        from orders o
        join vehicles v on v.id = o.vehicle_id
        join makes m on m.id = v.make_id
        where o.status <> 'cancelled'
        group by m.name
        order by count(*) desc, m.name
        limit 5
      ) t),
      'top_countries', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select coalesce(nullif(p.consignee_country, ''), nullif(p.country_code, ''), 'Unknown') as label,
               count(*) as count
        from orders o
        join profiles p on p.id = o.user_id
        where o.status <> 'cancelled'
        group by 1
        order by count(*) desc, 1
        limit 5
      ) t)
    );
  end if;

  return v_result;
end;
$$;

-- Functions are executable by PUBLIC by default, and 0007's default
-- privileges also grant anon.
revoke execute on function public.dashboard_metrics() from public, anon;
grant execute on function public.dashboard_metrics() to authenticated;

-- 3. Promotions -----------------------------------------------------------------
-- A sale price above the regular price isn't a promotion; enforced here too
-- so a direct REST update can't bypass setVehicleSalePrice's check.
alter table public.vehicles add constraint vehicles_sale_price_below_price
  check (sale_price_usd is null or sale_price_usd < price_usd);

-- 4. Default CMS content ------------------------------------------------------
-- Starting copy the owner edits from /admin/content. Nothing here states a
-- company fact (address, founding year, bank) that the owner hasn't given.
insert into public.site_settings (key, value_json) values
  ('alert_banner', jsonb_build_object(
    'enabled', false, 'message', '', 'tone', 'info', 'link_url', '', 'link_label', '')),
  ('hero', jsonb_build_object(
    'title', 'Quality used vehicles, exported worldwide.',
    'subtitle', 'Browse our stock, get a landed-cost estimate, and track your vehicle from Japan to your port.',
    'cta_label', 'Browse stock',
    'cta_url', '/stock')),
  ('contact', jsonb_build_object(
    'whatsapp', '', 'phone', '', 'email', '', 'address', '',
    'facebook', '', 'instagram', '', 'youtube', '', 'tiktok', '', 'x', '')),
  ('faq', jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('id', gen_random_uuid(),
      'question', 'How do I buy a vehicle?',
      'answer', 'Request a quote from the vehicle page, reserve the vehicle from your account, then pay by bank transfer and upload your proof of payment.'),
    jsonb_build_object('id', gen_random_uuid(),
      'question', 'How long is a reservation held?',
      'answer', 'A reservation holds the vehicle for 72 hours while you arrange payment.'),
    jsonb_build_object('id', gen_random_uuid(),
      'question', 'Can I track my shipment?',
      'answer', 'Yes. Once your vehicle ships, your account shows the vessel, the ETD and ETA, a tracking link and your export documents.')
  ))),
  ('testimonials', jsonb_build_object('items', '[]'::jsonb))
on conflict (key) do nothing;

insert into public.cms_pages (slug, title, content_json, locale, published) values
  ('about', 'About J-cars Exports', jsonb_build_object('body',
    E'J-cars Exports sources quality used vehicles and exports them to buyers around the world.\n\n## Why buy from us\n\n- Every vehicle is listed with full specifications and photos.\n- Transparent landed-cost estimates before you commit.\n- Payment verification and shipment tracking from your account.'), 'en', true),
  ('how-to-buy', 'How to Buy', jsonb_build_object('body',
    E'Buying a vehicle from J-cars Exports takes a few simple steps.\n\n## 1. Find your vehicle\n\nBrowse the stock and use the filters to find the right vehicle.\n\n## 2. Request a quote\n\nChoose your destination port and shipping method on the vehicle page to get a landed-cost estimate, then send a quote request.\n\n## 3. Reserve and pay\n\nReserve the vehicle from your account. Pay by bank transfer and upload your proof of payment.\n\n## 4. Shipping and delivery\n\nWe prepare the export, book shipping and share the vessel, ETA and documents in your account.'), 'en', true),
  ('shipping', 'Shipping', jsonb_build_object('body',
    E'We ship by RoRo, container and shared container, depending on the destination.\n\nThe price calculator on each vehicle page shows the freight, insurance, inspection and certificate costs for the ports we serve.'), 'en', true),
  ('contact', 'Contact', jsonb_build_object('body',
    E'Have a question? Send us a message and we will get back to you.'), 'en', true)
on conflict (slug, locale) do nothing;
