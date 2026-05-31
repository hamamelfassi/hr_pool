# Pass 15+ Employment Lifecycle Roadmap

This roadmap is the implementation sequence. 
The detailed model/field/process specifications are consolidated in `docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md`

Pass 13 is not implemented here. Pass 13 is owned by `docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md`


## Pass 15 — Employee identification foundation and declarations

Pass 15 is split to keep the foundation clean before declaration implementation:

### Pass 15A — Documentation/dependency correction

- remove unsafe `hr_contract`/payroll/account dependency assumptions;
- align docs with Pass 13 SaaS finding that payroll readiness is on native `hr.employee` Payroll tab fields;
- lock thin declaration-record posture.

### Pass 15B — Employee Identification tab/model

- scaffold `hr_employment_custom`;
- add `x_hr.employee_identification_document`;
- add employee `الهوية` tab;
- support typed records for `id_card`, `passport`, `driving_license`, and `company_id_card`.

### Pass 13J — Recruitment handover identity sync

Owned by `hr_recruitment_custom` because the source action is still `hr.applicant`.

- update On-board Now to populate employee identification lines when `x_hr.employee_identification_document` exists;
- keep the action soft-coupled to avoid circular module dependency.

### Pass 15C+ — Employee declarations

- `x_hr.employee_declaration`;
- exclusive work declaration;
- occupational safety acknowledgment;
- human waste handling undertaking;
- human waste storage supervisor undertaking;
- QWeb reports that read common values from `hr.employee` and selected employee identification lines;
- native Odoo Sign send/sync with strict source-record anchoring;
- employee chatter/files artifact copy;
- basic GRC role/function hooks.

## Pass 16 — Custody and assets

Status: closed and accepted.


- `x_hr.employee_custody_type`;
- `x_hr.employee_custody_item`;
- ID card receipt first;
- structured properties by custody type;
- custody lifecycle;
- offboarding clearance hook.

## Pass 17 — Training and certifications

Status: closed and accepted.


- `x_hr.employee_training_commitment`;
- QWeb/sign training undertaking;
- certificate submission tracking;
- `hr.resume.line` integration;
- skill/certification mapping;
- future payroll/finance recovery hooks.

## Pass 18 — Administrative permissions F-0014/F-0015

Status: closed and accepted.

- `x_hr.employee_permission_type`;
- `x_hr.employee_permission`;
- exactly two seeded permission types: Exit Permission and Lateness Permission;
- type-routed F-0014/F-0015 QWeb/PDF generation;
- same employee tab, artifact, chatter/files, and native Sign lifecycle pattern accepted in Passes 15–17;
- no attendance, leave, payroll, work-entry, disciplinary, or deduction side effects in the first implementation.

## Pass 19 — Leave requests

Status: next implementation pass after Pass 18 closure.

Revised architecture:

- use `x_hr.employee_leave_type_policy` as the Marsellia leave policy/helper model;
- use `x_hr.employee_leave_request` as the official Marsellia leave request process record;
- link policy records to native `hr.work.entry.type` records where safe;
- treat native `hr.leave` as a future bridge target after a Marsellia request is signed;
- keep manual HR balance verification in the first production pass.

Pass 19 must not directly use `hr.leave` as the primary first-pass form/process record.

Initial implementation scope:

- employee `Leave` tab;
- leave policy helper records;
- leave request process records;
- manual balance fields;
- official F-0016 QWeb/PDF generation, unless the uploaded form confirms another code;
- native Odoo Sign send/sync after PDF acceptance;
- generated/signed/certificate artifact handling;
- employee chatter/files copy;
- future native `hr.leave` bridge fields.

Deferred:

- automatic balance calculation;
- Friday/Saturday weekend exclusion engine;
- public-holiday exclusion engine;
- native `hr.leave` creation/validation;
- allocations/accruals;
- payroll/work-entry/accounting effects;
- approval.request integration;
- GRC decision-instance integration.


## Pass 20 — Work assignments

Status: closed and accepted.

