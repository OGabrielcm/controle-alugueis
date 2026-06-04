# ROADMAP — Controle de Aluguéis

## Fase 1 — Bootstrap visual do dashboard [HITL]
Critério: usuário abre a home e reconhece a planilha convertida em cards/tabela.
- [AFK] Criar app Next.js com TypeScript/Tailwind.
- [AFK] Criar dados mockados a partir da imagem.
- [HITL] Validar se os campos e nomes refletem a planilha real.

## Fase 1.5 — Dashboard operacional com filtros [HITL]
Critério: usuário consegue separar rapidamente imóveis pagos, pendentes, em atenção e para revisão.
- [AFK] Criar filtros interativos `Todos`, `Pagos`, `Pendentes`, `Atenção` e `Revisar`. **Concluído em 2026-06-04.**
- [AFK] Criar seção `Prioridades do mês` com aluguéis pendentes, dados incompletos, despesas altas e imóveis sem banco. **Concluído em 2026-06-04.**
- [HITL] Validar se esses agrupamentos batem com a forma real de gestão dos imóveis.

## Fase 2 — Modelo Supabase [HITL]
Critério: schema SQL representa os campos da planilha sem perda óbvia.
- [AFK] Criar `supabase/schema.sql`.
- [HITL] Validar nomes dos campos e tipos financeiros.

## Fase 3 — CRUD básico [HITL]
Critério: usuário consegue criar/editar imóvel manualmente no app.
- [AFK] Criar formulários e rotas.
- [HITL] Validar fluxo com 2 imóveis reais.

## Fase 4 — Status e alertas [HITL]
Critério: app mostra pendências, dados incompletos e pontos de atenção por imóvel.
- [AFK] Implementar regras iniciais de status e alertas: aluguel pendente, dados incompletos, banco ausente, manutenção alta, imprevistos e caução. **Concluído em 2026-06-04.**
- [HITL] Validar datas reais e regras de cobrança antes de tratar vencimento/contrato como operacional.
- [AFK] Futuro: implementar alertas por contrato vencido/vence em 30 dias quando datas finais atuais existirem.

## Fase 5 — Importação de planilha [HITL]
Critério: usuário envia CSV/XLSX e pré-visualiza os dados antes de importar.
- [AFK] Parser local.
- [HITL] Validar mapeamento de colunas/linhas.

## Fase 6 — Deploy Vercel + Supabase real [HITL]
Critério: app acessível por URL Vercel com dados persistidos.
- [AFK] Preparar env vars e documentação.
- [HITL] Configurar credenciais e validar produção.
