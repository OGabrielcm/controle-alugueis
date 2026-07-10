# SDD — Controle de Aluguéis

## Estrutura esperada

```text
app/
├── src/app/layout.tsx            # app shell com navegação multipágina
├── src/app/page.tsx              # redireciona para /login
├── src/app/dashboard/page.tsx    # resumo operacional da carteira protegido por sessão
├── src/app/imoveis/page.tsx      # listagem/filtros/edição local
├── src/app/imoveis/novo/page.tsx # cadastro local separado
├── src/app/importar/page.tsx     # placeholder para importação CSV/XLSX
├── src/app/login/page.tsx        # login Supabase Auth
├── src/app/cadastro/page.tsx     # cadastro com confirmação de e-mail/senha
├── src/app/recuperar-senha/page.tsx # solicitação de recuperação de senha
├── src/app/redefinir-senha/page.tsx # redefinição de senha
├── src/app/globals.css           # tema visual
├── src/components/app-shell.tsx  # navegação lateral/topo responsiva
├── src/components/contract-attachment-panel.tsx # upload de PDF/DOCX por imóvel
├── src/components/property-workspace.tsx # workspace client-side por modo
├── src/components/ui/*           # componentes shadcn-style locais
├── src/lib/contract-agenda.ts    # regras de vencimento/reajuste contratual
├── src/lib/contract-attachment.ts # validação/path/upload de PDF/DOCX no Storage
├── src/lib/rentals.ts            # tipos, schema, dados iniciais e formatadores
├── src/lib/property-repository.ts # leitura Supabase com fallback mock
├── src/lib/supabase.ts           # cliente Supabase browser-safe
├── src/lib/utils.ts              # helper cn() para classes Tailwind
├── supabase/schema.sql           # schema inicial Postgres
├── supabase/seed.sql             # seed demo/desenvolvimento com CSV desatualizado
├── supabase/storage.sql          # bucket de contratos no Supabase Storage
├── .env.example                  # variáveis esperadas
└── README.md                     # setup local/deploy
```

## Contratos de domínio

### PropertyRecord
Representa uma coluna da planilha.

Campos:
- `id`: string estável.
- `buildingName`: nome do prédio/unidade.
- `isRented`: boolean.
- `tenantName`: string opcional.
- `contractEndDate`: `YYYY-MM-DD` opcional.
- `paymentDueDate`: `YYYY-MM-DD` opcional.
- `isRentPaid`: boolean que representa se o aluguel da referência importada consta como pago.
- `rentAmount`: number em reais.
- `condoAmount`: number em reais.
- `condoPaymentDate`: `YYYY-MM-DD` opcional.
- `condoPaidByTenant`: boolean.
- `extraFeeAmount`: number opcional.
- `extraFeePaidByTenant`: boolean.
- `unexpectedCostsAmount`: number opcional.
- `unexpectedCostsNotes`: string opcional.
- `maintenanceAmount`: number opcional.
- `maintenancePaidByTenant`: boolean.
- `iptuAmount`: number opcional.
- `iptuPaidByTenant`: boolean.
- `garbageFeeAmount`: number opcional.
- `laudemioAmount`: number opcional.
- `contractUrl`: string opcional.
- `receivingBank`: banco de recebimento do aluguel, string opcional.
- `hasRentDeposit`: boolean para calção/caução do aluguel.

### Status da fonte de dados
A planilha `Aluguéis Prédios - Fevereiro.csv` é referência de fevereiro/2023 e está desatualizada. Ela deve ser usada como base estrutural e mock inicial; o estado atual dos imóveis precisa ser validado manualmente antes de qualquer uso operacional.

## Contratos derivados

### `propertyExpenseTotal(property)`
Calcula despesas atribuídas ao proprietário na referência importada. Inclui condomínio quando o cliente não paga, taxa extra quando o cliente não paga, imprevistos, manutenção quando o cliente não paga, IPTU quando o cliente não paga, taxa de lixo e laudêmio.

### `summarizePortfolio(properties)`
Agrega a carteira em indicadores de leitura rápida: receita prevista, receita recebida, receita pendente, condomínio total, despesas do proprietário, saldo estimado, contagem de revisões e alertas críticos.

### `getPropertyAlerts(property)`
Gera alertas por imóvel com severidade `info`, `warning` ou `danger`. Regras atuais:
- Sem inquilino informado.
- Sem data final de contrato.
- Aluguel pendente na base.
- Banco de recebimento não informado.
- Manutenção alta a partir de R$ 1.000,00.
- Imprevistos maiores que zero.
- Calção/caução registrado.

### `filterProperties(properties, filter)`
Filtra a carteira para leitura operacional no dashboard. Filtros suportados: `all`, `paid`, `pending`, `attention` e `review`.

### `getPriorityGroups(properties)`
Agrupa os imóveis em prioridades do mês: aluguéis pendentes, dados incompletos, despesas altas e ausência de banco de recebimento.

### `buildContractAgenda(properties, referenceDate?)`
Gera a agenda contratual exibida na home. Considera apenas imóveis alugados e cria itens para:
- Contrato vencido ou próximo do vencimento em até 90 dias.
- Reajuste anual vencido ou próximo em até 45 dias, calculando o próximo aniversário da `rentAdjustmentBaseDate`.
- Imóvel alugado sem data final de contrato.
- Imóvel alugado sem regra de reajuste anual ou sem data base quando a cláusula está ativa.

