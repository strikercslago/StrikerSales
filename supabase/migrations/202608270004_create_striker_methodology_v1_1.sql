update public.site_methodologies
set is_active = false
where version = '1.0';

insert into public.site_methodologies (version, name, description, definition, is_active)
values (
  '1.1',
  'Arquivo Striker v1.1',
  'Metodologia oficial do Striker Project System com 19 etapas operacionais.',
  jsonb_build_object(
    'progress_model', 'weighted_required_items',
    'default_weight', 1,
    'development_gate', jsonb_build_array(
      'strategy', 'architecture', 'visual_direction', 'design_system', 'high_fidelity'
    )
  ),
  true
);

insert into public.site_methodology_stages
  (methodology_version, stage_key, title, position, requires_approval, definition)
values
  ('1.1', 'discovery', 'Descoberta', 1, false, '{}'::jsonb),
  ('1.1', 'research', 'Pesquisa', 2, false, '{}'::jsonb),
  ('1.1', 'strategy', 'Estratégia', 3, true, '{}'::jsonb),
  ('1.1', 'architecture', 'Arquitetura', 4, true, '{}'::jsonb),
  ('1.1', 'visual_direction', 'Direção Visual', 5, true, '{}'::jsonb),
  ('1.1', 'design_system', 'Design System', 6, false, '{}'::jsonb),
  ('1.1', 'wireframe', 'Wireframe', 7, false, '{}'::jsonb),
  ('1.1', 'high_fidelity', 'High Fidelity', 8, true, '{}'::jsonb),
  ('1.1', 'assets', 'Assets', 9, false, '{}'::jsonb),
  ('1.1', 'development', 'Desenvolvimento', 10, false, '{}'::jsonb),
  ('1.1', 'motion', 'Motion', 11, false, '{}'::jsonb),
  ('1.1', 'responsive', 'Responsividade', 12, false, '{}'::jsonb),
  ('1.1', 'accessibility', 'Acessibilidade', 13, false, '{}'::jsonb),
  ('1.1', 'performance', 'Performance', 14, false, '{}'::jsonb),
  ('1.1', 'seo', 'SEO', 15, false, '{}'::jsonb),
  ('1.1', 'qa_visual', 'QA Visual', 16, false, '{}'::jsonb),
  ('1.1', 'qa_functional', 'QA Funcional', 17, false, '{}'::jsonb),
  ('1.1', 'publication', 'Publicação', 18, false, '{}'::jsonb),
  ('1.1', 'delivery', 'Entrega', 19, false, '{}'::jsonb);

insert into public.site_methodology_stage_items
  (methodology_version, stage_key, item_key, group_key, label, item_type, required, weight, sort_order)
