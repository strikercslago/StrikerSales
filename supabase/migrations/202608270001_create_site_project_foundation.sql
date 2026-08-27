create table public.site_methodologies (
  version text primary key,
  name text not null,
  description text,
  definition jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.site_methodology_stages (
  methodology_version text not null references public.site_methodologies(version) on delete restrict,
  stage_key text not null,
  title text not null,
  position integer not null check (position > 0),
  requires_approval boolean not null default false,
  definition jsonb not null default '{}'::jsonb,
  primary key (methodology_version, stage_key),
  unique (methodology_version, position)
);

create table public.site_methodology_stage_items (
  methodology_version text not null,
  stage_key text not null,
  item_key text not null,
  group_key text,
  label text not null,
  item_type text not null default 'field',
  required boolean not null default true,
  weight numeric(8,2) not null default 1 check (weight > 0),
  sort_order integer not null default 0,
  definition jsonb not null default '{}'::jsonb,
  primary key (methodology_version, stage_key, item_key),
  foreign key (methodology_version, stage_key)
    references public.site_methodology_stages(methodology_version, stage_key)
    on delete cascade
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  company text,
  segment text,
  city_region text,
  site_url text,
  instagram text,
  whatsapp text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.site_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  client_id uuid references public.clients(id) on delete restrict,
  responsible_user_id uuid references auth.users(id) on delete set null,
  methodology_version text not null default '1.0' references public.site_methodologies(version) on delete restrict,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'on_hold', 'completed', 'archived')),
  current_stage_key text not null default 'discovery',
  start_date date,
  estimated_deadline date,
  platform text,
  platform_other text,
  business_description text,
  main_offer text,
  priority_audience text,
  primary_goal text,
  primary_cta text,
  differentials jsonb not null default '[]'::jsonb,
  problems text,
  notes text,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (estimated_deadline is null or start_date is null or estimated_deadline >= start_date)
);

create table public.site_project_members (
  project_id uuid not null references public.site_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'approver', 'admin')),
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.site_project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  stage_key text not null,
  title text not null,
  position integer not null check (position > 0),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'approved', 'blocked')),
  data jsonb not null default '{}'::jsonb,
  schema_version integer not null default 1 check (schema_version > 0),
  revision integer not null default 1 check (revision > 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, stage_key),
  unique (project_id, position)
);

create table public.site_project_stage_items (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.site_project_stages(id) on delete cascade,
  item_key text not null,
  group_key text,
  label text not null,
  item_type text not null default 'field',
  required boolean not null default true,
  weight numeric(8,2) not null default 1 check (weight > 0),
  value jsonb not null default 'null'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'approved', 'not_applicable')),
  sort_order integer not null default 0,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stage_id, item_key)
);

create table public.site_project_services (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  name text not null,
  description text,
  audience text,
  priority integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_project_competitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  name text not null,
  url text,
  strengths text,
  weaknesses text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_project_references (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  url text,
  title text,
  liked_aspects jsonb not null default '[]'::jsonb,
  observation text,
  must_not_copy text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_project_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  name text not null,
  slug text not null,
  purpose text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'ready', 'approved')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id),
  unique (project_id, slug)
);

create table public.site_project_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  page_id uuid not null,
  name text not null,
  section_type text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'ready', 'approved')),
  sort_order integer not null default 0,
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, project_id),
  foreign key (page_id, project_id) references public.site_project_pages(id, project_id) on delete cascade
);

create table public.site_project_design_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  category text not null,
  token_key text not null,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, category, token_key)
);

create table public.site_project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  uploaded_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  bucket_id text not null default 'site-projects' check (bucket_id = 'site-projects'),
  object_path text not null unique,
  category text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 52428800),
  checksum text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (id, project_id)
);

alter table public.site_project_references
  add column file_id uuid,
  add constraint site_project_references_file_project_fk
    foreign key (file_id, project_id) references public.site_project_files(id, project_id) on delete set null (file_id);

create table public.site_project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  file_id uuid not null,
  page_id uuid,
  section_id uuid,
  asset_type text not null,
  usage text,
  status text not null default 'draft' check (status in ('draft', 'selected', 'approved', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (file_id, project_id) references public.site_project_files(id, project_id) on delete restrict,
  foreign key (page_id, project_id) references public.site_project_pages(id, project_id) on delete set null (page_id),
  foreign key (section_id, project_id) references public.site_project_sections(id, project_id) on delete set null (section_id)
);

create table public.site_project_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  file_id uuid,
  page_id uuid,
  section_id uuid,
  artifact_type text not null,
  viewport text,
  external_url text,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'superseded')),
  notes text,
  version integer not null default 1 check (version > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (file_id, project_id) references public.site_project_files(id, project_id) on delete set null (file_id),
  foreign key (page_id, project_id) references public.site_project_pages(id, project_id) on delete set null (page_id),
  foreign key (section_id, project_id) references public.site_project_sections(id, project_id) on delete set null (section_id)
);

create table public.site_project_responsive_tests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  page_id uuid,
  viewport text not null,
  area text,
  status text not null default 'pending' check (status in ('pending', 'passed', 'failed', 'not_applicable')),
  notes text,
  tested_by uuid references auth.users(id) on delete set null,
  tested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (page_id, project_id) references public.site_project_pages(id, project_id) on delete cascade
);

create table public.site_project_qa_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  stage_key text,
  qa_type text not null check (qa_type in ('visual', 'functional', 'content', 'accessibility', 'performance', 'seo')),
  description text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'accepted')),
  assigned_to uuid references auth.users(id) on delete set null,
  evidence_file_id uuid,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (evidence_file_id, project_id) references public.site_project_files(id, project_id) on delete set null (evidence_file_id)
);

