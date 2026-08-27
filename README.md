# Striker Sales

MVP interno de prospecção da Striker com Supabase Auth, persistência PostgreSQL, RLS por proprietário e migração dos dados legados do navegador.

## Executar

```bash
npm install
npm run dev
```

Copie `.env.local.example` para `.env.local` e preencha:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

Use somente a chave pública `publishable`. Nunca use `service_role` ou uma secret key no frontend.

Abra `http://localhost:3001`. A porta 3001 é fixa para não conflitar com o projeto Radioativa, que utiliza a porta 3000.

## Banco e autenticação

As migrations versionadas ficam em `supabase/migrations`. O acesso anônimo é negado e usuários autenticados acessam somente seus próprios registros por `auth.uid()`.

No painel do Supabase, mantenha cadastro público desabilitado e crie o usuário interno manualmente. Para vincular e aplicar as migrations:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Para executar os testes locais de RLS, com Docker disponível:

```bash
npx supabase start
npx supabase test db
```

## Verificações

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
