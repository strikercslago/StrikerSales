create index clients_owner_active_idx on public.clients (owner_id, deleted_at, updated_at desc);
create index clients_source_lead_idx on public.clients (source_lead_id) where source_lead_id is not null;
create index site_projects_owner_active_idx on public.site_projects (owner_id, deleted_at, updated_at desc);
create index site_projects_client_idx on public.site_projects (client_id) where client_id is not null;
create index site_projects_status_idx on public.site_projects (status, updated_at desc) where deleted_at is null;
create index site_project_members_user_idx on public.site_project_members (user_id, project_id);
create index site_project_stages_project_position_idx on public.site_project_stages (project_id, position);
create index site_project_stage_items_stage_order_idx on public.site_project_stage_items (stage_id, sort_order);
create index site_project_stage_items_progress_idx on public.site_project_stage_items (stage_id, required, status) where required;
create index site_project_services_project_idx on public.site_project_services (project_id, priority desc);
create index site_project_competitors_project_idx on public.site_project_competitors (project_id);
create index site_project_references_project_idx on public.site_project_references (project_id);
create index site_project_pages_project_order_idx on public.site_project_pages (project_id, sort_order);
create index site_project_sections_page_order_idx on public.site_project_sections (page_id, sort_order);
create index site_project_sections_project_idx on public.site_project_sections (project_id);
create index site_project_files_project_category_idx on public.site_project_files (project_id, category, created_at desc) where deleted_at is null;
create index site_project_assets_project_type_idx on public.site_project_assets (project_id, asset_type);
create index site_project_artifacts_project_type_idx on public.site_project_artifacts (project_id, artifact_type, version desc);
create index site_project_responsive_tests_project_status_idx on public.site_project_responsive_tests (project_id, status);
create index site_project_qa_items_project_status_idx on public.site_project_qa_items (project_id, status, severity);
create index site_project_scores_project_idx on public.site_project_scores (project_id);
create index site_project_approvals_project_stage_idx on public.site_project_approvals (project_id, stage_key, created_at desc);
create index site_project_gate_overrides_project_idx on public.site_project_gate_overrides (project_id, gate_key, created_at desc);
create index site_project_prompt_runs_project_idx on public.site_project_prompt_runs (project_id, created_at desc);
create index site_project_history_project_created_idx on public.site_project_history (project_id, created_at desc);
create index site_project_history_actor_created_idx on public.site_project_history (actor_id, created_at desc);

create or replace function public.set_updated_at_and_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = clock_timestamp();
  new.revision = old.revision + 1;
  return new;
end;
$$;

create or replace function public.initialize_site_project()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.site_project_members (project_id, user_id, role, added_by)
  values (new.id, new.owner_id, 'owner', new.owner_id);

  insert into public.site_project_stages (project_id, stage_key, title, position)
  select new.id, stage_key, title, position
  from public.site_methodology_stages
  where methodology_version = new.methodology_version
  order by position;

  insert into public.site_project_stage_items
    (stage_id, item_key, group_key, label, item_type, required, weight, sort_order)
  select stage.id, template.item_key, template.group_key, template.label,
         template.item_type, template.required, template.weight, template.sort_order
  from public.site_methodology_stage_items template
  join public.site_project_stages stage
    on stage.project_id = new.id and stage.stage_key = template.stage_key
  where template.methodology_version = new.methodology_version;

  insert into public.site_project_history
    (project_id, project_name, actor_id, event_type, new_value)
  values (new.id, new.name, new.owner_id, 'project_created', to_jsonb(new));

  return new;
end;
$$;

create trigger initialize_site_project_after_insert
after insert on public.site_projects
for each row execute function public.initialize_site_project();

create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger set_site_projects_updated_at_revision
before update on public.site_projects
for each row execute function public.set_updated_at_and_revision();

create trigger set_site_project_stages_updated_at_revision
before update on public.site_project_stages
for each row execute function public.set_updated_at_and_revision();

create trigger set_site_project_stage_items_updated_at_revision
before update on public.site_project_stage_items
for each row execute function public.set_updated_at_and_revision();

