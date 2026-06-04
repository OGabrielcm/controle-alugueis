# DECISIONS — Controle de Aluguéis

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
