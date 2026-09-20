-- Public bucket for vehicle photos. Storage RLS mirrors the table RLS
-- pattern from migration 0006: public read, admin/inventory_manager write.
insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

create policy "vehicle_images_bucket_select_public"
on storage.objects for select
using (bucket_id = 'vehicle-images');

create policy "vehicle_images_bucket_write_staff"
on storage.objects for all
using (
  bucket_id = 'vehicle-images'
  and public.get_my_role() in ('admin', 'inventory_manager')
)
with check (
  bucket_id = 'vehicle-images'
  and public.get_my_role() in ('admin', 'inventory_manager')
);
