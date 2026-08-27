# Supabase — Striker Sales

Ordem das migrations:

1. `202608250001_create_crm_schema.sql`: tabelas e relacionamentos.
2. `202608250002_add_constraints_indexes_triggers.sql`: validações, índices e `updated_at`.
3. `202608250003_enable_rls_and_policies.sql`: grants mínimos e RLS por proprietário.

## Modelo de segurança

- `anon`: nenhum acesso às quatro tabelas.
- `authenticated`: somente linhas cujo `created_by` ou `owner_id` seja `auth.uid()`.
- `lead_history`: acesso condicionado ao proprietário do lead relacionado.
- `created_by` e `owner_id`: definidos no banco por `default auth.uid()` e protegidos por `with check`.
- `service_role`: nunca utilizada pelo aplicativo.

O teste `tests/striker_sales_rls.test.sql` verifica isolamento entre dois usuários, bloqueio anônimo e CRUD do proprietário.