create trigger set_site_project_sections_updated_at_revision
before update on public.site_project_sections
for each row execute function public.set_updated_at_and_revision();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_project_services', 'site_project_competitors', 'site_project_references',
    'site_project_pages', 'site_project_design_tokens', 'site_project_assets',
    'site_project_artifacts', 'site_project_responsive_tests', 'site_project_qa_items',
    'site_project_scores'
  ]
  loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create or replace function public.has_site_project_role(
  p_project_id uuid,
  p_roles text[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.site_project_members member
    where member.project_id = p_project_id
      and member.user_id = (select auth.uid())
      and (p_roles is null or member.role = any(p_roles))
  );
$$;

create or replace function public.site_project_progress(p_project_id uuid)
returns numeric
language sql
stable
security invoker
set search_path = ''
as $$
  with required_items as (
    select item.weight,
           case when item.status in ('completed', 'approved') then item.weight else 0 end as completed_weight
    from public.site_project_stage_items item
    join public.site_project_stages stage on stage.id = item.stage_id
    where stage.project_id = p_project_id and item.required
  ), approval_requirements as (
    select 1::numeric as weight,
           case when exists (
             select 1
             from public.site_project_approvals approval
             where approval.project_id = p_project_id
               and approval.stage_key = template.stage_key
               and approval.decision = 'approved'
               and not exists (
                 select 1 from public.site_project_approvals later
                 where later.project_id = approval.project_id
                   and later.stage_key = approval.stage_key
                   and later.created_at > approval.created_at
                   and later.decision = 'reopened'
               )
           ) then 1::numeric else 0::numeric end as completed_weight
    from public.site_projects project
    join public.site_methodology_stages template
      on template.methodology_version = project.methodology_version
    where project.id = p_project_id and template.requires_approval
  ), totals as (
    select weight, completed_weight from required_items
    union all
    select weight, completed_weight from approval_requirements
  )
  select case
    when coalesce(sum(weight), 0) = 0 then 0
    else round((sum(completed_weight) / sum(weight)) * 100, 2)
  end
  from totals;
$$;

create view public.site_project_progress_v
with (security_invoker = true)
as
select project.id as project_id,
       public.site_project_progress(project.id) as progress_percent
from public.site_projects project;

create or replace function public.set_site_project_stage_status(
  p_project_id uuid,
  p_stage_key text,
  p_status text,
  p_override_reason text default null
)
returns public.site_project_stages
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_stage public.site_project_stages%rowtype;
  updated_stage public.site_project_stages%rowtype;
  missing_prerequisites text[];
  is_administrator boolean;
begin
  if p_status not in ('pending', 'in_progress', 'completed', 'approved', 'blocked') then
    raise exception 'Status de etapa inválido.' using errcode = '22023';
  end if;

  if p_status = 'approved' then
    raise exception 'A aprovação deve ser registrada por decide_site_project_stage().' using errcode = 'P0001';
  end if;

  if not public.has_site_project_role(p_project_id, array['owner', 'editor', 'admin']) then
    raise exception 'Usuário sem permissão para alterar esta etapa.' using errcode = '42501';
  end if;

  select * into current_stage
  from public.site_project_stages
  where project_id = p_project_id and stage_key = p_stage_key
  for update;

  if not found then
    raise exception 'Etapa não encontrada.' using errcode = 'P0002';
  end if;

  if p_stage_key = 'development' and p_status in ('in_progress', 'completed', 'approved') then
    select array_agg(required_stage.stage_key order by required_stage.position)
    into missing_prerequisites
    from public.site_project_stages required_stage
    where required_stage.project_id = p_project_id
      and (
        (required_stage.stage_key in ('strategy', 'architecture', 'visual_direction', 'high_fidelity')
          and required_stage.status <> 'approved')
        or (required_stage.stage_key = 'design_system'
          and required_stage.status not in ('completed', 'approved'))
      );

    if missing_prerequisites is not null then
      is_administrator := public.has_site_project_role(p_project_id, array['owner', 'admin']);
      if not is_administrator or p_override_reason is null or length(btrim(p_override_reason)) < 5 then
        raise exception 'Gate de desenvolvimento bloqueado. Pré-requisitos: %', array_to_string(missing_prerequisites, ', ')
          using errcode = 'P0001';
      end if;

      insert into public.site_project_gate_overrides (project_id, gate_key, reason, created_by)
      values (p_project_id, 'development', btrim(p_override_reason), auth.uid());

      insert into public.site_project_history
        (project_id, project_name, actor_id, stage_key, event_type, metadata)
      select project.id, project.name, auth.uid(), p_stage_key, 'gate_overridden',
             jsonb_build_object('reason', btrim(p_override_reason), 'missing_prerequisites', missing_prerequisites)
      from public.site_projects project where project.id = p_project_id;
    end if;
  end if;

  update public.site_project_stages
  set status = p_status,
      started_at = case when p_status = 'in_progress' then coalesce(started_at, clock_timestamp()) else started_at end,
      completed_at = case when p_status in ('completed', 'approved') then clock_timestamp() else null end
  where id = current_stage.id
  returning * into updated_stage;

  insert into public.site_project_history
    (project_id, project_name, actor_id, stage_key, event_type, old_value, new_value)
  select project.id, project.name, auth.uid(), p_stage_key, 'stage_status_changed',
         jsonb_build_object('status', current_stage.status),
         jsonb_build_object('status', updated_stage.status)
  from public.site_projects project where project.id = p_project_id;

  return updated_stage;
end;
$$;

create or replace function public.decide_site_project_stage(
  p_project_id uuid,
  p_stage_key text,
  p_decision text,
  p_note text default null
)
returns public.site_project_approvals
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.site_project_approvals%rowtype;
  next_status text;
begin
  if p_decision not in ('approved', 'rejected', 'reopened') then
    raise exception 'Decisão inválida.' using errcode = '22023';
  end if;

  if not public.has_site_project_role(p_project_id, array['owner', 'approver', 'admin']) then
    raise exception 'Usuário sem permissão para aprovar esta etapa.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.site_project_stages
    where project_id = p_project_id and stage_key = p_stage_key
  ) then
    raise exception 'Etapa não encontrada.' using errcode = 'P0002';
  end if;

  insert into public.site_project_approvals (project_id, stage_key, decision, note, decided_by)
  values (p_project_id, p_stage_key, p_decision, p_note, auth.uid())
  returning * into result;

  next_status := case p_decision when 'approved' then 'approved' when 'reopened' then 'in_progress' else 'blocked' end;

  update public.site_project_stages
  set status = next_status,
      completed_at = case when p_decision = 'approved' then clock_timestamp() else null end
  where project_id = p_project_id and stage_key = p_stage_key;

  insert into public.site_project_history
    (project_id, project_name, actor_id, stage_key, event_type, new_value)
  select project.id, project.name, auth.uid(), p_stage_key, 'stage_decision_recorded',
         jsonb_build_object('decision', p_decision, 'note', p_note)
  from public.site_projects project where project.id = p_project_id;

  return result;
