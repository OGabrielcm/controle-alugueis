# SDD — Controle de Aluguéis

## Estrutura esperada

```text
app/
├── src/app/page.tsx              # server component fino que carrega dados
├── src/app/globals.css           # tema visual
├── src/components/property-dashboard.tsx # dashboard client-side com filtros
├── src/lib/rentals.ts            # tipos, schema, dados iniciais e formatadores
├── src/lib/property-repository.ts # leitura Supabase com fallback mock
├── src/lib/supabase.ts           # cliente Supabase browser-safe
├── supabase/schema.sql           # schema inicial Postgres
├── supabase/seed.sql             # seed demo/desenvolvimento com CSV desatualizado
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

### `PropertyDashboard`
Componente client-side em `src/components/property-dashboard.tsx` responsável por filtros interativos, cards de prioridade, leitura rápida do filtro ativo e tabela operacional.

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
- A escrita/edição ainda está fora desta etapa; CRUD fica para fase posterior.
- Campos do banco ficam em snake_case; campos do domínio ficam em camelCase.
- `supabase/seed.sql` replica os 11 imóveis do CSV de fevereiro/2023 para ambiente demo/desenvolvimento.
- O seed remove antes apenas registros com `source_label = 'Aluguéis Prédios - Fevereiro.csv'` e `source_reference_month = 'Fevereiro/2023'`, evitando duplicidade sem apagar outros dados.
- Registros do seed entram com `source_is_outdated = true`; não usar como verdade operacional atual sem revisão manual.

## Escopo negativo
- Não implementar autenticação nesta primeira fatia.
- Não gravar alterações no banco ainda.
- Não importar XLSX ainda.
