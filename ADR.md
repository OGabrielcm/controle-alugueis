# ADR — Controle de Aluguéis

## Decisão principal
Usar Next.js + TypeScript como aplicação Node.js full-stack, Supabase como Postgres/BaaS e Vercel como plataforma de deploy.

## Núcleo do domínio
Dados + regras simples de acompanhamento financeiro/contratual. O domínio envolve imóveis, contratos, cobranças e status de pagamento.

## Complexidade de estado
Moderada. Um imóvel pode estar alugado ou vazio, ter contrato vigente/vencido, cobranças recorrentes e despesas que podem ou não ser pagas pelo cliente.

## Ciclo de vida
Produto pessoal de longo prazo começando como MVP.

## Consumidor
Solo no início.

## Metodologia
SDD + TDD leve nas regras financeiras. O SDD define tabelas, contratos e invariantes; testes devem cobrir parsing/formatos BR e cálculo de status.

## Decisões técnicas
- Next.js App Router para UI, rotas API e deploy Vercel.
- Supabase JS client isolado em `src/lib/supabase.ts`.
- Tipos e schemas Zod em `src/lib/rentals.ts`.
- Começar com dados mockados derivados da planilha para validar UX antes de ligar banco real.
- SQL inicial em `supabase/schema.sql` para futura criação das tabelas.

## Formatos BR obrigatórios
- Moeda: `R$ 1.234,56`.
- Datas: `DD/MM/YYYY`.
- Campos financeiros aceitam centavos.

## Riscos
- A imagem não contém todos os dados com precisão; alguns nomes/datas estão truncados.
- Sem a planilha original `.xlsx/.csv`, a importação automática fica fora do MVP inicial.
