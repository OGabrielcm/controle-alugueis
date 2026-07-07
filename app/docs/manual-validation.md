# Manual Validation Checklist — Gerenciador de Imóveis

## Purpose

This document is a safe, manual checklist for validating the Gerenciador de Imóveis user experience at a conceptual and user-facing level.

It is documentation-only. It does not validate runtime behavior, production readiness, database contents, storage state, real Supabase project state, or the latest manual QA status.

## Manual Scope

Use this checklist only for human review of visible flows, copy, navigation clarity, and family/private MVP fit.

Covered at a conceptual level:

- `/login` as the expected entry route.
- `/dashboard` as the expected operational route.
- Property workflow clarity for private/family use.
- Manual contract/document review before any attachment or upload.

Not covered by this checklist:

- Runtime verification.
- Production verification.
- Database or storage inspection.
- Real Supabase project inspection.
- Automated tests, builds, deploys, scripts, or project commands.

## Safe Prerequisites

Before using this checklist, confirm that validation can be performed without introducing sensitive data.

Safe prerequisites:

- Use only non-sensitive sample data.
- Use fake names, fake addresses, fake documents, and fake values.
- Do not use real contracts, real personal information, real financial information, or real credentials.
- Do not record private URLs, private endpoints, IPs, tokens, keys, passwords, or environment values.
- Stop if validation requires access to secrets, `.env*` content, database records, storage objects, or private documents.

## Visual and Navigation Checklist

- [ ] The first visible screen clearly communicates what the user should do next.
- [ ] Navigation labels are understandable for a non-technical family user.
- [ ] The flow avoids treating the product as a public SaaS when the intended scope is private/family use.
- [ ] The interface does not rely on technical terminology where family-user wording would be clearer.
- [ ] Important actions are discoverable without scanning dense dashboard text.
- [ ] Empty states explain what can be done next without exposing implementation details.
- [ ] Error, loading, and blocked states can be understood without exposing internal configuration values.
- [ ] Any onboarding or guidance is real user guidance, not a generic dashboard decoration.

## Login Checklist

- [ ] `/login` is treated as the conceptual entry point for authenticated use.
- [ ] The login screen explains the next step without exposing auth internals.
- [ ] No test credentials, real user emails, passwords, tokens, or private auth configuration appear in documentation or screenshots.
- [ ] Login-related failure messages are safe for users and do not expose secrets, endpoints, stack traces, or private configuration.
- [ ] The checklist does not claim that authentication works in runtime unless a separately approved manual QA pass validates it.

## Dashboard Checklist

- [ ] `/dashboard` is treated as the conceptual operational area after login.
- [ ] The dashboard makes the main property-management action easy to identify.
- [ ] The dashboard avoids overwhelming the user with unrelated or premature sections.
- [ ] The dashboard language fits a private/family MVP rather than a broad commercial product.
- [ ] The user can understand whether they are viewing properties, creating a property, editing a property, or reviewing details.
- [ ] Any status or summary shown is understandable without exposing financial or personal details in this document.
- [ ] The checklist does not claim current dashboard runtime behavior unless separately validated.

## Property Workflow Checklist

- [ ] The property workflow is understandable from a family-user perspective.
- [ ] The user can identify the intended place to start managing a property.
- [ ] Create, view, and update concepts are clear at the UI/copy level when present.
- [ ] Required information is explained without encouraging real personal or financial data during test validation.
- [ ] The workflow does not imply unsupported automation or production readiness.
- [ ] Unknown behavior is marked as unknown instead of inferred from documentation.
- [ ] Any future CRUD or status validation is performed with fake data only and under a separately approved validation pass.

## Document and Contract Handling Checklist

- [ ] The product copy makes clear that contract/document review is manual before attachment or upload.
- [ ] The app is not described as legally reviewing, approving, or validating contracts automatically.
- [ ] Manual validation uses fake or placeholder documents only.
- [ ] No real contracts, identity documents, personal documents, financial records, or private files are added to this checklist.
- [ ] Any document attachment flow is described only conceptually unless separately validated in a safe manual QA pass.
- [ ] Storage state and real file privacy are treated as unknown until separately validated.

## Blocking Criteria

Stop manual validation and request human review if any of these occur:

- A step requires reading `.env*`, secrets, credentials, keys, private logs, database files, or dumps.
- A step requires real personal data, real financial data, real contracts, or private family documents.
- A step requires database, storage, Supabase, deploy, runtime, or production access.
- A step requires running project commands, scripts, automation, tests, builds, migrations, or deploy commands.
- A finding would require changing code, auth, Supabase/RLS, database, storage, deploy, or runtime behavior.
- A report would need private URLs, endpoints, IPs, credentials, real configuration values, or sensitive screenshots.
- The current behavior cannot be evaluated safely with fake data and conceptual/manual review only.

## Unknowns

The following are explicitly unknown in this documentation-only checklist:

- runtime behavior
- production readiness
- database contents
- storage state
- real Supabase project state
- latest manual QA status

Do not convert any of these unknowns into claims without a separately approved validation task.

## Security Guardrails

- Keep this checklist sanitized and documentation-only.
- Do not include credentials, real users, passwords, tokens, keys, private URLs, endpoints, IPs, personal data, financial data, or real configuration values.
- Do not include deploy instructions, database commands, project commands, scripts, automation steps, or runtime setup instructions.
- Do not claim that auth, Supabase/RLS, database, storage, production, or runtime behavior is valid unless a separately approved task validates it.
- Preserve the distinction between manual contract/document review by humans and any app feature related to attachments or uploads.
