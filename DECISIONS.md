# DECISIONS — Controle de Aluguéis

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
