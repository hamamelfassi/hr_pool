# Docs

This folder stores project documentation and non-module implementation assets that should not be uploaded inside any Odoo SaaS module zip.

## Structure

- `architecture/`
  master architecture, integrated plans, and program strategy
- `architecture/01_two_stage_recruitment_program_plan.md`
  program-level two-stage recruitment flow
- `architecture/02_stage_1_hr_pool_spec.md`
  stage 1 intake / pool specification
- `architecture/03_stage_2_hr_recruitment_custom_spec.md`
  stage 2 native recruitment extension specification
- `architecture/04_translation_delivery_plan.md`
  translation delivery rules for installable stages
- `modules/hr_pool/`
  HR Pool-specific documentation
- `modules/hr_recruitment_custom/`
  stage 2 recruitment-extension documentation
- `modules/grc_backbone/`
  GRC-specific documentation
- `resources/n8n/`
  n8n code-node scripts and mapping helpers
- `resources/unified lifecycle + remaining recruitment phase 2 plan.md`
  canonical pass tracker for the recruitment document lifecycle work

Documentation workflow:

- before any future pass, create a separate pass-specific plan/spec file in `docs/` for confirmation
- after completing a pass, create a separate implementation summary file in `docs/`

Add future integration notes, field maps, webhook payload examples, and deployment notes here.


## Employment lifecycle documentation

- `architecture/05_employment_lifecycle_program_plan.md`
  program-level employment lifecycle plan after Stage 2 recruitment.
- `modules/hr_employment_custom/`
  architecture and implementation specs for the employment lifecycle custom module.

<!-- MCEP_EMPLOYMENT_DOCS_START -->
## Employment lifecycle documentation

- `modules/hr_pool/03_pool_to_applicant_handover.md`
  Stage 1 intake to applicant handover, including candidate photo propagation.
- `modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md`
  Applicant to employee/contract/bank/payroll-ready handover.
- `modules/hr_employment_custom/`
  Employee lifecycle after the employee exists.
<!-- MCEP_EMPLOYMENT_DOCS_END -->