create table public.site_project_scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  dimension text not null,
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  comment text,
  is_pending boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, dimension)
);

create table public.site_project_approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  stage_key text not null,
  decision text not null check (decision in ('approved', 'rejected', 'reopened')),
  note text,
  decided_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.site_project_gate_overrides (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  gate_key text not null,
  reason text not null check (length(btrim(reason)) >= 5),
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.site_project_prompt_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site_projects(id) on delete cascade,
  prompt_type text not null,
  prompt_version text not null default '1.0',
  input_snapshot jsonb not null default '{}'::jsonb,
  output_text text not null,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.site_project_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.site_projects(id) on delete set null,
  project_name text,
  actor_id uuid references auth.users(id) on delete set null,
  stage_key text,
  event_type text not null,
  old_value jsonb,
  new_value jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.site_methodologies (version, name, description, definition)
values (
  '1.0',
  'Arquivo Striker v1.0',
  'Metodologia oficial e imutável usada como snapshot na criação de projetos.',
  jsonb_build_object('progress_model', 'weighted_required_items', 'default_weight', 1)
);

insert into public.site_methodology_stages
  (methodology_version, stage_key, title, position, requires_approval, definition)
values
  ('1.0', 'discovery', 'Descoberta', 1, false, '{}'::jsonb),
  ('1.0', 'strategy', 'Estratégia', 2, true, '{}'::jsonb),
  ('1.0', 'content', 'Conteúdo', 3, false, '{}'::jsonb),
  ('1.0', 'architecture', 'Arquitetura', 4, true, '{}'::jsonb),
  ('1.0', 'visual_direction', 'Direção Visual', 5, true, '{}'::jsonb),
  ('1.0', 'design_system', 'Design System', 6, false, '{}'::jsonb),
  ('1.0', 'wireframes', 'Wireframes', 7, false, '{}'::jsonb),
  ('1.0', 'high_fidelity', 'High Fidelity', 8, true, '{}'::jsonb),
  ('1.0', 'prototype', 'Protótipo', 9, false, '{}'::jsonb),
  ('1.0', 'development', 'Desenvolvimento', 10, false, '{}'::jsonb),
  ('1.0', 'integrations', 'Integrações', 11, false, '{}'::jsonb),
  ('1.0', 'responsive', 'Responsividade', 12, false, '{}'::jsonb),
  ('1.0', 'accessibility', 'Acessibilidade', 13, false, '{}'::jsonb),
  ('1.0', 'performance', 'Performance', 14, false, '{}'::jsonb),
  ('1.0', 'seo', 'SEO', 15, false, '{}'::jsonb),
  ('1.0', 'qa', 'QA', 16, false, '{}'::jsonb),
  ('1.0', 'approval', 'Aprovação Final', 17, true, '{}'::jsonb),
  ('1.0', 'publication', 'Publicação', 18, false, '{}'::jsonb),
  ('1.0', 'delivery', 'Entrega', 19, false, '{}'::jsonb);

insert into public.site_methodology_stage_items
  (methodology_version, stage_key, item_key, group_key, label, item_type, required, weight, sort_order)
values
  ('1.0', 'discovery', 'briefing', 'foundation', 'Briefing consolidado', 'document', true, 1, 10),
  ('1.0', 'strategy', 'positioning', 'strategy', 'Posicionamento definido', 'document', true, 1, 10),
  ('1.0', 'content', 'content_inventory', 'content', 'Inventário de conteúdo', 'checklist', true, 1, 10),
  ('1.0', 'architecture', 'sitemap', 'architecture', 'Mapa do site', 'artifact', true, 1, 10),
  ('1.0', 'visual_direction', 'moodboard', 'visual', 'Direção visual registrada', 'artifact', true, 1, 10),
  ('1.0', 'design_system', 'tokens', 'design_system', 'Tokens configurados', 'checklist', true, 1, 10),
  ('1.0', 'wireframes', 'key_pages', 'wireframes', 'Wireframes das páginas-chave', 'artifact', true, 1, 10),
  ('1.0', 'high_fidelity', 'key_pages', 'high_fidelity', 'Telas em alta fidelidade', 'artifact', true, 1, 10),
  ('1.0', 'prototype', 'main_flow', 'prototype', 'Fluxo principal prototipado', 'artifact', true, 1, 10),
  ('1.0', 'development', 'implementation', 'development', 'Implementação concluída', 'checklist', true, 1, 10),
  ('1.0', 'integrations', 'required_integrations', 'integrations', 'Integrações obrigatórias', 'checklist', true, 1, 10),
  ('1.0', 'responsive', 'viewports', 'responsive', 'Viewports validados', 'checklist', true, 1, 10),
  ('1.0', 'accessibility', 'a11y_checklist', 'quality', 'Checklist de acessibilidade', 'checklist', true, 1, 10),
  ('1.0', 'performance', 'performance_checklist', 'quality', 'Checklist de performance', 'checklist', true, 1, 10),
  ('1.0', 'seo', 'seo_checklist', 'quality', 'Checklist de SEO', 'checklist', true, 1, 10),
  ('1.0', 'qa', 'critical_issues', 'quality', 'Pendências críticas resolvidas', 'checklist', true, 1, 10),
  ('1.0', 'approval', 'final_review', 'approval', 'Revisão final concluída', 'checklist', true, 1, 10),
  ('1.0', 'publication', 'production_release', 'release', 'Publicação em produção', 'checklist', true, 1, 10),
  ('1.0', 'delivery', 'handoff', 'delivery', 'Handoff e entrega', 'checklist', true, 1, 10);
