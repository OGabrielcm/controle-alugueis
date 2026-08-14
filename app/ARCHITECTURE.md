# Controle de Aluguéis — Arquitetura atual

## Objetivo

Snapshot curto do funcionamento implementado. O [`../SDD.md`](../SDD.md) mantém contratos de domínio detalhados; decisões e alternativas ficam no mecanismo de ADR/decisões do repositório.

## Visão de execução

```text
Browser / Next.js App Router
├── rotas públicas de autenticação
├── rotas operacionais protegidas por sessão
├── componentes React client/server
├── repository de imóveis
│   ├── Supabase autenticado
│   └── mock/fallback local explícito
└── Supabase
    ├── Auth
    ├── Postgres + RLS por owner_id
    └── Storage privado + signed URL temporária
```

## Superfícies principais

| Superfície | Responsabilidade | Fonte |
|---|---|---|
| Rotas e layout | entrada, navegação e separação pública/protegida | `src/app/**` |
| UI operacional | dashboard, lista, cadastro, detalhe e anexos | `src/components/**` |
| Domínio | tipos, validação, cálculos, alertas e agenda | `src/lib/rentals.ts`, `src/lib/contract-agenda.ts` |
| Persistência | leitura/escrita de imóveis e fallback explícito | `src/lib/property-repository.ts` |
| Auth/cliente | sessão browser-side e acesso Supabase | `src/lib/supabase.ts`, componentes de auth |
| Contratos | validação, upload, abertura e remoção | `src/lib/contract-attachment.ts` |
| Banco/Storage | schema, migrations, seed e policies | `supabase/**` |
| Design executável | tokens e tema | `src/app/globals.css` |

## Fluxos e trust boundaries

### Autenticação

- `/` redireciona para `/login`.
- Login, cadastro, recuperação e redefinição são públicos.
- Rotas operacionais validam sessão e retornam ao login quando não há usuário ativo.
- A UI não é autoridade de autorização; Postgres e Storage aplicam isolamento server-side por policy.

### Imóveis

- Com sessão/configuração, o repository lê e persiste `public.properties`.
- Registros privados usam `owner_id = auth.uid()` e RLS.
- Sem configuração/sessão no desenvolvimento, a UI pode usar mock/rascunho local e deve mostrar essa origem.
- Falha, dado inválido ou base vazia não pode parecer dado real silenciosamente.

### Contratos

- PDF/DOCX de até 10 MB vão para bucket privado.
- O banco guarda o path interno; abertura usa URL assinada temporária.
- UI e validação local são conveniência, não fronteira de segurança.
- Antes de documentos reais, validar isolamento com duas contas e arquivos fake.

## Invariantes

1. `anon` não recebe escrita em imóveis privados.
2. Um usuário autenticado acessa somente recursos associados ao próprio `auth.uid()`.
3. Secrets não entram no browser além das variáveis públicas previstas pelo Supabase.
4. Paths privados e URLs assinadas temporárias não são publicados em docs, logs ou issues.
5. Dados mockados/desatualizados/fallback permanecem identificáveis na interface.
6. Valores monetários não são negativos; datas e moedas são exibidas no formato pt-BR.
7. Contrato é revisado por humano antes de qualquer anexo; o app não faz revisão jurídica.

## Mudanças que exigem gate ampliado

- Auth, sessão, RLS, migrations, schema, Storage, signed URLs ou `owner_id`.
- Importação/escrita em lote ou tratamento de dados reais.
- Endpoint público, deploy, variável de ambiente ou dependência nova.
- Mudança que elimina o fallback explícito ou altera a origem exibida do dado.

Essas mudanças exigem critérios específicos, checks reproduzíveis, revisão independente e decisão humana antes de merge/deploy.

## Como manter

Atualize este arquivo no mesmo commit de uma mudança estrutural já implementada. Não registre backlog, progresso ou histórico aqui. Se uma decisão mudar o porquê da arquitetura, registre-a no ADR/decisão canônica e mantenha aqui somente o estado vigente.
