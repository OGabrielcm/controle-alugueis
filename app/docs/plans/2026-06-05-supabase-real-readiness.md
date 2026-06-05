# Supabase Real Readiness Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** deixar o app pronto para ler dados reais do Supabase com contrato de schema versionado, smoke test reproduzível e próximo corte claro antes de liberar escrita real.

**Architecture:** manter o app com leitura server-side via `getProperties()`, fallback mock explícito e RLS conservador. O Supabase expõe anon read apenas para seed/demo desatualizado (`source_is_outdated is true`) enquanto insert/update/delete continuam aguardando autenticação/owner_id.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, SQL/RLS, Node smoke script.

---

## Estado verificado em 2026-06-05

- Repo: `/home/hermes/projetos/controle-alugueis/app`
- Branch de trabalho: `feature/supabase-real-readiness`
- `.env.local`: presente, com URL e anon key públicas configuradas.
- Supabase real: projeto responde via PostgREST; tabela `public.properties` tem 11 linhas seed/demo.
- Multipage já existe: `/`, `/imoveis`, `/imoveis/novo`, `/imoveis/[id]`, `/importar`.
- Build local passa.

## Task 1: Sincronizar schema do app com o domínio atual

**Objective:** versionar no repo os campos que a UI já usa para endereço, contato, início de contrato e reajuste anual.

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `src/lib/property-repository.ts`

**Steps:**
1. Adicionar ao SQL: `property_address`, `tenant_contact`, `contract_start_date`, `has_annual_adjustment`, `rent_adjustment_base_date`, `rent_adjustment_index`, `contract_notes`.
2. Aplicar migração idempotente no Supabase real.
3. Expandir `propertyColumns` e `mapSupabaseRow()` para preencher o `PropertyRecord` completo.
4. Verificar que dados nulos continuam válidos porque os campos são opcionais no schema Zod.

**Verification:**
- `npm run smoke:supabase`
- `npm run lint`
- `npm test`
- `npm run build`

## Task 2: Versionar RLS mínimo de leitura demo

**Objective:** garantir que o app leia dados demo com anon key sem abrir dados reais futuros.

**Files:**
- Modify: `supabase/schema.sql`

**Steps:**
1. Manter RLS habilitado em `public.properties`.
2. Conceder `select` para `anon`.
3. Criar policy `properties_demo_read_outdated` com `using (source_is_outdated is true)`.
4. Documentar que writes aguardam autenticação/owner_id.

**Verification:**
- Supabase REST retorna linhas quando filtrado por `source_is_outdated=is.true`.
- O app continua usando fallback se Supabase falhar.

## Task 3: Adicionar smoke test Supabase

**Objective:** criar comando simples para validar env, API e colunas principais sem vazar secrets.

**Files:**
- Create: `scripts/smoke-supabase.mjs`
- Modify: `package.json`
- Modify: `tsconfig.json`

**Steps:**
1. Criar script Node que carrega `.env.local`.
2. Consultar `/rest/v1/properties` com anon key sem imprimir a key.
3. Falhar se zero linhas demo forem retornadas.
4. Verificar se campos contratuais existem na resposta.
5. Adicionar `npm run smoke:supabase`.
6. Adicionar `baseUrl: "."` ao `tsconfig.json` para melhorar resolução local de paths `@/*` fora do Next.

**Verification:**
- `npm run smoke:supabase` imprime `{ ok: true, rows: 3, schemaHasContractFields: true }`.

## Próximo /queue recomendado

**Nome:** persistência segura de cadastro/edição de imóveis.

**Gate HITL antes de executar:** decidir modelo de autenticação/usuário.

Não abrir `insert/update/delete` para `anon`. Antes de persistir formulário no Supabase, decidir uma das opções:

1. **MVP privado com login:** usar Supabase Auth, adicionar `owner_id` em `properties`, policies por `auth.uid()`.
2. **MVP demo sem login:** continuar rascunho local e só leitura demo no Supabase.
3. **Admin interno temporário:** escrita server-side com service role em Server Actions/API route, protegida por autenticação ou segredo fora do browser.

Minha recomendação: opção 1 se o app vai lidar com dados reais; opção 2 se amanhã o foco for só treino/UX; opção 3 só se precisarmos de atalho controlado para uso interno.
