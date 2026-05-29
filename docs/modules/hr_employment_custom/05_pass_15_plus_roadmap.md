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

- `x_hr.employee_custody_type`;
- `x_hr.employee_custody_item`;
- ID card receipt first;
- structured properties by custody type;
- custody lifecycle;
- offboarding clearance hook.

## Pass 17 — Training and certifications

- `x_hr.employee_training_commitment`;
- QWeb/sign training undertaking;
- certificate submission tracking;
- `hr.resume.line` integration;
- skill/certification mapping;
- future payroll/finance recovery hooks.

## Pass 18 — Leave requests

- extend native `hr.leave`;
- Marsellia leave fields;
- official leave QWeb form;
- optional Sign layer;
- activities for HR/manager/GM review.

## Pass 19 — Administrative permissions

- `x_hr.employee_permission_type`;
- `x_hr.employee_permission_request`;
- configurable type behavior;
- optional `approval.request` linkage;
- future attendance/work-entry effects.

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
