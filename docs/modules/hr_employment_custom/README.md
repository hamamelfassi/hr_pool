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

The first implementation baseline also adds a thin employee identification document model/tab so employment lifecycle forms can reuse typed ID card, passport, driving-license, and company-ID data without duplicating those values into every declaration or process record.

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

## Implementation reference

- Detailed process model specifications are consolidated in `01_employee_lifecycle_processes.md`.
- Pass 13 handover is owned by `docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md`.
- Stage 1 pool-to-applicant handover is owned by `docs/modules/hr_pool/03_pool_to_applicant_handover.md`.

## Pass 15 implementation status

Pass 15 is closed.

Implemented and accepted:

- employee identification tab/model;
- standalone recruitment identity sync action;
- employee declaration process model;
- F-0010, F-0013, F-0021, and F-0022 QWeb/PDF generation;
- F-0010, F-0013, F-0021, and F-0022 Odoo Sign send/sync;
- signed PDF and Sign certificate copy to employee chatter/files;
- artifact download buttons;
- Arabic translation polish using exported Odoo PO anchors.

Next implementation pass:

```text
Pass 16 — Custody and assets
```

## Current execution plans

- `pass15_execution_plan.md` — employee identification and declarations foundation.
- `pass16_execution_plan.md` — custody and assets foundation; closed and accepted.
- `pass17_execution_plan.md` — training and certifications; next implementation pass.

Pass 17 note:

- Pass 17 is the F-0008 training commitment implementation.
- It introduces training type, training course, and employee training commitment records.
- Resume, skills, certification deepening, payroll recovery, and termination breach automation are deferred.

## Pass 17 closure note — F-0008 training commitment lifecycle

Pass 17 implemented the training commitment foundation around F-0008.

Implemented:
- `x_hr.training` training type/framework model.
- `x_hr.training_course` training course/session model.
- `x_hr.employee_training_commitment` employee participation and undertaking model.
- Employee `Training` tab.
- F-0008 one-page A4 QWeb/PDF generation.
- Generated PDF storage, download icon, employee chatter/files posting.
- Native Odoo Sign send/sync for one employee signer and one signature item.
- Signed PDF and Sign certificate linkage/posting.
- Three-layer training state doctrine:
  - form lifecycle;
  - commitment lifecycle;
  - participation lifecycle.
- Manual commitment controls:
  - breached;
  - fulfilled;
  - cancelled.
- Manual participation controls:
  - in training;
  - complete;
  - incomplete.

Accepted residual deferral:
- Arabic translation for training selection-state values remains incomplete in the live UI and will be fixed later using exact exported `ir.model.fields.selection` anchors.
- Dynamic record-value Arabic PDF hardening remains deferred. Future official Arabic-first PDF generation should force Arabic render context and block generation with a specific toast when required Arabic record translations are missing.
- F-0008 thumbprint remains outside system workflow. No thumbprint fields, uploads, Sign items, or lifecycle states were introduced.
