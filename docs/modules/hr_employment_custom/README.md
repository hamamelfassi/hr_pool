
# `hr_employment_custom`

`hr_employment_custom` is the Marsellia employment lifecycle module.

It starts after Stage 2 recruitment/preboarding has produced a ready applicant and continues into formal employee management using native Odoo HR models wherever possible.

## Scope boundary

This module owns:

- recruitment-to-employment handover;
- employee profile and payroll-readiness setup;
- employee declarations;
- custody and asset acknowledgements;
- training and certification commitments;
- administrative permissions;
- leave overlays on native `hr.leave`;
- work assignments;
- appraisal overlays on native `hr.appraisal`;
- separation requests;
- clearance/offboarding workflows.

It does **not** replace native Odoo HR, payroll, appraisal, leave, attendance, or accounting models.

## Core doctrine

Native Odoo HR models are the operational source of truth.

`hr_employment_custom` adds Marsellia-specific process records, tabs, QWeb forms, Odoo Sign flows, mobile-safe artifact handling, chatter history, activities, manual decision metadata, and GRC hooks.

## Canonical documents

- `00_module_architecture.md`
- `01_pass_13_recruitment_to_employment_handover_spec.md`
- `02_employee_form_tabs_and_view_architecture.md`
- `03_document_artifact_pattern.md`
- `04_photo_avatar_handover_doctrine.md`
- `05_bank_payroll_readiness_doctrine.md`
- `06_employment_lifecycle_process_catalogue.md`
- `07_mobile_artifacts_and_chatter_files_doctrine.md`
- `08_pass_15_plus_implementation_roadmap.md`

## Documents
- `09_handover_field_mapping_matrix.md` — canonical Pass 13 source-to-employee/contract/bank/payroll mapping.