end;
$$;

create or replace function public.soft_delete_site_project(p_project_id uuid)
returns public.site_projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.site_projects%rowtype;
begin
  if not public.has_site_project_role(p_project_id, array['owner', 'admin']) then
    raise exception 'Usuário sem permissão para excluir este projeto.' using errcode = '42501';
  end if;

  update public.site_projects
  set deleted_at = clock_timestamp(), status = 'archived'
  where id = p_project_id and deleted_at is null
  returning * into result;

  if not found then
    raise exception 'Projeto não encontrado ou já excluído.' using errcode = 'P0002';
  end if;

  insert into public.site_project_history (project_id, project_name, actor_id, event_type)
  values (result.id, result.name, auth.uid(), 'project_soft_deleted');
  return result;
end;
$$;

create or replace function public.permanently_delete_site_project(p_project_id uuid, p_confirmation text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_row public.site_projects%rowtype;
begin
  if not public.has_site_project_role(p_project_id, array['owner', 'admin']) then
    raise exception 'Usuário sem permissão administrativa.' using errcode = '42501';
  end if;

  select * into project_row from public.site_projects where id = p_project_id for update;
  if not found then
    raise exception 'Projeto não encontrado.' using errcode = 'P0002';
  end if;
  if project_row.deleted_at is null then
    raise exception 'O projeto deve passar por soft delete antes da exclusão definitiva.' using errcode = 'P0001';
  end if;
  if p_confirmation <> project_row.name then
    raise exception 'Confirmação inválida.' using errcode = '22023';
  end if;

  insert into public.site_project_history
    (project_id, project_name, actor_id, event_type, metadata)
  values (project_row.id, project_row.name, auth.uid(), 'project_permanently_deleted',
          jsonb_build_object('project_id', project_row.id, 'deleted_at', clock_timestamp()));

  delete from public.site_projects where id = p_project_id;
end;
$$;
