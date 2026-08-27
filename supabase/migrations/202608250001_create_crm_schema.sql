create extension if not exists pgcrypto;

create table public.lead_batches (
  id uuid primary key default gen_random_uuid(),
  name text,
  schema_name text,
  schema_version text,
  source text,
  original_lead_count integer not null default 0,
  imported_lead_count integer not null default 0,
  duplicate_count integer not null default 0,
  error_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  batch_id uuid references public.lead_batches(id) on delete set null,
  created_by uuid not null default auth.uid() references auth.users(id),
  name text not null,
  business_name text,
  segment text,
  city text,
  state text,
  country text,
  address text,
  phone text,
  normalized_phone text,
  whatsapp_url text,
  contact_url text,
  website text,
  website_status text,
  instagram text,
  instagram_status text,
  rating numeric,
  review_count integer,
  score numeric,
  priority text not null default 'media',
  pain text,
  opportunity text,
  message text not null default '',
  followup_message text,
  notes text,
  status text not null default 'novo',
  validation_required boolean not null default false,
  source text,
  maps_search_url text,
  approached_at timestamptz,
  responded_at timestamptz,
  followup_at timestamptz,
  proposal_at timestamptz,
  closed_at timestamptz,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.lead_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  event_type text not null,
  old_value jsonb,
  new_value jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, key)
);

comment on column public.leads.extra is 'Preserva campos desconhecidos recebidos por importação.';
comment on column public.leads.deleted_at is 'Exclusão lógica; consultas normais devem filtrar IS NULL.';
