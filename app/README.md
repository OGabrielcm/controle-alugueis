# Controle de Aluguéis

App para transformar uma planilha de controle de imóveis e aluguéis em um produto web para o proprietário acompanhar carteira, contratos, pagamentos, vencimentos e reajustes.

O objetivo do projeto é evoluir primeiro o fluxo de produto e domínio, com funcionalidades validadas localmente, antes de priorizar deploy, portfólio visual ou abertura pública do repositório.

## Status atual

- Base em Next.js com App Router, TypeScript e Tailwind CSS.
- Layout segmentado em múltiplas páginas, evitando um fluxo concentrado em uma única tela.
- Shell visual com navegação principal.
- `/login` é a primeira entrada; o dashboard operacional mora em `/dashboard` e as demais rotas ficam atrás de sessão Supabase.
- Componentes base de UI inspirados em shadcn/ui.
- Dados mockados disponíveis para desenvolvimento local.
- Supabase real configurado para leitura demo segura, com fallback/mock se a conexão falhar.
- Modelo de ownership preparado para MVP privado: `properties.owner_id` + policies RLS por usuário autenticado.
- Cadastro, edição e exclusão de imóveis já usam sessão Supabase quando há usuário autenticado; sem sessão/configuração, o app mantém fallback local para desenvolvimento.
- Anexos de contrato usam bucket privado, path interno e signed URL temporária para abertura.

## Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Zod
- Componentes base de UI inspirados em shadcn/ui

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`; a raiz redireciona para `/login`.

## Scripts úteis

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm run smoke:supabase
```

### Playwright E2E

- `npm run test:e2e` inicia o app local e valida as entradas públicas de autenticação no Chromium.
- A suíte atual cobre o redirect `/` → `/login`, login, cadastro, recuperação de senha e o estado visível da configuração Supabase sem imprimir credenciais.
- Traces, screenshots e vídeos são preservados somente em falhas e ficam ignorados pelo Git.
- A jornada autenticada `login → dashboard → criar → editar → excluir` continua pendente até existir uma conta de teste descartável com dados fake; ausência de credenciais não é tratada como gate verde.
- Antes de usar contratos ou dados reais, continue executando o smoke Supabase, a auditoria multiconta e o dogfood familiar manual.

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Rode o SQL em `supabase/seed.sql` se quiser popular a base demo/desatualizada.
4. Rode o SQL em `supabase/storage.sql` para criar o bucket privado `property-contracts` usado pelos documentos de contrato.
5. Copie `.env.example` para `.env.local`.
6. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

A primeira versão funciona com dados mockados mesmo sem Supabase configurado. Quando Supabase está configurado, o app tenta ler `public.properties` em tempo de execução e cai para mock se houver erro, tabela vazia ou linhas inválidas.

### RLS atual

- `public.properties` tem RLS habilitado.
- `anon` lê apenas linhas demo/desatualizadas com `source_is_outdated is true` via policy `properties_demo_read_outdated`.
- `authenticated` pode ler/escrever apenas imóveis em que `owner_id = auth.uid()`.
- `/login`, `/cadastro`, `/recuperar-senha` e `/redefinir-senha` ficam separados do dashboard operacional e usam Supabase Auth no browser.
- `/` redireciona para `/login`; o resumo operacional fica em `/dashboard`.
- Rotas operacionais (`/dashboard`, `/imoveis`, `/imoveis/novo`, `/importar`) validam sessão no client e voltam para `/login` quando não há usuário ativo.
- Cadastro não é tratado como login verificado: depois do signup, o app força saída e orienta confirmar o e-mail antes de entrar.
- O cadastro coleta nome, e-mail, confirmação de e-mail, senha e confirmação de senha; o nome é enviado para os metadados do usuário no Supabase Auth.
- Cadastro repetido recebe copy segura: Supabase pode retornar sucesso sem reenviar confirmação quando a conta já existe.
- `/login` oferece link claro para `/recuperar-senha`; essa tela tem campo próprio de e-mail e envia link para `/redefinir-senha` sem revelar se a conta existe.
- Ao salvar nova senha em `/redefinir-senha`, o app mostra confirmação curta e volta automaticamente para `/login`.
- O dashboard exibe controle de sessão com links de entrar/cadastrar ou botão `Sair` discreto quando há sessão ativa.
- A UI de cadastro/edição de imóveis já tenta persistir no Supabase quando há sessão ativa, preenchendo `owner_id` com o usuário autenticado; sem sessão/configuração, mantém fallback de rascunho local.
- Não abrir escrita para `anon`.
- Use `npm run smoke:supabase` para validar a leitura real sem imprimir secrets.

