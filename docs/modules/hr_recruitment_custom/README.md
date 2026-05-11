# HR Recruitment Custom Module Docs

This folder stores module-specific documentation for `hr_recruitment_custom`.

`hr_recruitment_custom` is the Marsellia Stage 2 extension of native Odoo Recruitment.

It should remain a thin recruitment extension, not a separate recruitment application.

## Authoritative docs

Read these first:

1. `docs/architecture/00_master_architecture_and_program_plan.md`
2. `docs/architecture/01_two_stage_recruitment_program_plan.md`
3. `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
4. `docs/resources/current_phase_execution_plan.md`
5. `pass_5e_f0003_native_sign_lifecycle_plan.md` — locked Pass 5E F-0003 checklist/PDF/native Sign lifecycle plan.
6. `native_odoo_sign_workflow_wiki.md` — reusable native Odoo Sign send/sync workflow pattern proven on F-0003.
7. `server_action_saas_patterns_wiki.md` — Odoo.com SaaS-safe server-action guard and toast patterns.
8. `fillout_required_document_submission_contract.md` — Fillout/Zite/n8n payload contract for Pass 6B/6C public required-document submissions.
9. `n8n_required_document_writeback_contract.md` — n8n writeback contract for creating Odoo required-document submission records from Fillout webhook payloads.


## Supporting docs

Supporting resource docs may explain rationale, gap analysis, old decisions, or concepts.

They are not authoritative if they conflict with the architecture docs above.

## Current Stage 2 cockpit

The final `hr.applicant` cockpit tabs are:

- `Role and Duties`
- `Evaluation`
- `Documents`
- `Declarations`
- `Contract`

The smart button `Recruitment Documents` opens the applicant-filtered lifecycle registry.

## Current lifecycle spine

The formal artifact lifecycle model is:

`x_hr.recruitment_document`

It tracks generated, uploaded, signed, cancelled, and superseded recruitment artifacts.

## Working rule

Do not implement from old discussion notes alone.

Before each code pass, use the current pass execution plan and confirm that the architecture docs still match the intended implementation.

## Server action SaaS patterns

Server actions in this module must follow the SaaS-safe guard pattern documented in:

- `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`

Key rule: do not use `raise Warning(...)` inside Odoo.com SaaS 19.2 server actions. Use `display_notification` toast guards and preserve them by avoiding unconditional reload overwrites.