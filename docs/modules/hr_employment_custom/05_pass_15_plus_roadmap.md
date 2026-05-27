# Pass 15+ Employment Lifecycle Roadmap

This roadmap is the implementation sequence. 
The detailed model/field/process specifications are consolidated in `docs/modules/hr_employment_custom/01_employee_lifecycle_processes.md`

Pass 13 is not implemented here. Pass 13 is owned by `docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md`


## Pass 15 — Employee declarations

- `x_hr.employee_declaration`;
- exclusive work declaration;
- occupational safety acknowledgment;
- human waste handling undertaking;
- human waste storage supervisor undertaking;
- QWeb reports;
- native Odoo Sign send/sync;
- employee chatter/files artifact copy;
- GRC role/function hooks.

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