Os itens são ordenados por severidade, proximidade da data e nome do imóvel. A base mockada tende a gerar muitos itens de dados faltantes porque os contratos reais ainda não foram cadastrados.

### `contract-attachment.ts`
Define o bucket `property-contracts`, valida arquivos de contrato e gera paths seguros por imóvel.
- PDF e DOCX são aceitos.
- Limite: 10MB.
- Path: `<property-id-normalizado>/<timestamp>-<nome-normalizado>.<pdf|docx>`.
- `uploadContractAttachment()` envia para o Supabase Storage privado e retorna o path interno do arquivo.
- `createContractSignedUrl()` gera signed URL temporária para abertura do contrato.

### `ContractAttachmentPanel`
Componente client-side usado na página de detalhe do imóvel. Permite selecionar ou arrastar/soltar PDF/DOCX, validar localmente, enviar ao Storage privado quando Supabase está configurado, registrar o path em `properties.contract_url`, abrir por signed URL temporária e remover o vínculo/anexo quando autorizado.

### `AppShell`
Componente client-side em `src/components/app-shell.tsx` responsável pela navegação multipágina. Define as rotas principais: `/`, `/imoveis`, `/imoveis/novo` e `/importar`.

### Componentes UI shadcn-style
Componentes locais em `src/components/ui/*` inspirados no padrão shadcn/ui: `Button`, `ButtonLink`, `Card`, `Badge`, `Input` e `Label`. Dependem de Tailwind, `clsx`, `tailwind-merge` e `lucide-react`, sem template fechado.

### `PropertyWorkspace`
Componente client-side em `src/components/property-workspace.tsx` responsável por renderizar a experiência de imóveis em três modos:
- `overview`: cards de resumo, prioridades e atalhos.
- `list`: filtros, tabela e edição local.
- `new`: cadastro local de imóvel.

### CRUD de imóveis
A fase atual permite criar e editar imóveis no Supabase quando há sessão autenticada; sem sessão/configuração, mantém fallback local client-side para desenvolvimento.
- Campos editáveis nesta fatia: imóvel, inquilino, vencimento, aluguel, banco, alugado e aluguel pago.
- Novos imóveis autenticados recebem `id` do banco; rascunhos locais continuam usando `id` local com prefixo `local-`.
- Campos financeiros aceitam vírgula ou ponto e precisam ser maiores ou iguais a zero.
- Alterações atualizam cards, filtros, prioridades e tabela imediatamente.
- Rascunhos locais são salvos no `localStorage` apenas quando não há sessão Supabase ativa.
- A UI exibe `rascunho local` quando há alteração não persistida no modo fallback e permite descartar rascunhos voltando para os dados carregados pelo repository.
- Campos fora do formulário preservam o valor atual ao editar e usam defaults seguros ao criar.

### `getProperties()`
Camada repository em `src/lib/property-repository.ts`. Retorna `{ properties, dataSource }`.
- Sem variáveis Supabase: retorna mock local e `dataSource.status = mock`.
- Com Supabase configurado: lê `public.properties`, mapeia snake_case para `PropertyRecord` e valida com `propertySchema`.
- Se Supabase falhar, estiver vazio ou retornar dado inválido: retorna mock local e `dataSource.status = fallback` com motivo no `note`.

### `PropertyDataSource`
Metadado exibido no dashboard para o usuário saber se está vendo mock local, dados do Supabase ou fallback por erro. Nunca esconder que o CSV base está desatualizado.

## Invariantes
- Valores monetários nunca podem ser negativos.
- Se `isRented = true`, deve haver `tenantName` ou pendência explícita.
- Datas exibidas ao usuário ficam em `DD/MM/YYYY`.
- Moedas exibidas ao usuário ficam em BRL.
- Link de contrato deve ser URL válida quando presente.

## Contrato com Supabase
Tabela principal: `properties`.
- O app funciona com dados mockados se as variáveis Supabase não estiverem configuradas.
- Quando configurado, `getProperties()` lê `public.properties` em tempo de execução e mantém a UI usando o mesmo contrato `PropertyRecord`.
- Erros de conexão, tabela vazia ou dados inválidos não quebram o dashboard: o app cai para mock local e mostra `fallback` na fonte de dados.
- A escrita/edição autenticada no banco está implementada via cliente Supabase browser-side, preenchendo `owner_id = auth.uid()` e respeitando as policies de usuário autenticado.
- Campos do banco ficam em snake_case; campos do domínio ficam em camelCase.
- `supabase/seed.sql` replica os 11 imóveis do CSV de fevereiro/2023 para ambiente demo/desenvolvimento.
- `supabase/storage.sql` cria o bucket privado `property-contracts` para documentos PDF/DOCX de contrato com limite de 10MB e policies baseadas no dono do imóvel.
- O seed remove antes apenas registros com `source_label = 'Aluguéis Prédios - Fevereiro.csv'` e `source_reference_month = 'Fevereiro/2023'`, evitando duplicidade sem apagar outros dados.
- Registros do seed entram com `source_is_outdated = true`; não usar como verdade operacional atual sem revisão manual.
- Antes de produção/uso com documentos reais, validar RLS e Storage com duas contas e arquivos fake; contratos são abertos por signed URLs temporárias.

## Escopo negativo
- Não abrir escrita para `anon`.
- Não usar documentos reais antes de validar Storage privado e isolamento por conta.
- Não importar XLSX ainda.
