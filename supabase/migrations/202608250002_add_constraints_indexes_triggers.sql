alter table public.leads
  add constraint leads_priority_check check (priority in ('alta', 'media', 'baixa')),
  add constraint leads_status_check check (status in ('novo', 'abordado', 'respondeu', 'interessado', 'sem_interesse', 'possui_fornecedor', 'followup', 'proposta', 'fechado')),
  add constraint leads_rating_check check (rating is null or (rating >= 0 and rating <= 5)),
  add constraint leads_review_count_check check (review_count is null or review_count >= 0);

alter table public.lead_history
  add constraint lead_history_event_type_check check (event_type in (
    'lead_imported', 'lead_created', 'lead_updated', 'whatsapp_opened',
    'approach_sent', 'status_changed', 'message_edited', 'followup_sent',
    'followup_scheduled', 'proposal_created', 'lead_won', 'lead_deleted', 'lead_restored'
  ));

create index leads_owner_active_idx on public.leads (created_by, deleted_at);
create index leads_owner_status_idx on public.leads (created_by, status) where deleted_at is null;
create index leads_owner_segment_idx on public.leads (created_by, segment) where deleted_at is null;
create index leads_owner_priority_idx on public.leads (created_by, priority) where deleted_at is null;
create index leads_normalized_phone_idx on public.leads (created_by, normalized_phone);
create index leads_source_external_id_idx on public.leads (created_by, source, external_id);
create index leads_followup_at_idx on public.leads (created_by, followup_at) where deleted_at is null;
create index lead_history_lead_created_idx on public.lead_history (lead_id, created_at desc);
create index lead_batches_owner_created_idx on public.lead_batches (created_by, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();
