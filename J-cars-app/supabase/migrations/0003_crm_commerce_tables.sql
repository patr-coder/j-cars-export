-- inquiries --------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  vehicle_id uuid not null references public.vehicles (id),
  name text not null,
  email text not null,
  phone text,
  message text,
  status public.inquiry_status not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
create index inquiries_user_id_idx on public.inquiries (user_id);
create index inquiries_vehicle_id_idx on public.inquiries (vehicle_id);
create index inquiries_assigned_to_idx on public.inquiries (assigned_to);

-- quotes -----------------------------------------------------------------
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries (id) on delete set null,
  vehicle_id uuid not null references public.vehicles (id),
  user_id uuid references public.profiles (id) on delete set null,
  vehicle_price numeric(12, 2) not null,
  freight numeric(12, 2) not null default 0,
  insurance numeric(12, 2) not null default 0,
  inspection numeric(12, 2) not null default 0,
  certificate numeric(12, 2) not null default 0,
  other_fees numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total_usd numeric(12, 2) not null,
  status public.quote_status not null default 'draft',
  expires_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.quotes enable row level security;
create index quotes_user_id_idx on public.quotes (user_id);
create index quotes_vehicle_id_idx on public.quotes (vehicle_id);

-- orders -------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references public.profiles (id),
  vehicle_id uuid not null references public.vehicles (id),
  quote_id uuid references public.quotes (id) on delete set null,
  status public.order_status not null default 'reserved',
  total_usd numeric(12, 2) not null,
  reserved_until timestamptz,
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create index orders_user_id_idx on public.orders (user_id);
create index orders_vehicle_id_idx on public.orders (vehicle_id);

-- payments -----------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  method public.payment_method not null default 'bank_transfer',
  proof_path text,
  status public.payment_status not null default 'pending',
  verified_by uuid references public.profiles (id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create index payments_order_id_idx on public.payments (order_id);

-- shipments -----------------------------------------------------------------
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  carrier text,
  vessel_name text,
  voyage_no text,
  booking_no text,
  origin_port text,
  destination_port text,
  etd date,
  eta date,
  status public.shipment_status not null default 'booked',
  tracking_url text,
  created_at timestamptz not null default now()
);
alter table public.shipments enable row level security;
create index shipments_order_id_idx on public.shipments (order_id);

-- favorites -----------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);
alter table public.favorites enable row level security;

-- saved_searches -------------------------------------------------------------
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  filters_json jsonb not null default '{}'::jsonb,
  email_alerts boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.saved_searches enable row level security;
create index saved_searches_user_id_idx on public.saved_searches (user_id);