Implemented as F-0017 Work Assignment Authorization:

- custom process model `x_hr.employee_work_assignment`;
- employee Assignments / التكليفات tab;
- manual assignment location, from/to dates, and description/purpose;
- generated reference and document reference without `-EMP-`;
- generated F-0017 QWeb/PDF;
- generated/signed/certificate artifact fields;
- employee chatter/files artifact posting;
- four-role Odoo Sign lifecycle:
  - Employee;
  - Direct Manager;
  - HR Responsible;
  - General Manager;
- Arabic UI, field, section, button, and state translations through exact exported PO anchors.

Deferred beyond Pass 20:

- typed assignment helper model;
- Planning integration;
- Project/task integration;
- Timesheet integration;
- Attendance/Work Entry integration;
- Payroll/overtime/allowance effects;
- Fleet/site logistics;
- `approval.request` workflow;
- GRC decision instances.

## Pass 21 — Performance evaluation

- extend native `hr.appraisal`;
- `x_hr.appraisal_evaluation_line`;
- 12 criteria scoring;
- total/grade;
- QWeb/sign;
- `hr.skill` linkage strategy.

## Pass 22 — Separation request

- `x_hr.employee_separation_request`;
- resignation/non-renewal/medical/other;
- approval/activity chain;
- manual decision metadata;
- starts clearance, does not archive employee directly.

## Pass 23 — Clearance/offboarding

- `x_hr.employee_clearance`;
- `x_hr.employee_clearance_line`;
- generate lines from employee/custody/open obligations;
- enforce custody closure;
- IT/finance/stores/HR activity chain;
- final clearance QWeb/sign;
- native departure/archive only after clearance complete.

## Pass 24 — Smart buttons and mobile artifact hardening

- Sign Requests visibility;
- Documents/files/chatter consistency;
- mobile-safe artifact opening;
- preserve native employee smart buttons.

## Pass 25 — Payroll, attendance, and work-entry integration hardening

- work entries;
- attendance/overtime rules;
- permission effects;
- assignment/overtime payroll hooks;
- training recovery/deduction hooks;
- final settlement/offboarding finance hooks.

## Pass 26 — GRC decision engine integration upgrade

- migrate manual decision metadata to decision templates/instances where justified;
- leave approvals;
- permission approvals;
- training funding;
- assignment/overtime;
- separation;
- clearance overrides;
- disciplinary/HSE decisions.

## Current implementation status after Pass 15B / 13J-B

Locked:

```text
15A — documentation/dependency correction
15B — hr_employment_custom scaffold + employee Identification tab/model
13J-A — applicant الترحيل tab surface
13J-B — standalone recruitment-to-employee identity sync
```

Accepted operating sequence:

```text
بدء التوظيف
→ creates/reuses hr.employee and writes payroll/bank/artifact handover fields
→ ترحيل الهوية
→ syncs accepted recruitment identity submissions into employee identity lines
→ Pass 15C+ declarations consume hr.employee + selected employee identity lines
```

Deferred cleanup:

```text
13J-C — optionally call identity sync automatically inside بدء التوظيف after more standalone runs are proven safe.
```

Next slices:

```text
15C — employee declaration model and thin declaration tab
15D — declaration creation helper and type behavior
15E — QWeb report skeleton and paperformat for F-0010/F-0013/F-0021/F-0022
15F — generate declaration PDF action
15G — native Sign send action with strict source-record anchoring
15H — sync signed result and copy signed PDF/certificate to employee chatter/files
15I — UI/read-only/artifact hardening and targeted translation update
15J — regression and lock
```

Scope guard:

Pass 15C+ must not create custody, training, leave, permissions, assignments, appraisal, separation, clearance, payroll, work-entry, or GRC decision-instance logic.

## Current working sequence after F-0010 generation

Accepted sequencing update:

```text
Finish QWeb/PDF generation for all selected employee declaration forms first.
Then implement Odoo Sign send/sync flows for the declaration group second.
```

Current locked generation state:

