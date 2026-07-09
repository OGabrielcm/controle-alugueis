# Compact Tier 1 docs-only process

## Purpose

This note documents the manual compact Tier 1 docs-only validation flow for Gerenciador de Imóveis / controle-alugueis.

It is a lightweight process reminder for small documentation-only changes. It does not replace HEP approval gates, human decisions, or raw diff review.

## Allowed scope

A compact Tier 1 docs-only change must stay within all of these limits:

- exactly one Markdown file;
- documentation-only content;
- no project commands;
- no setup, runtime, deploy, database, auth, storage, or production instructions;
- no code, config, or package changes;
- no sensitive file content;
- no push, pull request, merge, or deploy.

## Prohibited scope

Stop before changing anything if the task requires or implies:

- reading `.env*` content;
- reading secrets, credentials, private keys, dumps, database files, sensitive logs, or personal/financial/customer data;
- touching code, config, package files, auth, database, Supabase/RLS, storage, migrations, deploy, runtime, or production areas;
- running project, test, build, install, deploy, or runtime commands;
- using automation, autonomy, scripts, cron, provider/model changes, real MoA, or real cost;
- changing more than one file;
- validating the whole branch instead of only the isolated commit.

## Manual validation checklist

Before a compact Tier 1 docs-only change:

- confirm the exact authorized file path;
- confirm the change is Markdown-only;
- confirm the change is documentation-only;
- confirm no sensitive content is needed;
- confirm no project commands are needed;
- confirm rollback can be done by reverting one file or one isolated commit.

After the change:

- confirm only the authorized Markdown file changed;
- review the raw diff;
- confirm no sensitive content was added;
- confirm no project commands were executed;
- commit the change as an isolated documentation-only commit;
- remember that validating the isolated commit does not validate the full branch.

## Explicit unknowns

This note does not validate runtime behavior, production readiness, auth, database state, Supabase/RLS, storage, migrations, deployment, test coverage, or full branch health.

Those areas remain human-gated and out of scope for compact Tier 1 docs-only work.

## Rollback note

Rollback should be limited to removing this Markdown file or reverting the isolated commit that created it.
