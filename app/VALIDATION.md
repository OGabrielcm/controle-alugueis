# Controle de Aluguéis — Contrato de validação

## Objetivo

Definir a evidência mínima por tipo de mudança. Este arquivo roteia para checks executáveis e checklists existentes; não substitui resultados datados nem afirma que o ambiente está validado.

## Baseline executável

Executar em `app/`:

```bash
npm run lint
npm test
npm run build
```

Use o package manager/lockfile já existente. Não instale nem atualize dependências apenas para rodar um check sem autorização.

## Matriz proporcional

| Mudança | Checks mínimos | Evidência adicional |
|---|---|---|
| Markdown trivial | `git diff --check` + links/caminhos válidos | diff esperado |
| Regra de domínio pura | lint + tests relevantes | casos limite e regressão |
| UI/copy/layout | lint + tests + build | gate de `DESIGN.md`, screenshots/trace, temas/viewports aplicáveis |
| Auth/CRUD/RLS/Storage | baseline + smoke/auditoria específica | duas contas, dados/arquivos fake, isolamento negativo, gate humano |
| Dependência/config | baseline + audit/review da mudança | motivo, alternativa, rollback e risco de supply chain |
| Deploy/produção | baseline verde + readiness | preview manual, secrets seguros e aprovação humana separada |

## Checks específicos

Quando o ambiente seguro estiver configurado:

```bash
npm run smoke:supabase
npm run audit:multiconta
```

- Não imprimir URL, chave, token, cookie ou conteúdo privado.
- Usar somente contas, imóveis e arquivos fake.
- Falha de pré-requisito é `bloqueado`, não `passou`.
- Não apontar scripts para produção sem autorização explícita.

## Gate visual

Para mudança visual relevante, validar as rotas/estados definidos em [`DESIGN.md`](DESIGN.md):

- tema claro e escuro;
- mobile e desktop; tablet quando afetado;
- teclado e foco;
- loading, vazio, erro, sucesso e disabled aplicáveis;
- screenshot ou trace reproduzível;
- aprovação visual de Mercês antes de merge/deploy.

## Validação familiar

O checklist conceitual sanitizado permanece em [`docs/manual-validation.md`](docs/manual-validation.md). O review de readiness fica em [`docs/mvp-readiness-review.md`](docs/mvp-readiness-review.md). Resultados reais devem ser registros datados separados, sem credentials ou dados familiares reais.

## Pacote para o Verifier

Não entregar somente o diff. Incluir:

1. objetivo e não objetivos;
2. critérios de aceite;
3. contratos afetados (`PRODUCT`, `DESIGN`, `ARCHITECTURE`, ADR/SDD);
4. comandos reproduzíveis e saídas sanitizadas;
5. riscos e trust boundaries;
6. evidência visual quando aplicável;
7. limitações, bloqueios e como reverter.

## Estados de conclusão

- **Passou:** check executado e evidência disponível.
- **Bloqueado:** pré-requisito ausente ou gate humano pendente.
- **Não aplicável:** justificativa explícita ligada ao tipo de mudança.
- **Falhou:** comportamento ou evidência não atende aos critérios.

Nunca converter “não executado” em “passou”.
