create or replace function public.validate_client_owner_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.source_lead_id is not null and not exists (
    select 1 from public.leads lead
    where lead.id = new.source_lead_id and lead.created_by = new.owner_id
  ) then
    raise exception 'O lead de origem deve pertencer ao proprietário do cliente.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function public.validate_site_project_owner_links()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.client_id is not null and not exists (
    select 1 from public.clients client
    where client.id = new.client_id
      and client.owner_id = new.owner_id
      and client.deleted_at is null
  ) then
    raise exception 'O cliente deve pertencer ao proprietário do projeto.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_client_owner_links_before_write
before insert or update of owner_id, source_lead_id on public.clients
for each row execute function public.validate_client_owner_links();

create trigger validate_site_project_owner_links_before_write
before insert or update of owner_id, client_id on public.site_projects
for each row execute function public.validate_site_project_owner_links();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_methodologies', 'site_methodology_stages', 'site_methodology_stage_items',
    'clients', 'site_projects', 'site_project_members', 'site_project_stages',
    'site_project_stage_items', 'site_project_services', 'site_project_competitors',
    'site_project_references', 'site_project_pages', 'site_project_sections',
    'site_project_design_tokens', 'site_project_files', 'site_project_assets',
    'site_project_artifacts', 'site_project_responsive_tests', 'site_project_qa_items',
    'site_project_scores', 'site_project_approvals', 'site_project_gate_overrides',
    'site_project_prompt_runs', 'site_project_history'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end;
$$;

grant select on public.site_methodologies, public.site_methodology_stages,
  public.site_methodology_stage_items to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert on public.site_projects to authenticated;
grant update (
  client_id, responsible_user_id, name, status, current_stage_key, start_date,
  estimated_deadline, platform, platform_other, business_description, main_offer,
  priority_audience, primary_goal, primary_cta, differentials, problems, notes
) on public.site_projects to authenticated;
grant select, insert, update, delete on public.site_project_members to authenticated;
grant select on public.site_project_stages to authenticated;
grant update (data) on public.site_project_stages to authenticated;
grant select on public.site_project_stage_items to authenticated;
grant update (value, status) on public.site_project_stage_items to authenticated;
grant select, insert, update, delete on public.site_project_services,
  public.site_project_competitors, public.site_project_references,
  public.site_project_pages, public.site_project_sections,
  public.site_project_design_tokens, public.site_project_files,
  public.site_project_assets, public.site_project_artifacts,
  public.site_project_responsive_tests, public.site_project_qa_items,
  public.site_project_scores to authenticated;
grant select on public.site_project_approvals, public.site_project_gate_overrides,
  public.site_project_history to authenticated;
grant select, insert on public.site_project_prompt_runs to authenticated;
grant select on public.site_project_progress_v to authenticated;

create policy "authenticated read active methodology"
on public.site_methodologies for select to authenticated
using (is_active);
create policy "authenticated read methodology stages"
on public.site_methodology_stages for select to authenticated
using (exists (
  select 1 from public.site_methodologies methodology
  where methodology.version = methodology_version and methodology.is_active
));
create policy "authenticated read methodology items"
on public.site_methodology_stage_items for select to authenticated
using (exists (
  select 1 from public.site_methodologies methodology
  where methodology.version = methodology_version and methodology.is_active
));

create policy "owners select clients" on public.clients for select to authenticated
using (owner_id = (select auth.uid()));
create policy "owners insert clients" on public.clients for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "owners update clients" on public.clients for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owners delete clients" on public.clients for delete to authenticated
using (owner_id = (select auth.uid()));

create policy "members select projects" on public.site_projects for select to authenticated
using (public.has_site_project_role(id));
create policy "owners insert projects" on public.site_projects for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "editors update projects" on public.site_projects for update to authenticated
using (public.has_site_project_role(id, array['owner', 'editor', 'admin']))
with check (public.has_site_project_role(id, array['owner', 'editor', 'admin']));

