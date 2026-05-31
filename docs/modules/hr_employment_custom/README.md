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
- `pass18_execution_plan.md`

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

Current implementation baseline:

```text
Pass 18 — Administrative permissions F-0014/F-0015 — closed and accepted
```

Pass 18 uses `x_hr.employee_permission_type` and `x_hr.employee_permission` to implement Exit Permission and Lateness Permission before the deferred leave overlay pass.

Next expected pass:

```text
Pass 19 — Leave requests
```

Pass 19 is not started in this documentation closure. It requires a fresh surgical scope confirmation before implementation.

## Current execution plans

- `pass15_execution_plan.md` — employee identification and declarations foundation.
- `pass16_execution_plan.md` — custody and assets foundation; closed and accepted.
- `pass17_execution_plan.md` — training and certifications; closed and accepted.
- `pass18_execution_plan.md` — administrative permissions F-0014/F-0015; closed and accepted.

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
- Arabic translation for training selection-state values was closed in Pass 18F-2 using exact exported `ir.model.fields.selection` anchors.
- Dynamic record-value Arabic PDF hardening remains deferred. Future official Arabic-first PDF generation should force Arabic render context and block generation with a specific toast when required Arabic record translations are missing.
- F-0008 thumbprint remains outside system workflow. No thumbprint fields, uploads, Sign items, or lifecycle states were introduced.

<!-- PASS18G_README_CLOSURE_START -->
## Pass 18 closure note — Administrative permissions F-0014/F-0015

Pass 18 is closed and accepted.

Implemented:
- `x_hr.employee_permission_type` helper model.
- `x_hr.employee_permission` operational process model.
- Exactly two seeded permission types:
  - Exit Permission / `MCEP-HR-F-0014`.
  - Lateness Permission / `MCEP-HR-F-0015`.
- Employee `Permissions` tab.
- Controlled modal and standalone full form.
- Dynamic type-routed QWeb report for F-0014/F-0015.
- Generated PDF storage and employee chatter/files posting.
- Native Odoo Sign lifecycle with three sequential roles:
  1. Employee.
  2. Direct Manager.
  3. HR Responsible.
- Signed PDF and Sign certificate sync/copy to employee chatter/files.
- Duplicate-send guard and explicit Sync button.
- Modal-safe full-width Workflow and Artifacts strip.
- Arabic UI labels and exact exported selection-state translations for Permissions and Training.
- Custody tab translation fixed to `العهود`.

Deliberately deferred:
- attendance effects;
- leave balance effects;
- payroll/work-entry effects;
- disciplinary/deduction automation;
- `approval.request` integration;
- GRC decision-instance integration;
- dynamic Arabic record-value hardening for official PDFs.

Next expected implementation pass is Pass 19 Leave Requests, but it should not start until the leave-specific scope is confirmed.
<!-- PASS18G_README_CLOSURE_END -->

## Pass 19 planning status — Leave requests

Pass 19 is now planned as a custom Marsellia leave request workflow.

Locked posture:

```text
x_hr.employee_leave_type_policy
x_hr.employee_leave_request
```

Native integration posture:

```text
hr.work.entry.type = native leave policy mapping target
hr.leave = future native Time Off bridge target after signed approval
```

The first production pass focuses on official form generation, manual HR balance verification, Odoo Sign, and employee chatter/files artifacts. Automatic balance computation, allocations/accruals, native leave validation, and payroll/work-entry effects are deferred.

<!-- PASS19_README_BASELINE_START -->
## Current baseline after Pass 19

Closed and accepted passes now include:

- Pass 15 — employee declarations and Sign lifecycles;
- Pass 16 — custody/card custody lifecycle;
- Pass 17 — training commitment lifecycle;
- Pass 18 — administrative permissions F-0014/F-0015;
- Pass 19 — leave request F-0016.

Pass 19 implemented leave requests through custom Marsellia process records:

    x_hr.employee_leave_type_policy
    x_hr.employee_leave_request

The native Odoo Time Off models remain future bridge targets:

    hr.work.entry.type -> mapping target
    hr.leave           -> future record creation target

No native Time Off bridge is active in the accepted Pass 19 baseline.
<!-- PASS19_README_BASELINE_END -->

<!-- PASS20_WORK_ASSIGNMENT_README_START -->
## Pass 20 planned baseline — Employee Work Assignments

Pass 20 implements F-0017 Employee Work Assignment as a governed form/sign workflow in `hr_employment_custom`.

Primary model:

    x_hr.employee_work_assignment

Pass 20 captures only manual assignment form data:

- employee;
- assignment location;
- assignment from date;
- assignment to date;
- description / purpose.

All standard document metadata, artifact fields, and Sign metadata follow the accepted custom process doctrine from Declarations, Custody, Training, Permissions, and Leave.

Pass 20 deliberately excludes native Planning, Project, Timesheet, Attendance, Work Entry, Payroll, Fleet, approval.request, and GRC decision integrations.
<!-- PASS20_WORK_ASSIGNMENT_README_END -->

<!-- PASS20_README_CLOSURE_START -->
## Pass 20 closure — Work Assignment Authorization

Pass 20 adds F-0017 Work Assignment Authorization as a custom governed process:

    x_hr.employee_work_assignment

It provides:

- employee Assignments / التكليفات tab;
- manual assignment location/date/purpose capture;
- generated F-0017 PDF;
- four-role Odoo Sign lifecycle;
- signed PDF and certificate sync;
- employee chatter/files artifacts;
- Arabic UI and state translations.

It deliberately does not create or update Planning, Project, Timesheet, Attendance, Work Entry, Payroll, Fleet, Approval, or GRC records. Those integrations remain deferred.
<!-- PASS20_README_CLOSURE_END -->

<!-- PASS21_PERFORMANCE_EVALUATION_README_START -->
## Pass 21 — F-0018 Performance Evaluation Baseline

Pass 21 implements the governed Marsellia F-0018 employee performance evaluation workflow.

Model posture:

    x_hr.employee_performance_evaluation
    x_hr.employee_performance_evaluation_line

The pass covers 12 fixed evaluation items, validated 1–5 scoring, computed total score out of 60, computed grade, star rating, generated F-0018 PDF, two-role Odoo Sign, and employee chatter/files artifacts.

Native Appraisals, Payroll, Salary Adjustment, Promotion/Demotion, Disciplinary, GRC decision, and analytics bridges are deferred.
<!-- PASS21_PERFORMANCE_EVALUATION_README_END -->
