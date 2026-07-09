# Project Onboarding — Gerenciador de Imóveis

## Purpose

Gerenciador de Imóveis, also tracked as `controle-alugueis`, appears to be a private/family MVP for property and rental management. The product direction recorded in HEP is to move a spreadsheet-style rental workflow into an app that helps manage properties, rental records, contracts, payments, due dates and adjustments.

This note is intentionally documentation-only and sanitized. It is based on HEP-approved dry-run evidence, not on runtime execution.

## Apparent stack

Based on approved HEP evidence, the apparent stack is:

- Next.js App Router;
- React;
- TypeScript;
- Tailwind CSS;
- Supabase;
- Zod;
- related frontend/tooling packages recorded from safe manifests and docs.

## Superficial structure observed

The controlled HEP dry run recorded the main app under `app/` and observed these superficial areas:

- `app/config`;
- `app/docs`;
- `app/public`;
- `app/scripts`;
- `app/src`;
- `app/supabase`.

HEP also records product-facing routes and decisions from safe documentation:

- `/login` as the entry route;
- `/dashboard` as the operational route;
- private/family MVP posture;
- Supabase Auth;
- `owner_id` on property records;
- Row Level Security by `auth.uid()`;
- contract/document review is manual before attachment/upload.

## Unknowns

The dry run did not validate:

- current branch state;
- runtime behavior;
- production readiness;
- current Supabase project configuration;
- real database contents or data quality;
- complete source-module behavior;
- latest manual QA status.

Treat these as unknown until separately validated under an approved task.

## Safety guardrails

For future contributors and agents:

- Do not read `.env*` files.
- Do not read secrets, credentials, private keys, dumps, database files or sensitive logs.
- Do not include private endpoints, personal data, financial data or real configuration values in documentation.
- Do not run tests, builds, installs, deploys or project commands unless a later task explicitly approves that scope.
- Do not change code, authentication, Supabase/RLS, database schema, migrations or storage behavior from this onboarding note.
- Mark uncertain facts as unknown instead of overclaiming runtime or production state.

## Manual validation checklist

Before relying on this note for future work, manually confirm:

- the note still changes only documentation;
- no secrets, credentials, endpoints, personal data or financial data were added;
- statements are still grounded in HEP-approved evidence or clearly marked as unknown;
- `app/docs/onboarding.md` remains the intended documentation location;
- future implementation work has its own explicit approval before touching code, database, auth, storage or deployment.
