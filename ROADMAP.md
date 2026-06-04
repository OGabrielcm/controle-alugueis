# ROADMAP — Controle de Aluguéis

## Fase 1 — Bootstrap visual do dashboard [HITL]
Critério: usuário abre a home e reconhece a planilha convertida em cards/tabela.
- [AFK] Criar app Next.js com TypeScript/Tailwind.
- [AFK] Criar dados mockados a partir da imagem.
- [HITL] Validar se os campos e nomes refletem a planilha real.

## Fase 2 — Modelo Supabase [HITL]
Critério: schema SQL representa os campos da planilha sem perda óbvia.
- [AFK] Criar `supabase/schema.sql`.
- [HITL] Validar nomes dos campos e tipos financeiros.

## Fase 3 — CRUD básico [HITL]
Critério: usuário consegue criar/editar imóvel manualmente no app.
- [AFK] Criar formulários e rotas.
- [HITL] Validar fluxo com 2 imóveis reais.

## Fase 4 — Status e alertas [HITL]
Critério: app mostra vencidos, em dia e contratos próximos do fim.
- [AFK] Implementar regras de status.
- [HITL] Validar datas reais e regras de cobrança.

## Fase 5 — Importação de planilha [HITL]
Critério: usuário envia CSV/XLSX e pré-visualiza os dados antes de importar.
- [AFK] Parser local.
- [HITL] Validar mapeamento de colunas/linhas.

## Fase 6 — Deploy Vercel + Supabase real [HITL]
Critério: app acessível por URL Vercel com dados persistidos.
- [AFK] Preparar env vars e documentação.
- [HITL] Configurar credenciais e validar produção.
