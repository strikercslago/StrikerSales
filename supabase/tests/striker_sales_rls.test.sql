begin;
select plan(16);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner-a@striker.test'),
  ('22222222-2222-2222-2222-222222222222', 'owner-b@striker.test');

set local role anon;
select throws_ok('select * from public.leads', '42501', null, 'anon cannot read leads');
select throws_ok($$insert into public.leads (name) values ('Anon')$$, '42501', null, 'anon cannot create leads');

set local role postgres;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
set local role authenticated;
select lives_ok($$insert into public.leads (id, name) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lead A')$$, 'owner A creates own lead');
select results_eq($$select name from public.leads where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, array['Lead A'], 'owner A reads own lead');
select lives_ok($$update public.leads set city = 'Passo Fundo' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'owner A updates own lead');
select lives_ok($$insert into public.lead_history (lead_id, event_type) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lead_created')$$, 'owner A creates own history');
select results_eq($$select count(*)::int from public.lead_history$$, array[1], 'owner A reads own history');
select lives_ok($$insert into public.app_settings (key, value) values ('daily_goal', '{"target":15}')$$, 'owner A creates own setting');

set local role postgres;
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
set local role authenticated;
select results_eq($$select count(*)::int from public.leads$$, array[0], 'owner B cannot read owner A leads');
select results_eq($$update public.leads set city = 'Erechim' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' returning 1$$, array[]::int[], 'owner B cannot update owner A lead');
select results_eq($$delete from public.leads where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' returning 1$$, array[]::int[], 'owner B cannot permanently delete owner A lead');
select results_eq($$select count(*)::int from public.lead_history$$, array[0], 'owner B cannot read owner A history');
select results_eq($$select count(*)::int from public.app_settings$$, array[0], 'owner B cannot read owner A settings');

set local role postgres;
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
set local role authenticated;
select lives_ok($$update public.leads set deleted_at = now() where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'owner A soft deletes own lead');
select lives_ok($$update public.leads set deleted_at = null where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'owner A restores own lead');
select lives_ok($$delete from public.leads where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'owner A permanently deletes own lead');

select * from finish();
rollback;