```text
F-0010 Exclusive Work Declaration — QWeb/PDF generation accepted
```

Current deferred items:

```text
F-0010 footer micro-positioning refinement
F-0010 Sign send/sync
F-0010 signed PDF/certificate sync
F-0010 mobile-safe signed artifact copy
```

Report generation lessons:

- Shared embedded font/logo assets should live in a common QWeb asset/header template.
- The `report.paperformat` record controls page geometry only; it does not carry reusable font/logo/header content.
- For fixed governed forms, static page labels are acceptable where Odoo SaaS does not reliably resolve body-level `.page/.topage` counters.
- Header and footer layout must be tested from generated PDF, not only XML sanity or HTML preview.
- Translation updates should follow the exported-anchor PO method after the functional slice installs cleanly.

## Pass 15 closure status

Pass 15 is functionally closed.

Closed scope:

```text
Employee identification foundation
Recruitment-to-employee identity sync as standalone 13J action
Employee declaration model and tab
F-0010/F-0013/F-0021/F-0022 QWeb/PDF generation
F-0010/F-0013/F-0021/F-0022 Odoo Sign send/sync
Generated/signed/certificate artifact copy to employee chatter/files
Artifact download buttons
Arabic translation polish using exported PO anchors
```

Carry-forward backlog:

```text
13J-C automatic identity sync from On-board Now
DRY refactor for repeated Sign send/sync action code
Helper-record replacement for long selection labels if required
Stronger lifecycle/security guards
Recruitment Sign smart-button anchoring fix
Documents app governance hardening
GRC decision-instance integration
```

Next pass:

```text
Pass 16 — Custody and assets
```

Pass 16 should reuse the Pass 15 artifact and Sign lessons:

- process record owns lifecycle truth;
- native employee record remains the operational employee source;
- generated/signed/certificate artifacts copy to employee chatter/files;
- user-facing artifact access should use download actions, not raw `ir.attachment` many2one links;
- Sign field geometry should be calibrated only after generated PDFs are accepted.

Pass 17 refinement:

- source form is F-0008;
- architecture uses `x_hr.training`, `x_hr.training_course`, and `x_hr.employee_training_commitment`;
- resume, skills, and certificate deepening are deferred;
- three state layers are used: form lifecycle, commitment lifecycle, and participation lifecycle.

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

## Pass 18A scope lock — Administrative permissions before leave

Pass 18 is now locked as the administrative permissions implementation for F-0014 Exit Permission and F-0015 Lateness Permission.

This corrects the earlier roadmap ordering that placed leave before administrative permissions. The immediate implementation order is:

```text
Pass 18 — Administrative permissions F-0014/F-0015
Pass 19 — Leave requests, unless later rescheduled
```

Pass 18 must use one helper/type model and one operational model:

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

The first implementation remains bounded to document lifecycle, QWeb/PDF generation, native Sign, chatter/files, and manual approval metadata only. Attendance, leave, payroll, work-entry, approval-request, and GRC decision-instance integrations are deferred.

<!-- PASS18G_ROADMAP_CLOSURE_START -->
## Pass 18 closure status

Pass 18 is closed and accepted.

Closed scope:

```text
x_hr.employee_permission_type
x_hr.employee_permission
Exit Permission type
Lateness Permission type
employee Permissions tab
modal and standalone permission forms
dynamic F-0014/F-0015 QWeb generation
generated PDF attachment/chatter/files lifecycle
three-role native Odoo Sign send/sync
signed PDF and certificate sync/copy to employee chatter/files
modal-safe workflow/artifact controls
Arabic UI labels
exact exported selection-state translations for Permissions and Training
Custody tab translation to العهود
```

Accepted deferrals:

```text
attendance/work-entry effects
leave-balance effects
payroll/deduction effects
approval.request integration
disciplinary consequences
GRC decision-instance integration
dynamic Arabic record-value hardening for official PDFs
```

Rebaseline:

```text
Pass 19 — Leave requests
```

