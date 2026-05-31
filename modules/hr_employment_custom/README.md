# hr_employment_custom

Marsellia employee lifecycle extension module.

The module extends native `hr.employee` and keeps native Odoo HR as the operational source of truth.

Implemented and accepted so far:

- employee identification tab/model;
- employee declaration process model and F-0010/F-0013/F-0021/F-0022 PDF/Sign lifecycle;
- custody type/item model and F-0011 PDF/Sign lifecycle;
- training type/course/employee training commitment model and F-0008 PDF/Sign lifecycle.

Current implementation pass:

```text
Pass 19 — Leave requests / F-0016 official leave workflow
```

Pass 18 uses one helper/type model and one operational model:

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

Attendance, leave, payroll, work-entry, approval-request, and GRC decision-instance effects remain deferred.

## Pass 17F backlog note — dynamic record-value Arabic translation hardening

F-0008 currently uses a bilingual QWeb layout for static form labels and undertaking text. This is acceptable for the current demonstrator slice, but it does not fully solve Arabic rendering for dynamic values read from records, such as Training Type, Course Name, Provider, Location, Currency Label, and Amount in Words.

Future hardening requirement:
- Render official Arabic-first PDFs with explicit Arabic context, not by relying on the UI language of the user pressing the button.
- For every required dynamic record value shown on the PDF, validate that an Arabic translated value exists when the source value is not already Arabic.
- If a required Arabic translation is missing, block PDF generation with a clear toast naming the exact model, field, and record that needs translation.
- Allow the translation to be fixed through the exported PO workflow or, for emergency correction only, through Studio/translation UI.
- Do not implement this as part of 17F; schedule it as a later translation-governance hardening slice.

## Translation operating note — exported PO handling

When using an exported Arabic PO as the source baseline for a translation patch, place it at the repository root as `ar_001.po` before running the patch, or adjust the patch source path explicitly. If no exported root PO is present, patches must update `modules/hr_employment_custom/i18n/ar_001.po` directly with exact Odoo anchors.

For selection values and view/action labels, generic `msgid/msgstr` entries are not sufficient. The PO must include the exact exported-style anchors such as `model_terms:ir.ui.view,arch_db:...`, `model:ir.actions.server,name:...`, `model:ir.ui.menu,name:...`, and `model:ir.model.fields.selection,name:...`.

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
