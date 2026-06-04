# DECISIONS — Controle de Aluguéis

## 2026-06-04 -- Opção B para substituir PR de CRUD em página única

O que mudou: em vez de mergear o PR #3 como estava, criei uma branch substituta com app shell, navegação multipágina, componentes UI shadcn-style locais e CRUD local distribuído entre resumo, carteira e novo imóvel.
Por que: Mercês validou visualmente e disse que tudo em uma página só incomodou; isso é rejeição HITL estrutural de UX, não apenas polish.
Alternativa descartada: mergear o PR #3 e corrigir depois; isso deixaria a `main` com uma experiência já rejeitada.
Impacto: o app passa a ter rotas `/`, `/imoveis`, `/imoveis/novo` e `/importar`; rascunhos locais usam `localStorage` até a persistência Supabase ser definida com segurança.
Como reverter: remover `AppShell`, `PropertyWorkspace`, rotas novas e componentes UI locais, restaurando `page.tsx` para renderizar `PropertyDashboard`.

## 2026-06-04 -- Seed SQL para base demo do Supabase

O que mudou: adicionei `app/supabase/seed.sql` com os 11 imóveis do CSV de fevereiro/2023 e marquei todos como `source_is_outdated = true`.
Por que: preparar o caminho para testar Supabase real sem depender de digitação manual dos dados estruturais iniciais.
Alternativa descartada: inserir dados automaticamente pela aplicação; isso misturaria bootstrap/demo com fluxo operacional.
Impacto: o seed é útil para desenvolvimento e demonstração, mas não representa a situação atual dos imóveis.
Como reverter: remover `app/supabase/seed.sql` ou rodar o `delete` filtrado por `source_label` e `source_reference_month` presente no próprio arquivo.

## 2026-06-04 -- Repository Supabase com fallback mock

O que mudou: criei `src/lib/property-repository.ts`, transformei `page.tsx` em server component async e passei a enviar `dataSource` para o dashboard.
Por que: Mercês pediu para executar a Etapa 4, preparando Supabase sem depender de credenciais ou quebrar o mock local.
Alternativa descartada: conectar a UI diretamente no Supabase ou bloquear a evolução até existir `.env.local` real.
Impacto: a página agora busca dados via repository; se Supabase estiver ausente, vazio, com erro ou dado inválido, o dashboard cai para mock e mostra `mock`/`fallback` na fonte.
Como reverter: remover `property-repository.ts`, restaurar `page.tsx` para importar `properties` diretamente e remover o prop `dataSource` do `PropertyDashboard`.

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
