create table public.bulk_sender_exports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  fingerprint text not null,
  batch_name text not null,
  campaign text,
  purpose text not null check (purpose in ('initial', 'followup')),
  profile_id text not null,
  profile_version text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (owner_id, fingerprint)
);

create index bulk_sender_exports_owner_created_idx on public.bulk_sender_exports (owner_id, created_at desc);

alter table public.bulk_sender_exports enable row level security;
revoke all on table public.bulk_sender_exports from anon, authenticated;
grant select, insert, update, delete on table public.bulk_sender_exports to authenticated;

create policy "bulk_sender_exports_select_own" on public.bulk_sender_exports for select to authenticated
using (owner_id = (select auth.uid()));
create policy "bulk_sender_exports_insert_own" on public.bulk_sender_exports for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "bulk_sender_exports_update_own" on public.bulk_sender_exports for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "bulk_sender_exports_delete_own" on public.bulk_sender_exports for delete to authenticated
using (owner_id = (select auth.uid()));

alter table public.lead_history drop constraint if exists lead_history_event_type_check;
alter table public.lead_history add constraint lead_history_event_type_check check (event_type in (
  'lead_imported', 'lead_created', 'lead_updated', 'whatsapp_opened',
  'approach_sent', 'approach_reverted', 'status_changed', 'message_edited',
  'followup_sent', 'followup_scheduled', 'proposal_created', 'lead_won',
  'lead_deleted', 'lead_restored', 'validation_resolved'
));

create or replace function public.resolve_lead_validation(p_lead_id uuid)
returns public.leads
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_row public.leads%rowtype;
  updated_row public.leads%rowtype;
  resolved_at_value timestamptz := clock_timestamp();
begin
  select * into before_row from public.leads
  where id = p_lead_id and created_by = (select auth.uid()) and deleted_at is null
  for update;
  if not found then raise exception 'Lead não encontrado ou não pertence ao usuário.' using errcode = 'P0002'; end if;
  if not before_row.validation_required then return before_row; end if;

  update public.leads set validation_required = false where id = p_lead_id returning * into updated_row;
  insert into public.lead_history (lead_id, event_type, old_value, new_value, metadata)
  values (p_lead_id, 'validation_resolved', jsonb_build_object('validationRequired', true), jsonb_build_object('validationRequired', false), jsonb_build_object('resolvedAt', resolved_at_value, 'resolvedBy', auth.uid()));
  return updated_row;
end;
$$;

revoke all on function public.resolve_lead_validation(uuid) from public, anon;
grant execute on function public.resolve_lead_validation(uuid) to authenticated;

comment on table public.bulk_sender_exports is 'Snapshots imutáveis dos arquivos preparados para o Bulk Sender; não comprovam envio, entrega ou leitura.';
