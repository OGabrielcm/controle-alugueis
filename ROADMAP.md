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
- [HITL] Validar leitura/escrita real da tabela `properties` com 2–3 imóveis fake-realistas e usuário autenticado.

## Fase 3 — CRUD básico + navegação multipágina [HITL]
Critério: usuário consegue criar/editar imóvel manualmente sem concentrar tudo em uma página só.
- [AFK] Adotar base de design system open-source modular com componentes shadcn-style locais. **Concluído em 2026-06-04.**
- [AFK] Criar app shell com navegação para resumo, imóveis, novo imóvel e importação. **Concluído em 2026-06-04.**
- [AFK] Criar formulário local de novo imóvel com validação mínima. **Concluído em 2026-06-04.**
- [AFK] Criar edição local de imóvel existente e atualização imediata dos indicadores. **Concluído em 2026-06-04.**
- [AFK] Persistir rascunhos locais em `localStorage` e permitir descartar alterações não persistidas. **Concluído em 2026-06-04.**
- [AFK] Acompanhamento: revisar vulnerabilidades moderadas reportadas pelo `npm audit` em dependências transitivas do Next/PostCSS antes de preparar deploy; não usar `npm audit fix --force` se ele sugerir downgrade inseguro do Next.
- [AFK] Persistir create/update no Supabase com sessão autenticada e `owner_id`. **Concluído em 2026-06-05.**
- [AFK] Excluir imóvel privado a partir do detalhe. **Concluído em 2026-06-05.**
- [HITL] Validar visualmente a navegação multipágina e o fluxo com 2 imóveis fake-realistas antes de usar dados reais.

## Fase 4 — Status e alertas [HITL]
Critério: app mostra pendências, dados incompletos e pontos de atenção por imóvel.
- [AFK] Implementar regras iniciais de status e alertas: aluguel pendente, dados incompletos, banco ausente, manutenção alta, imprevistos e caução. **Concluído em 2026-06-04.**
- [AFK] Criar agenda contratual ativa com vencimentos, reajustes anuais e dados contratuais faltantes. **Concluído em 2026-06-04.**
- [AFK] Preparar upload/remover/abrir contrato por imóvel via Supabase Storage privado com PDF/DOCX e signed URL temporária. **Ajustado após revisão manual em 2026-06-05.**
- [HITL] Validar anexos com arquivo fake, duas contas e Storage privado antes de usar contratos reais.
- [HITL] Validar datas reais e regras de cobrança antes de tratar vencimento/contrato como operacional.
- [AFK] Futuro: transformar a agenda contratual em notificações por e-mail quando houver persistência real e datas atuais.

## Fase 5 — Importação de planilha [HITL]
Critério: usuário envia CSV/XLSX e pré-visualiza os dados antes de importar.
- [AFK] Parser local.
- [HITL] Validar mapeamento de colunas/linhas.

## Fase 6 — Deploy Vercel + Supabase real [HITL]
Critério: app acessível por URL Vercel com dados persistidos.
- [HITL] Conectar/validar Supabase primeiro: projeto, env vars locais, `schema.sql`, `seed.sql`, `storage.sql`, leitura/escrita real, duas contas e policies RLS/Storage.
- [AFK] Depois preparar Vercel: env vars, build, preview deploy e documentação.
- [HITL] Validar produção antes de usar dados reais/sensíveis.

## Fase 6.5 — MVP readiness familiar [HITL]
Critério: Mercês e família conseguem operar o fluxo básico com dados fake-realistas antes de produção.
- [AFK] Criar `app/docs/mvp-readiness-review.md`. **Concluído em 2026-07-10.**
- [AFK] Configurar Playwright e cobrir as entradas públicas de Auth. **Concluído em 2026-08-14 com 4 cenários no Chromium.**
- [HITL] Criar conta descartável e automatizar a jornada autenticada: login, cadastro de imóvel, edição, detalhe e exclusão.
- [HITL] Rodar checklist familiar: login, cadastro, edição, detalhe, anexo fake, remoção de anexo, exclusão, logout e segunda conta.
- [HITL] Só usar dados/contratos reais após validar isolamento por conta e Storage privado.

## Fase 7 — Evoluções pós-MVP [HITL]
Condição de entrada: MVP familiar validado com Auth, CRUD, RLS, Storage privado, dados fake-realistas e dogfood guiado; não antecipar estas funcionalidades para destravar o lançamento inicial.
- [AFK] Criar modelos padrão de documentos/contratos com variáveis de imóvel, locador, inquilino e condições contratuais.
- [HITL] Definir quais modelos serão usados, conferir as variáveis preenchidas e manter revisão manual antes de qualquer uso ou assinatura.
- [AFK] Adicionar galeria privada por imóvel, com múltiplas imagens, miniaturas e upload no Storage privado com RLS por `owner_id`.
- [HITL] Validar que fotos não usam URLs públicas e que outra conta não acessa imagens de imóveis alheios.
