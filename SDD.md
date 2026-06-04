# SDD — Controle de Aluguéis

## Estrutura esperada

```text
app/
├── src/app/page.tsx              # dashboard inicial
├── src/app/globals.css           # tema visual
├── src/lib/rentals.ts            # tipos, schema, dados iniciais e formatadores
├── src/lib/supabase.ts           # cliente Supabase browser-safe
├── supabase/schema.sql           # schema inicial Postgres
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
- `isCurrent`: boolean.
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

## Invariantes
- Valores monetários nunca podem ser negativos.
- Se `isRented = true`, deve haver `tenantName` ou pendência explícita.
- Datas exibidas ao usuário ficam em `DD/MM/YYYY`.
- Moedas exibidas ao usuário ficam em BRL.
- Link de contrato deve ser URL válida quando presente.

## Contrato com Supabase
Tabela principal: `properties`.
- O app deve funcionar com dados mockados se as variáveis Supabase não estiverem configuradas.
- Quando configurado, futuras rotas podem ler/escrever no Supabase usando as mesmas chaves do domínio.

## Escopo negativo
- Não implementar autenticação nesta primeira fatia.
- Não gravar alterações no banco ainda.
- Não importar XLSX ainda.
