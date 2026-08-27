alter table public.lead_batches enable row level security;
alter table public.leads enable row level security;
alter table public.lead_history enable row level security;
alter table public.app_settings enable row level security;

revoke all on table public.lead_batches, public.leads, public.lead_history, public.app_settings from anon, authenticated;
grant select, insert, update, delete on table public.lead_batches, public.leads, public.lead_history, public.app_settings to authenticated;

create policy "owners select lead batches"
on public.lead_batches for select to authenticated
using (created_by = (select auth.uid()));
create policy "owners insert lead batches"
on public.lead_batches for insert to authenticated
with check (created_by = (select auth.uid()));
create policy "owners update lead batches"
on public.lead_batches for update to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy "owners delete lead batches"
on public.lead_batches for delete to authenticated
using (created_by = (select auth.uid()));

create policy "owners select leads"
on public.leads for select to authenticated
using (created_by = (select auth.uid()));
create policy "owners insert leads"
on public.leads for insert to authenticated
with check (created_by = (select auth.uid()));
create policy "owners update leads"
on public.leads for update to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy "owners delete leads"
on public.leads for delete to authenticated
using (created_by = (select auth.uid()));

create policy "owners select lead history"
on public.lead_history for select to authenticated
using (exists (select 1 from public.leads where leads.id = lead_history.lead_id and leads.created_by = (select auth.uid())));
create policy "owners insert lead history"
on public.lead_history for insert to authenticated
with check (exists (select 1 from public.leads where leads.id = lead_history.lead_id and leads.created_by = (select auth.uid())));
create policy "owners update lead history"
on public.lead_history for update to authenticated
using (exists (select 1 from public.leads where leads.id = lead_history.lead_id and leads.created_by = (select auth.uid())))
with check (exists (select 1 from public.leads where leads.id = lead_history.lead_id and leads.created_by = (select auth.uid())));
create policy "owners delete lead history"
on public.lead_history for delete to authenticated
using (exists (select 1 from public.leads where leads.id = lead_history.lead_id and leads.created_by = (select auth.uid())));

create policy "owners select settings"
on public.app_settings for select to authenticated
using (owner_id = (select auth.uid()));
create policy "owners insert settings"
on public.app_settings for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "owners update settings"
on public.app_settings for update to authenticated
using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owners delete settings"
on public.app_settings for delete to authenticated
using (owner_id = (select auth.uid()));
