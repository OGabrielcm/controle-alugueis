# Decisões do projeto

## 2026-06-05 -- Página dedicada para solicitar recuperação de senha

O que mudou: `/login` deixou de enviar recuperação diretamente pelo e-mail digitado no formulário e passou a apontar para `/recuperar-senha`, que tem campo próprio, copy segura e redireciona o link Supabase para `/redefinir-senha`.

Por que: validação humana mostrou que não era óbvio precisar preencher o e-mail em `/login` antes de clicar em “Esqueci minha senha”.

Alternativa descartada: manter a ação inline no login e apenas melhorar a mensagem de erro quando o campo estivesse vazio.

Impacto: a recuperação fica explícita, não revela se a conta existe, orienta verificar entrada/spam e, após salvar nova senha, `/redefinir-senha` retorna automaticamente para `/login`.

Como reverter: remover `/recuperar-senha`, voltar o botão inline em `/login` e apontar a recuperação diretamente para `/redefinir-senha`.

## 2026-06-05 -- Recuperação de senha e copy segura de signup

O que mudou: `/login` ganhou ação “Esqueci minha senha”, o link de recuperação aponta para `/redefinir-senha`, e o sucesso de cadastro passou a explicar que signup repetido pode não reenviar confirmação quando a conta já existe.

Por que: validação humana confirmou login real com conta existente e os logs Supabase mostraram `user_repeated_signup`, caso em que a API retorna sucesso sem novo e-mail de confirmação.

Alternativa descartada: continuar mostrando “Conta criada” de forma absoluta ou revelar se uma conta existe pelo fluxo de recuperação.

Impacto: a UX fica mais honesta e segura; recuperação não revela existência da conta e cadastro orienta login/recuperação quando o e-mail já estava registrado.

Como reverter: remover `/redefinir-senha`, o botão de recuperação em `/login` e restaurar a mensagem simples de signup.

## 2026-06-05 -- Login como primeira entrada e dashboard protegido

O que mudou: `/` passou a redirecionar para `/login`, o resumo operacional foi movido para `/dashboard`, as rotas operacionais validam sessão Supabase no client antes de renderizar o shell e o logout virou ação discreta no controle de sessão.

Por que: validação visual mostrou que o app ainda podia cair direto no dashboard quando havia sessão salva no navegador, confundindo cadastro, login confirmado e área operacional.

Alternativa descartada: manter `/` como dashboard demo público e confiar apenas em copy explicativo de login/cadastro.

Impacto: a primeira experiência fica centrada em autenticação; usuário sem sessão volta para `/login`, usuário autenticado entra no dashboard privado em `/dashboard`.

Como reverter: voltar o conteúdo de `/dashboard` para `/`, remover o guard client-side do `AppShell` e restaurar links de resumo para `/`.

## 2026-06-05 -- Separar autenticação do dashboard operacional

O que mudou: `/login` e `/cadastro` viraram páginas próprias fora do shell do dashboard, o item de login saiu da navegação principal e o dashboard ganhou controle de sessão com links de entrada/cadastro ou botão `Sair` quando há usuário autenticado.

Por que: validação humana mostrou que login/cadastro dentro do dashboard confundia o fluxo e que faltava uma saída visível da sessão.

Alternativa descartada: manter um único `AuthPanel` alternando login/cadastro dentro da área operacional.

Impacto: cadastro não é tratado como login verificado; após signup o app força saída e orienta confirmar o e-mail antes de login explícito.

Como reverter: remover `/cadastro`, voltar `AuthPanel` para modo alternável e recolocar auth dentro do shell principal.

## 2026-06-05 -- Supabase Auth como primeiro passo de escrita privada

O que mudou: foi adicionada a rota `/login` com formulário client-side para login/criação de conta via Supabase Auth, além de navegação e validação básica de e-mail/senha.

Por que: antes de trocar rascunhos locais por inserts/updates reais, o app precisa ter uma sessão autenticada para preencher `owner_id = auth.uid()` e respeitar as policies RLS.

Alternativa descartada: implementar writes reais no formulário antes de validar o fluxo de autenticação visualmente.

Impacto: o usuário já consegue testar sessão no navegador; cadastro/edição de imóveis continuam como rascunho local até o próximo PR.

Como reverter: remover `/login`, `AuthPanel`, helpers/testes de auth e o item de navegação, mantendo a preparação de RLS no banco.

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
