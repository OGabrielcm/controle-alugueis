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
- [AFK] Criar `supabase/seed.sql` com os 11 imóveis do CSV como base demo/desenvolvimento. **Concluído em 2026-06-04.**
- [HITL] Validar nomes dos campos e tipos financeiros.

## Fase 2.5 — Repository Supabase com fallback [HITL]
Critério: app carrega via uma camada de dados única e não quebra sem credenciais Supabase.
- [AFK] Criar `property-repository.ts` com leitura Supabase e fallback mock. **Concluído em 2026-06-04.**
- [AFK] Mostrar no dashboard se a fonte é `mock`, `supabase` ou `fallback`. **Concluído em 2026-06-04.**
- [HITL] Quando houver projeto Supabase real, validar leitura da tabela `properties` com 2–3 imóveis.

## Fase 3 — CRUD básico + navegação multipágina [HITL]
Critério: usuário consegue criar/editar imóvel manualmente sem concentrar tudo em uma página só.
- [AFK] Adotar base de design system open-source modular com componentes shadcn-style locais. **Concluído em 2026-06-04.**
- [AFK] Criar app shell com navegação para resumo, imóveis, novo imóvel e importação. **Concluído em 2026-06-04.**
- [AFK] Criar formulário local de novo imóvel com validação mínima. **Concluído em 2026-06-04.**
- [AFK] Criar edição local de imóvel existente e atualização imediata dos indicadores. **Concluído em 2026-06-04.**
- [AFK] Persistir rascunhos locais em `localStorage` e permitir descartar alterações não persistidas. **Concluído em 2026-06-04.**
- [HITL] Validar visualmente a navegação multipágina e o fluxo com 2 imóveis reais antes de persistir no Supabase.
- [AFK] Futuro: persistir create/update no Supabase quando autenticação/policies forem definidas.

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
