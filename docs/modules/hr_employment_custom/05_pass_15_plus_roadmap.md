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

Status: next implementation pass.


- `x_hr.employee_training_commitment`;
- QWeb/sign training undertaking;
- certificate submission tracking;
- `hr.resume.line` integration;
- skill/certification mapping;
- future payroll/finance recovery hooks.

## Pass 18 — Administrative permissions F-0014/F-0015

- `x_hr.employee_permission_type`;
- `x_hr.employee_permission`;
- exactly two seeded permission types: Exit Permission and Lateness Permission;
- type-routed F-0014/F-0015 QWeb/PDF generation;
- same employee tab, artifact, chatter/files, and native Sign lifecycle pattern accepted in Passes 15–17;
- no attendance, leave, payroll, work-entry, disciplinary, or deduction side effects in the first implementation.

## Pass 19 — Leave requests

- extend native `hr.leave`;
- Marsellia leave fields;
- official leave QWeb form;
- optional Sign layer;
- activities for HR/manager/GM review;
- remains deferred until explicitly started after the permissions pass.

## Pass 20 — Work assignments

- `x_hr.employee_work_assignment`;
- assignment location/period/purpose;
- QWeb/sign;
- approval activity chain;
- future overtime/payroll/planning/project hooks.

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
- Arabic translation for training selection-state values remains incomplete in the live UI and will be fixed later using exact exported `ir.model.fields.selection` anchors.
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