create policy "members select memberships" on public.site_project_members for select to authenticated
using (public.has_site_project_role(project_id));
create policy "admins insert memberships" on public.site_project_members for insert to authenticated
with check (public.has_site_project_role(project_id, array['owner', 'admin']));
create policy "admins update memberships" on public.site_project_members for update to authenticated
using (public.has_site_project_role(project_id, array['owner', 'admin']))
with check (public.has_site_project_role(project_id, array['owner', 'admin']));
create policy "admins delete memberships" on public.site_project_members for delete to authenticated
using (public.has_site_project_role(project_id, array['owner', 'admin']));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_project_stages', 'site_project_stage_items', 'site_project_services',
    'site_project_competitors', 'site_project_references', 'site_project_pages',
    'site_project_sections', 'site_project_design_tokens', 'site_project_files',
    'site_project_assets', 'site_project_artifacts', 'site_project_responsive_tests',
    'site_project_qa_items', 'site_project_scores', 'site_project_prompt_runs'
  ]
  loop
    if table_name = 'site_project_stage_items' then
      execute format(
        'create policy "members select %1$s" on public.%1$I for select to authenticated using (exists (select 1 from public.site_project_stages stage where stage.id = stage_id and public.has_site_project_role(stage.project_id)))',
        table_name
      );
      execute format(
        'create policy "editors write %1$s" on public.%1$I for all to authenticated using (exists (select 1 from public.site_project_stages stage where stage.id = stage_id and public.has_site_project_role(stage.project_id, array[''owner'', ''editor'', ''admin'']))) with check (exists (select 1 from public.site_project_stages stage where stage.id = stage_id and public.has_site_project_role(stage.project_id, array[''owner'', ''editor'', ''admin''])))',
        table_name
      );
    else
      execute format(
        'create policy "members select %1$s" on public.%1$I for select to authenticated using (public.has_site_project_role(project_id))',
        table_name
      );
      execute format(
        'create policy "editors write %1$s" on public.%1$I for all to authenticated using (public.has_site_project_role(project_id, array[''owner'', ''editor'', ''admin''])) with check (public.has_site_project_role(project_id, array[''owner'', ''editor'', ''admin'']))',
        table_name
      );
    end if;
  end loop;
end;
$$;

create policy "members select approvals" on public.site_project_approvals for select to authenticated
using (public.has_site_project_role(project_id));
create policy "members select gate overrides" on public.site_project_gate_overrides for select to authenticated
using (public.has_site_project_role(project_id));
create policy "members select project history" on public.site_project_history for select to authenticated
using (project_id is not null and public.has_site_project_role(project_id));

revoke all on function public.has_site_project_role(uuid, text[]) from public, anon;
revoke all on function public.site_project_progress(uuid) from public, anon;
revoke all on function public.set_site_project_stage_status(uuid, text, text, text) from public, anon;
revoke all on function public.decide_site_project_stage(uuid, text, text, text) from public, anon;
revoke all on function public.soft_delete_site_project(uuid) from public, anon;
revoke all on function public.permanently_delete_site_project(uuid, text) from public, anon;
grant execute on function public.has_site_project_role(uuid, text[]) to authenticated;
grant execute on function public.site_project_progress(uuid) to authenticated;
grant execute on function public.set_site_project_stage_status(uuid, text, text, text) to authenticated;
grant execute on function public.decide_site_project_stage(uuid, text, text, text) to authenticated;
grant execute on function public.soft_delete_site_project(uuid) to authenticated;
grant execute on function public.permanently_delete_site_project(uuid, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-projects',
  'site-projects',
  false,
  52428800,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml',
    'application/pdf', 'font/woff', 'font/woff2',
    'video/mp4', 'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_access_site_project_object(p_object_name text, p_write boolean default false)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(p_object_name);
  project_id uuid;
begin
  if coalesce(array_length(folders, 1), 0) < 3
     or folders[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     or folders[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return false;
  end if;

  project_id := folders[2]::uuid;
  return exists (
    select 1
    from public.site_projects project
    where project.id = project_id
      and project.owner_id::text = folders[1]
      and project.deleted_at is null
      and public.has_site_project_role(
        project.id,
        case when p_write then array['owner', 'editor', 'admin']::text[] else null end
      )
  );
end;
$$;

revoke all on function public.can_access_site_project_object(text, boolean) from public, anon;
grant execute on function public.can_access_site_project_object(text, boolean) to authenticated;

create policy "project members read site project objects"
on storage.objects for select to authenticated
using (bucket_id = 'site-projects' and public.can_access_site_project_object(name, false));

create policy "project editors insert site project objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'site-projects' and public.can_access_site_project_object(name, true));

create policy "project editors update site project objects"
on storage.objects for update to authenticated
using (bucket_id = 'site-projects' and public.can_access_site_project_object(name, true))
with check (bucket_id = 'site-projects' and public.can_access_site_project_object(name, true));

create policy "project editors delete site project objects"
on storage.objects for delete to authenticated
using (bucket_id = 'site-projects' and public.can_access_site_project_object(name, true));
