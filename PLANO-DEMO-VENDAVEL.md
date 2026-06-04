# Plano de Implementação — Evoluir Controle de Aluguéis até demo vendável

> **Para Hermes:** usar a skill project-bootstrap + escrita de planos. Implementar task por task, validando com build ao final de cada bloco.

**Objetivo:** transformar o bootstrap atual em uma demo publicável que prove a tese “planilha manual → app web com Supabase”.

**Arquitetura:** Next.js App Router, TypeScript, Supabase para persistência e Vercel para deploy. Começar com CRUD simples e regras de status úteis.

**Tech Stack:** Node.js, Next.js, TypeScript, Tailwind, Supabase, Vercel.

---

## Estado atual

Projeto: `/home/hermes/projetos/controle-alugueis/app`

Já existe:
- Dashboard estático em `src/app/page.tsx`.
- Tipos/dados mockados em `src/lib/rentals.ts`.
- Supabase client em `src/lib/supabase.ts`.
- Schema inicial em `supabase/schema.sql`.
- Docs de projeto no diretório pai.

Build já passou com `npm run lint && npm run build`.

## Fase 1 — Corrigir dados da planilha

### Task 1: Validar dados reais da planilha

**Objetivo:** trocar inferências da imagem por dados reais.

**Files:**
- Modify: `src/lib/rentals.ts`
- Modify: `PRD.md` se novos campos aparecerem.
- Modify: `SDD.md` se campos mudarem.

**Passos:**
1. Receber `.xlsx` ou `.csv`.
2. Extrair colunas/linhas.
3. Comparar com `PropertyRecord`.
4. Atualizar mock.
5. Rodar:

```bash
cd /home/hermes/projetos/controle-alugueis/app
npm run lint
npm run build
```

**Critério:** dashboard mostra dados sem truncamento.

## Fase 2 — Supabase real

### Task 2: Criar adapter de leitura

**Objetivo:** preparar leitura do Supabase sem quebrar mock.

**Files:**
- Create: `src/lib/property-repository.ts`
- Modify: `src/app/page.tsx`

**Contrato:**
- Se env Supabase não existir, retornar mock.
- Se env existir, buscar `properties`.

**Verificação:**

```bash
npm run lint
npm run build
```

### Task 3: Criar seed SQL opcional

**Objetivo:** facilitar popular Supabase.

**Files:**
- Create: `supabase/seed.sql`

**Critério:** SQL insere 2–3 imóveis de exemplo.

## Fase 3 — CRUD mínimo

### Task 4: Página de novo imóvel

**Objetivo:** criar formulário simples.

**Files:**
- Create: `src/app/properties/new/page.tsx`
- Create: `src/app/properties/actions.ts`

**Campos mínimos:**
- Nome do imóvel.
- Alugado.
- Nome do inquilino.
- Aluguel.
- Condomínio.
- IPTU.
- Data fim contrato.
- Data vencimento.

**Validação:**
- Moeda não negativa.
- Nome obrigatório.
- URL de contrato válida se preenchida.

### Task 5: Ação de salvar

**Objetivo:** salvar no Supabase quando configurado.

**Files:**
- Modify: `src/app/properties/actions.ts`
- Modify: `src/lib/rentals.ts` se schema precisar de input separado.

**Verificação:**
- Sem Supabase: mostrar aviso amigável.
- Com Supabase: inserir registro.

## Fase 4 — Regras de valor

### Task 6: Status de atenção

**Objetivo:** gerar status útil para o usuário.

**Files:**
- Modify: `src/lib/rentals.ts`
- Modify: `src/app/page.tsx`

**Regras:**
- Contrato vencido.
- Contrato vence em até 30 dias.
- Pagamento vencido.
- Dados incompletos.

**Teste recomendado:**
- Criar função pura e testar manualmente com entradas fixas.

## Fase 5 — Deploy

### Task 7: Preparar GitHub + Vercel

**Objetivo:** publicar URL de demo.

**Passos:**
1. Criar repo GitHub.
2. Push do projeto.
3. Importar `app/` na Vercel.
4. Configurar env vars.
5. Testar URL pública.

**Critério:** URL abre dashboard e não expõe segredo.

## Validação final HITL

Antes de considerar a demo pronta, responder:

1. O que foi feito em 1–3 frases?
2. O que acontece com entrada inválida?
3. Há incerteza de lógica?
4. O que pode quebrar?
5. Como reverter?
6. Segue o SDD? Se não, atualizar.
