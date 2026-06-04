# DECISIONS — Controle de Aluguéis

## 2026-06-04 -- Dashboard operacional com filtros e prioridades

O que mudou: extraí a UI principal para `PropertyDashboard`, adicionei filtros interativos de carteira e cards de prioridades do mês.
Por que: Mercês pediu para executar a Etapa 3, focando evolução do produto antes de deploy/Vercel.
Alternativa descartada: iniciar CRUD ou Supabase imediatamente; filtros/prioridades aumentam o valor da leitura sem depender de banco.
Impacto: a home agora é parcialmente client-side para permitir filtros; os agrupamentos ainda refletem a base desatualizada de fevereiro/2023 e precisam validação HITL.
Como reverter: voltar o commit desta alteração ou remover `src/components/property-dashboard.tsx` e restaurar `src/app/page.tsx` anterior.

## 2026-06-04 -- Domínio financeiro e alertas iniciais no dashboard

O que mudou: renomeei `isCurrent` para `isRentPaid`, adicionei funções de resumo financeiro, cálculo de despesas do proprietário, receita recebida/pendente e alertas por imóvel.
Por que: Mercês pediu para executar as Etapas 1 e 2, focando evolução do projeto antes de Vercel/deploy.
Alternativa descartada: conectar Supabase ou iniciar CRUD antes de estabilizar lógica de domínio e leitura rápida.
Impacto: o dashboard mostra valor de negócio maior, mas as regras ainda são baseadas no CSV desatualizado e precisam validação HITL antes de uso operacional.
Como reverter: voltar o commit desta alteração; a alteração principal está em `app/src/lib/rentals.ts`, `app/src/app/page.tsx`, `SDD.md` e `ROADMAP.md`.

## 2026-06-04 -- CSV de fevereiro recebido como base estrutural desatualizada

O que mudou: substituí os mocks inferidos do screenshot por dados importados do CSV `Aluguéis Prédios - Fevereiro.csv`.
Por que: Mercês enviou a planilha real dos imóveis, mas avisou que os dados estão desatualizados.
Alternativa descartada: tratar o CSV como fonte atual de verdade operacional.
Impacto: a UI e o schema passam a refletir melhor a estrutura real da planilha, mas os valores/status não devem ser usados como situação atual sem revisão.
Como reverter: voltar o commit desta alteração ou substituir `src/lib/rentals.ts` por dados atualizados.

## 2026-06-04 -- Bootstrap inicial a partir de imagem de planilha

O que mudou: criado projeto inicial com docs PRD/ADR/SDD/ROADMAP e app Next.js.
Por que: Gabriel pediu para deixar o início de um app com Node.js + Supabase + Vercel usando a skill enviada e uma planilha base.
Alternativa descartada: esperar a planilha original antes de iniciar; isso atrasaria o bootstrap.
Impacto: alguns dados mockados podem estar incompletos/truncados até Gabriel enviar CSV/XLSX ou validar manualmente.
Como reverter: remover `/home/hermes/projetos/controle-alugueis` ou substituir dados em `src/lib/rentals.ts`.

## 2026-06-04 -- Começar com mock local antes do Supabase real

O que mudou: a UI inicial usa dados locais e inclui schema Supabase separado.
Por que: ainda não há URL/chave Supabase configuradas nesta sessão.
Alternativa descartada: bloquear desenvolvimento até credenciais Supabase.
Impacto: primeira versão é demonstrável localmente, mas ainda não persiste edição.
Como reverter: ligar leitura/escrita ao Supabase quando as variáveis estiverem disponíveis.
