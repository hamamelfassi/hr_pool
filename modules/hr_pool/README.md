# hr_pool

XML-only Odoo SaaS module for candidate pooling and recruitment intake.

Stage 1 only:

- public intake
- chairman-gated prescreening
- pooling and conversion request initiation
- native recruitment handoff

Stage 1 specification lives in:

- `docs/architecture/02_stage_1_hr_pool_spec.md`
- `docs/architecture/01_two_stage_recruitment_program_plan.md`

## Repo Layout

- Module source stays at repo root so Odoo still sees a normal module.
- Supporting documentation lives under `docs/`.
- n8n assets live under `docs/resources/n8n/`.
- Generated upload archives go to `dist/` and are gitignored.

## Odoo Upload

Do not zip the whole repository directory manually.

Build a clean Odoo upload archive with:

```bash
./scripts/build_odoo_zip.sh
```

That script includes only the module files Odoo needs and excludes docs, helper scripts, git metadata, and local junk files.

## Current Scope

- Odoo module: `hr_pool`
- Integration flow: Fillout/Zite -> n8n -> Odoo
- SaaS constraint: keep non-module materials outside the shipped module archive

## Integration Docs

- Field mapping manifest: `docs/fillout_to_odoo_field_mapping.md`
- n8n mapper reference: `docs/resources/n8n/hr_pool_mapper.js`
- translation delivery plan: `docs/architecture/04_translation_delivery_plan.md`
