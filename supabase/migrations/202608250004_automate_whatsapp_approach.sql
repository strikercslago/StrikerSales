alter table public.lead_history
  drop constraint if exists lead_history_event_type_check;

alter table public.lead_history
  add constraint lead_history_event_type_check check (event_type in (
    'lead_imported', 'lead_created', 'lead_updated', 'whatsapp_opened',
    'approach_sent', 'approach_reverted', 'status_changed', 'message_edited',
    'followup_sent', 'followup_scheduled', 'proposal_created', 'lead_won',
    'lead_deleted', 'lead_restored'
  ));

create or replace function public.start_lead_approach(p_lead_id uuid, p_message text)
returns public.leads
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_row public.leads%rowtype;
  updated_row public.leads%rowtype;
  approached_at_value timestamptz := clock_timestamp();
begin
  select * into before_row
  from public.leads
  where id = p_lead_id
    and created_by = (select auth.uid())
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Lead não encontrado ou não pertence ao usuário.' using errcode = 'P0002';
  end if;

  update public.leads
  set status = 'abordado',
      approached_at = approached_at_value,
      message = coalesce(p_message, '')
  where id = p_lead_id
  returning * into updated_row;

  insert into public.lead_history (lead_id, event_type, metadata)
  values (p_lead_id, 'whatsapp_opened', jsonb_build_object('message', coalesce(p_message, '')));

  insert into public.lead_history (lead_id, event_type, old_value, new_value, metadata)
  values (
    p_lead_id,
    'approach_sent',
    jsonb_build_object('status', before_row.status, 'approachedAt', before_row.approached_at, 'message', before_row.message),
    jsonb_build_object('status', 'abordado', 'approachedAt', approached_at_value, 'message', coalesce(p_message, '')),
    jsonb_build_object('source', 'whatsapp_opened')
  );

  return updated_row;
end;
$$;

create or replace function public.revert_lead_approach(p_lead_id uuid)
returns public.leads
language plpgsql
security invoker
set search_path = ''
as $$
declare
  before_row public.leads%rowtype;
  updated_row public.leads%rowtype;
begin
  select * into before_row
  from public.leads
  where id = p_lead_id
    and created_by = (select auth.uid())
    and deleted_at is null
  for update;

  if not found then
    raise exception 'Lead não encontrado ou não pertence ao usuário.' using errcode = 'P0002';
  end if;

  if before_row.status <> 'abordado' then
    raise exception 'Somente leads abordados podem voltar para Novo.' using errcode = 'P0001';
  end if;

  update public.leads
  set status = 'novo',
      approached_at = null
  where id = p_lead_id
  returning * into updated_row;

  insert into public.lead_history (lead_id, event_type, old_value, new_value)
  values (
    p_lead_id,
    'approach_reverted',
    jsonb_build_object('status', before_row.status, 'approachedAt', before_row.approached_at),
    jsonb_build_object('status', 'novo', 'approachedAt', null)
  );

  return updated_row;
end;
$$;

revoke all on function public.start_lead_approach(uuid, text) from public, anon;
revoke all on function public.revert_lead_approach(uuid) from public, anon;
grant execute on function public.start_lead_approach(uuid, text) to authenticated;
grant execute on function public.revert_lead_approach(uuid) to authenticated;