### Migrações versionadas

- `supabase/migrations/20260605_prepare_owner_rls.sql` prepara `owner_id`, índice e policies de dono autenticado.
- `supabase/migrations/20260713_validate_contract_dates_and_text.sql` bloqueia novas datas contratuais invertidas e limita textos; constraints legadas ficam `NOT VALID` até a revisão manual dos registros antigos.
- `supabase/schema.sql` reflete o estado esperado para ambientes novos.

### Anexos de contrato

- A tela de detalhe do imóvel permite selecionar ou arrastar/soltar PDF/DOCX de contrato para o Supabase Storage.
- Bucket esperado: `property-contracts`.
- Limite atual: PDF ou DOCX de até 10MB.
- O upload registra o path privado do arquivo em `properties.contract_url` quando há sessão Supabase ativa.
- A abertura do contrato gera uma signed URL temporária; não salve links temporários em docs, issues ou logs.
- A remoção de contrato limpa o vínculo do imóvel e tenta remover o objeto privado do Storage.
- Antes de usar documentos reais, valide manualmente RLS/Storage com duas contas e arquivos fake.

## Observações técnicas

### Auditoria de dependências

Durante a instalação das dependências do design system, o `npm audit` reportou vulnerabilidades moderadas relacionadas à cadeia de dependências do Next/PostCSS.

A correção automática sugerida com `npm audit fix --force` não deve ser aplicada agora, porque ela tenta resolver o alerta com uma troca arriscada de versão do Next e pode quebrar o projeto.

Decisão atual:

- Não rodar `npm audit fix --force`.
- Manter o desenvolvimento local normalmente.
- Reavaliar o audit antes de qualquer deploy real.
- Atualizar Next/PostCSS apenas por caminho seguro, seguido de `npm run lint` e `npm run build`.

## Próximos passos sugeridos

A sequência abaixo prioriza fechar MVP familiar antes de deploy/polimento:

1. **MVP Readiness Review**
   - Consulte `docs/mvp-readiness-review.md`.
   - Separar o que já está pronto, gaps P0/P1/P2 e checklist familiar.

2. **Validação Supabase/RLS/Storage com dados fake**
   - Validar Auth, CRUD real, exclusão, anexos privados, signed URL e isolamento entre duas contas.
   - Rodar `npm run test:e2e`, `npm run smoke:supabase` e `npm run audit:multiconta` quando o ambiente local estiver configurado.

3. **Dogfood familiar guiado**
   - Mercês testa com 2–3 imóveis fake-realistas.
   - Depois mãe/irmão validam se conseguem entender cadastro, lista, detalhe, anexo, pendências e logout.

4. **Importação da planilha**
   - Evoluir `/importar` para mapear colunas, validar dados e exibir prévia antes de salvar.

5. **Preparação para deploy**
   - Reavaliar `npm audit`.
   - Rodar lint/build.
   - Revisar variáveis de ambiente.
   - Só então preparar Vercel.

6. **Futuro: avisos automáticos**
   - Planejar envio de e-mails antes do vencimento do contrato.
   - Planejar envio de e-mails antes da data de reajuste anual.
   - Definir frequência, destinatários e templates dos lembretes.

## Deploy Vercel

O deploy ainda não é prioridade do projeto.

Quando chegar a hora:

- Importar este projeto na Vercel.
- Configurar as mesmas variáveis de ambiente.
- Rodar `npm run lint` e `npm run build` antes do deploy.
- Reavaliar vulnerabilidades com `npm audit`.
- Conectar deploy automático via Git quando o repositório estiver pronto.
