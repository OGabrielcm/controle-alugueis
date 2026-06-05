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
npm run smoke:supabase
```

## Supabase

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql`.
3. Rode o SQL em `supabase/seed.sql` se quiser popular a base demo/desatualizada.
4. Rode o SQL em `supabase/storage.sql` para criar o bucket público `property-contracts` usado pelos documentos de contrato.
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
- Cadastro repetido recebe copy segura: Supabase pode retornar sucesso sem reenviar confirmação quando a conta já existe.
- `/login` oferece link claro para `/recuperar-senha`; essa tela tem campo próprio de e-mail e envia link para `/redefinir-senha` sem revelar se a conta existe.
- Ao salvar nova senha em `/redefinir-senha`, o app mostra confirmação curta e volta automaticamente para `/login`.
- O dashboard exibe controle de sessão com links de entrar/cadastrar ou botão `Sair` discreto quando há sessão ativa.
- A UI de cadastro/edição de imóveis já tenta persistir no Supabase quando há sessão ativa, preenchendo `owner_id` com o usuário autenticado; sem sessão/configuração, mantém fallback de rascunho local.
- Não abrir escrita para `anon`.
- Use `npm run smoke:supabase` para validar a leitura real sem imprimir secrets.

### Migrações versionadas

- `supabase/migrations/20260605_prepare_owner_rls.sql` prepara `owner_id`, índice e policies de dono autenticado.
- `supabase/schema.sql` reflete o estado esperado para ambientes novos.

### Anexos de contrato

- A tela de detalhe do imóvel permite selecionar ou arrastar/soltar PDF/DOCX de contrato para o Supabase Storage.
- Bucket esperado: `property-contracts`.
- Limite atual: PDF ou DOCX de até 10MB.
- Enquanto a escrita real da tabela `properties` não estiver implementada, o link gerado pelo upload fica salvo como rascunho local no navegador.
- Antes de produção, revisar policies do Storage e trocar bucket público por acesso privado/signed URL se houver dados sensíveis.

## Observações técnicas

### Auditoria de dependências

Durante a instalação das dependências do design system, o `npm audit` reportou vulnerabilidades moderadas relacionadas à cadeia de dependências do Next/PostCSS.

A correção automática sugerida com `npm audit fix --force` não deve ser aplicada agora, porque ela tenta resolver o alerta com uma troca arriscada de versão do Next e pode quebrar o projeto.

Decisão atual:

- Não rodar `npm audit fix --force`.
- Manter o desenvolvimento local normalmente.
- Reavaliar o audit antes de qualquer deploy real.
- Atualizar Next/PostCSS apenas por caminho seguro, seguido de `npm run lint` e `npm run build`.

## Próximos PRs sugeridos

A sequência abaixo prioriza produto e validação de domínio antes de deploy/polimento:

1. **PR de documentação viva**
   - Atualizar README com status real, decisões técnicas e roadmap curto.
   - Registrar alertas conhecidos sem bloquear desenvolvimento.

2. **PR de cadastro de imóvel funcional**
   - Evoluir `/imoveis/novo` para capturar dados principais do imóvel.
   - Validar campos com Zod.
   - Salvar inicialmente no repositório local/mock ou preparar contrato para Supabase.

3. **PR de listagem de imóveis mais útil**
   - Melhorar `/imoveis` com cards ou tabela mais clara.
   - Adicionar estados vazios, totais básicos e links de ação.
   - Separar melhor visualização de lista e detalhe.

4. **PR de detalhe do imóvel e contratos**
   - Criar rota de detalhe por imóvel.
   - Mostrar dados principais, aluguel, status e histórico básico.
   - Preparar espaço para contratos, pagamentos, anexos e observações.

5. **PR de agenda contratual**
   - Registrar data de início, vencimento e regra de reajuste anual do contrato.
   - Identificar contratos próximos do vencimento.
   - Identificar quando o aluguel deve aumentar por cláusula anual de reajuste.

6. **PR de importação da planilha**
   - Evoluir `/importar` para mapear colunas e validar dados.
   - Transformar dados importados no formato interno do app.
   - Exibir prévia antes de salvar.

7. **PR de integração real com Supabase**
   - Validar visualmente o Supabase Auth em `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/dashboard` e botão `Sair`.
   - Validar visualmente cadastro e edição reais com usuário logado, confirmando que as linhas entram com `owner_id = auth.uid()`.
   - Armazenar anexos de contrato de forma vinculada ao imóvel.
   - Manter fallback/mock se fizer sentido para desenvolvimento.
   - Validar schema, variáveis de ambiente e fluxo completo.

8. **PR de preparação para deploy**
   - Reavaliar `npm audit`.
   - Rodar lint/build.
   - Revisar variáveis de ambiente.
   - Só então preparar Vercel.

9. **PR futuro de avisos automáticos**
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