Pass 19 remains the next expected pass, but implementation should pause until the leave-specific scope, form guidance, and surgical constraints are confirmed by the user.
<!-- PASS18G_ROADMAP_CLOSURE_END -->

<!-- PASS19_ROADMAP_CLOSURE_START -->
## Pass 19 closure and next-cycle rebaseline

Pass 19 — Leave Requests / F-0016 — is closed.

Accepted pass result:

- custom Marsellia leave policy helper;
- custom Marsellia leave request process record;
- native `hr.work.entry.type` mapping target for safe future bridge;
- F-0016 generated PDF;
- four-role Odoo Sign lifecycle;
- Arabic UI and QWeb translation lock;
- native `hr.leave` bridge deliberately deferred.

Deferred leave bridge cycle:

- create native `hr.leave` from signed Marsellia request;
- decide whether Emergency Leave needs a dedicated native Time Off type;
- test native Time Off states and validation safely;
- connect allocations/accruals only after policy/legal computation is scoped;
- compute Friday/Saturday weekend exclusions only after calendar policy is locked;
- compute public holidays only after public holiday source-of-truth is locked;
- integrate payroll/work-entry effects only in a later payroll/work-entry pass.

Next pass is not launched by this closure. Start the next implementation thread/slice only after new user scope instructions are provided.
<!-- PASS19_ROADMAP_CLOSURE_END -->

<!-- PASS20_WORK_ASSIGNMENT_ROADMAP_START -->
## Pass 20 roadmap lock — F-0017 Employee Work Assignment

Pass 20 is locked as F-0017 Employee Work Assignment.

Implementation posture:

    custom x_hr.employee_work_assignment process record
    official F-0017 QWeb/PDF generation
    four-role Odoo Sign lifecycle
    employee chatter/files artifacts
    Arabic UI/QWeb translations

No typed/helper assignment model is included in Pass 20.

No native operational integration is included in Pass 20.

Deferred integration candidates:

- Planning;
- Project/tasks;
- Timesheets;
- Attendance;
- Work Entries;
- Payroll/overtime/per diem;
- Fleet/site logistics;
- approval.request;
- GRC decision instances.

Pass 20 slices:

- 20A — documentation/execution-plan lock;
- 20B — model/access/employee tab scaffold;
- 20C — normalization/defaulting;
- 20D — F-0017 QWeb/PDF generation;
- 20E — four-role Sign lifecycle;
- 20F — Arabic UI/QWeb polish;
- 20G — documentation closure.
<!-- PASS20_WORK_ASSIGNMENT_ROADMAP_END -->

<!-- PASS20_CLOSURE_ROADMAP_START -->
Pass 20 is closed as F-0017 Work Assignment Authorization. It proved the lean governed-form pattern: one custom operational model, manual form fields, QWeb/PDF, four-role Odoo Sign, employee chatter/files, and exact-anchor Arabic UI translation, with all native operational integrations deferred.
<!-- PASS20_CLOSURE_ROADMAP_END -->

<!-- PASS21_PERFORMANCE_EVALUATION_ROADMAP_START -->
## Pass 21 — F-0018 Employee Performance Evaluation

Status at Pass 21A:

    scoped / execution-plan locked

Implementation direction:

- Use `x_hr.employee_performance_evaluation` parent model.
- Use `x_hr.employee_performance_evaluation_line` line model.
- Generate 12 fixed F-0018 evaluation lines.
- Validate score range 1–5.
- Compute total score out of 60.
- Compute percentage, grade, and star rating.
- Generate F-0018 PDF with checkbox matrix and grade checkboxes.
- Use two-role native Odoo Sign:
  - Direct Manager;
  - HR Manager.
- Use exact-anchor Arabic UI/QWeb translation workflow.

Deferred beyond Pass 21:

- Odoo Appraisals bridge;
- payroll/salary/promotion/disciplinary consequences;
- GRC decision instances;
- configurable evaluation templates;
- employee self-review / 360 review;
- analytics and historical performance dashboards.
<!-- PASS21_PERFORMANCE_EVALUATION_ROADMAP_END -->