values
  ('1.1', 'discovery', 'briefing', 'foundation', 'Briefing inicial consolidado', 'document', true, 1, 10),
  ('1.1', 'discovery', 'business_context', 'foundation', 'Contexto do negócio registrado', 'field', true, 1, 20),
  ('1.1', 'research', 'market_landscape', 'research', 'Cenário de mercado pesquisado', 'document', true, 1, 10),
  ('1.1', 'research', 'audience_insights', 'research', 'Insights do público registrados', 'document', true, 1, 20),
  ('1.1', 'research', 'competitor_review', 'research', 'Concorrentes relevantes analisados', 'checklist', true, 1, 30),
  ('1.1', 'strategy', 'positioning', 'strategy', 'Posicionamento definido', 'document', true, 1, 10),
  ('1.1', 'strategy', 'site_goal', 'strategy', 'Objetivo e CTA principal definidos', 'field', true, 1, 20),
  ('1.1', 'architecture', 'sitemap', 'architecture', 'Mapa do site concluído', 'artifact', true, 1, 10),
  ('1.1', 'architecture', 'page_hierarchy', 'architecture', 'Hierarquia das páginas validada', 'checklist', true, 1, 20),
  ('1.1', 'visual_direction', 'moodboard', 'visual', 'Moodboard registrado', 'artifact', true, 1, 10),
  ('1.1', 'visual_direction', 'visual_principles', 'visual', 'Princípios da direção visual definidos', 'document', true, 1, 20),
  ('1.1', 'design_system', 'design_tokens', 'design_system', 'Tokens fundamentais configurados', 'checklist', true, 1, 10),
  ('1.1', 'design_system', 'core_components', 'design_system', 'Componentes essenciais definidos', 'checklist', true, 1, 20),
  ('1.1', 'wireframe', 'key_page_wireframes', 'wireframe', 'Wireframes das páginas-chave concluídos', 'artifact', true, 1, 10),
  ('1.1', 'high_fidelity', 'key_page_designs', 'high_fidelity', 'Telas em alta fidelidade concluídas', 'artifact', true, 1, 10),
  ('1.1', 'assets', 'asset_inventory', 'assets', 'Inventário de assets concluído', 'checklist', true, 1, 10),
  ('1.1', 'assets', 'required_assets_ready', 'assets', 'Assets obrigatórios preparados', 'checklist', true, 1, 20),
  ('1.1', 'development', 'implementation', 'development', 'Implementação principal concluída', 'checklist', true, 1, 10),
  ('1.1', 'motion', 'motion_specification', 'motion', 'Movimentos e transições especificados', 'document', true, 1, 10),
  ('1.1', 'motion', 'motion_validation', 'motion', 'Motion validado em contexto', 'checklist', true, 1, 20),
  ('1.1', 'responsive', 'viewports', 'responsive', 'Viewports principais validados', 'checklist', true, 1, 10),
  ('1.1', 'accessibility', 'a11y_checklist', 'quality', 'Checklist de acessibilidade concluído', 'checklist', true, 1, 10),
  ('1.1', 'performance', 'performance_checklist', 'quality', 'Checklist de performance concluído', 'checklist', true, 1, 10),
  ('1.1', 'seo', 'seo_checklist', 'quality', 'Checklist técnico de SEO concluído', 'checklist', true, 1, 10),
  ('1.1', 'qa_visual', 'visual_consistency', 'quality', 'Consistência visual validada', 'checklist', true, 1, 10),
  ('1.1', 'qa_visual', 'visual_issues_resolved', 'quality', 'Pendências visuais críticas resolvidas', 'checklist', true, 1, 20),
  ('1.1', 'qa_functional', 'functional_flows', 'quality', 'Fluxos funcionais validados', 'checklist', true, 1, 10),
  ('1.1', 'qa_functional', 'functional_issues_resolved', 'quality', 'Pendências funcionais críticas resolvidas', 'checklist', true, 1, 20),
  ('1.1', 'publication', 'production_release', 'release', 'Publicação em produção concluída', 'checklist', true, 1, 10),
  ('1.1', 'delivery', 'handoff', 'delivery', 'Handoff e entrega concluídos', 'checklist', true, 1, 10);

create unique index site_methodologies_one_active_idx
on public.site_methodologies ((is_active))
where is_active;

create or replace function public.active_site_methodology_version()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  active_version text;
begin
  select methodology.version into active_version
  from public.site_methodologies methodology
  where methodology.is_active
  order by methodology.created_at desc
  limit 1;

  if active_version is null then
    raise exception 'Nenhuma metodologia ativa foi configurada.' using errcode = 'P0001';
  end if;

  return active_version;
end;
$$;

alter table public.site_projects
  alter column methodology_version set default public.active_site_methodology_version();

create or replace function public.prevent_site_project_methodology_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.methodology_version is distinct from old.methodology_version then
    raise exception 'A metodologia de um projeto é imutável após sua criação.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger prevent_site_project_methodology_change_before_update
before update of methodology_version on public.site_projects
for each row execute function public.prevent_site_project_methodology_change();

revoke all on function public.active_site_methodology_version() from public, anon;
grant execute on function public.active_site_methodology_version() to authenticated;
