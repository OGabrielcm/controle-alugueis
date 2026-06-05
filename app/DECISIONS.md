# Decisions

## 2026-06-05 -- Preparar MVP privado com ownership por usuário

O que mudou: `public.properties` passou a ter `owner_id` referenciando `auth.users(id)`, índice por dono e policies RLS para `authenticated` ler/escrever apenas linhas em que `owner_id = auth.uid()`.

Por que: Mercês escolheu o caminho de MVP privado com login antes de liberar escrita real de imóveis, evitando `insert/update/delete` público via `anon`.

Alternativa descartada: manter escrita indefinida até a tela de login ficar pronta ou abrir escrita temporária para `anon`.

Impacto: o banco fica preparado para persistência real segura; a UI ainda precisa implementar Supabase Auth e preencher `owner_id` no insert antes de trocar rascunhos locais por writes reais.

Como reverter: remover as policies `properties_owner_*`, dropar o índice `properties_owner_id_idx` e remover a coluna `owner_id` se o modelo de propriedade mudar.

## 2026-06-05 -- Revoke execução pública de função SECURITY DEFINER

O que mudou: foi revogado `execute` de `public.rls_auto_enable()` para `anon`, `authenticated` e `public` no Supabase real.

Por que: o Supabase Advisor alertou que a função `SECURITY DEFINER` estava executável pela API pública; depois da migração, os advisors de segurança ficaram sem lints.

Alternativa descartada: ignorar o advisor por não bloquear o MVP.

Impacto: reduz superfície de ataque sem afetar o app, porque essa função é administrativa/event-trigger e não deveria ser chamada pelo frontend.

Como reverter: conceder execute novamente, apenas se uma automação legítima precisar chamar essa função via role específica.

## 2026-06-05 -- Supabase real com leitura demo segura

O que mudou: o schema versionado passou a incluir os campos contratuais/cadastrais que a UI já usa, e o Supabase real recebeu migração idempotente para esses campos.

Por que: o app já tinha `.env.local` apontando para Supabase real e a UI multipage pronta; faltava alinhar o banco com o contrato de domínio antes de avançar para escrita real.

Alternativa descartada: abrir insert/update/delete para `anon` para persistir formulários imediatamente.

Impacto: leitura demo via anon continua possível apenas para linhas com `source_is_outdated is true`; dados reais futuros não devem ser expostos sem autenticação/owner_id.

Como reverter: remover os campos adicionados da tabela e do `propertyColumns`/mapper se o domínio mudar; remover a policy `properties_demo_read_outdated` se o app deixar de usar seed público.

## 2026-06-05 -- Smoke test Supabase versionado

O que mudou: foi criado `npm run smoke:supabase` para validar env pública, API REST, linhas demo e presença dos campos contratuais.

Por que: Supabase/Vercel precisam de verificação reproduzível antes de deploy e antes de mexer em persistência.

Alternativa descartada: validar somente pelo browser/build, que não prova se a API está retornando dados com a anon key.

Impacto: qualquer pessoa com `.env.local` configurado consegue validar a integração sem imprimir secrets.

Como reverter: remover `scripts/smoke-supabase.mjs` e o script `smoke:supabase` do `package.json`.
