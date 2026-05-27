# `hr_employment_custom`

`hr_employment_custom` is the Marsellia employee lifecycle module.

It starts after recruitment has created or linked a native `hr.employee`.

The recruitment-to-employment handover action itself is owned by `hr_recruitment_custom`, because the source action starts from `hr.applicant`.

## Scope

This module owns employee lifecycle workflows after the employee exists:

- employee declarations;
- custody and asset acknowledgements;
- training and certification commitments;
- administrative permissions;
- leave overlays on native `hr.leave`;
- work assignments;
- appraisal overlays on native `hr.appraisal`;
- separation requests;
- clearance/offboarding workflows.

It does not replace native Odoo HR, payroll, appraisal, leave, attendance, accounting, or bank models.

## Core doctrine

Native Odoo HR models remain the operational source of truth.

`hr_employment_custom` adds Marsellia-specific process records, tabs, QWeb forms, Odoo Sign flows, mobile-safe artifact handling, chatter history, activities, manual decision metadata, and GRC hooks.

## Canonical documents

- `00_module_architecture.md`
- `01_employee_lifecycle_processes.md`
- `02_document_artifact_and_signing_pattern.md`
- `03_employee_form_tabs_and_ui_doctrine.md`
- `04_mobile_artifacts_chatter_and_activities.md`
- `05_pass_15_plus_roadmap.md`

## Related handover documents

- Pool to applicant handover: `docs/modules/hr_pool/03_pool_to_applicant_handover.md`
- Applicant to employee handover: `docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md`
