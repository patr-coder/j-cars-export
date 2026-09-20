-- Generic updated_at trigger, reused by any table that carries the column.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ------------------------------------------------------------
-- One row per auth.users row, auto-created by handle_new_user() (0005).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  whatsapp text,
  country_code text,
  preferred_language text not null default 'en',
  preferred_currency text not null default 'USD',
  role public.user_role not null default 'client',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- makes -----------------------------------------------------------------
create table public.makes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text
);
alter table public.makes enable row level security;

-- models ------------------------------------------------------------------
create table public.models (
  id uuid primary key default gen_random_uuid(),
  make_id uuid not null references public.makes (id) on delete cascade,
  name text not null,
  slug text not null,
  unique (make_id, slug)
);
alter table public.models enable row level security;
create index models_make_id_idx on public.models (make_id);

-- locations -----------------------------------------------------------
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  city text not null,
  yard_name text not null
);
alter table public.locations enable row level security;

-- countries -----------------------------------------------------------
create table public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  iso_code text not null unique,
  currency text not null
);
alter table public.countries enable row level security;

-- ports -----------------------------------------------------------------
create table public.ports (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries (id) on delete cascade,
  name text not null,
  code text not null unique,
  active boolean not null default true
);
alter table public.ports enable row level security;
create index ports_country_id_idx on public.ports (country_id);

-- vehicles --------------------------------------------------------------
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  ref_no text not null unique,
  make_id uuid not null references public.makes (id),
  model_id uuid not null references public.models (id),
  trim text,
  year int not null,
  month int,
  price_usd numeric(12, 2) not null,
  sale_price_usd numeric(12, 2),
  mileage_km int not null,
  engine_cc int,
  fuel_type public.fuel_type not null,
  transmission public.transmission_type not null,
  drive_type public.drive_type not null,
  steering_side public.steering_side not null,
  body_type public.body_type not null,
  color text,
  seats int,
  doors int,
  chassis_no_private text,
  vin_private text,
  width_mm int,
  height_mm int,
  length_mm int,
  weight_kg int,
  location_id uuid references public.locations (id),
  description text,
  status public.vehicle_status not null default 'available',
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
alter table public.vehicles enable row level security;
create index vehicles_make_id_idx on public.vehicles (make_id);
create index vehicles_model_id_idx on public.vehicles (model_id);
create index vehicles_status_idx on public.vehicles (status);
create index vehicles_published_idx on public.vehicles (published);
create index vehicles_price_usd_idx on public.vehicles (price_usd);
create index vehicles_year_idx on public.vehicles (year);
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- vehicle_images ----------------------------------------------------
create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  alt_text text,
  created_at timestamptz not null default now()
);
alter table public.vehicle_images enable row level security;
create index vehicle_images_vehicle_id_idx on public.vehicle_images (vehicle_id);

-- vehicle_features -----------------------------------------------------
create table public.vehicle_features (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  feature_key text not null,
  feature_value text
);
alter table public.vehicle_features enable row level security;
create index vehicle_features_vehicle_id_idx on public.vehicle_features (vehicle_id);

-- shipping_rates -----------------------------------------------------
create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  origin_location_id uuid not null references public.locations (id),
  destination_port_id uuid not null references public.ports (id),
  method public.shipping_method not null,
  base_cost_usd numeric(12, 2) not null,
  category text,
  m3_rate numeric(12, 2),
  insurance_rate numeric(12, 2),
  effective_from date not null default current_date,
  effective_to date,
  active boolean not null default true
);
alter table public.shipping_rates enable row level security;
create index shipping_rates_destination_port_id_idx on public.shipping_rates (destination_port_id);
