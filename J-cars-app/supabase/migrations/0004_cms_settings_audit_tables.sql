-- cms_pages ----------------------------------------------------------------
create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  published boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);
alter table public.cms_pages enable row level security;
create trigger cms_pages_set_updated_at
  before update on public.cms_pages
  for each row execute function public.set_updated_at();

-- site_settings --------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value_json jsonb not null default '{}'::jsonb
);
alter table public.site_settings enable row level security;

-- audit_logs -------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
