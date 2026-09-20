-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enums (spec §8). Kept narrow on purpose — values not listed in the spec
-- are added via a follow-up migration when a later phase needs them, not
-- guessed now.
create type public.user_role as enum ('admin', 'sales', 'inventory_manager', 'client');

create type public.vehicle_status as enum ('available', 'reserved', 'sold', 'in_transit');
create type public.fuel_type as enum ('petrol', 'diesel', 'hybrid', 'electric', 'lpg');
create type public.transmission_type as enum ('manual', 'automatic', 'cvt');
create type public.drive_type as enum ('fwd', 'rwd', 'awd', '4wd');
create type public.steering_side as enum ('left', 'right');
create type public.body_type as enum (
  'suv', 'sedan', 'van', 'truck', 'bus', 'hatchback', 'coupe', 'wagon', 'pickup', 'machinery'
);

create type public.inquiry_status as enum ('new', 'assigned', 'quoted', 'closed');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'expired', 'cancelled');
create type public.order_status as enum (
  'reserved', 'awaiting_payment', 'paid', 'preparing_export',
  'booked_shipping', 'shipped', 'arrived', 'completed', 'cancelled'
);
create type public.payment_method as enum ('bank_transfer');
create type public.payment_status as enum ('pending', 'verified', 'rejected');
create type public.shipment_status as enum (
  'booked', 'in_transit', 'arrived', 'released'
);
create type public.shipping_method as enum ('roro', 'container', 'shared_container');
