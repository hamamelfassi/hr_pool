# `hr_employment_custom` Module Architecture

## Environment

- Odoo.com SaaS 19.2.
- Importable custom app module.
- XML/data/view/QWeb/server-action implementation only.
- No Odoo.sh.
- No server-side Python addon files.

## Ownership boundary

`hr_employment_custom` owns the employee lifecycle after a native `hr.employee` exists.

It does not own the source recruitment handover action. Pass 13 is owned by `hr_recruitment_custom`.

## Starting dependency posture

`hr_employment_custom` should start with these dependencies:

- `base`
- `mail`
- `hr`
- `hr_contract`
- `hr_recruitment`
- `hr_recruitment_custom`
- `hr_holidays`
- `hr_attendance`
- `hr_appraisal`
- `hr_payroll`
- `hr_payroll_account`
- `account`
- `sign`
- `grc_backbone`

Payroll, payroll accounting, and accounting are not optional because the employee lifecycle must operate against payroll-ready employee/contract/bank data.

## Native-source-of-truth rule

Use native Odoo models where they already represent the business object:

- employee master: `hr.employee`;
- contract/payroll bridge: `hr.contract`;
- leave: `hr.leave`;
- attendance/time data: `hr.attendance` and work entries later;
- payroll: `hr.payroll`, `hr.payslip`, salary structures later;
- appraisals: `hr.appraisal`;
- bank accounts: `res.partner.bank`.

Use custom models only where Marsellia has a real process object that Odoo does not model natively.

## Custom model families

- `x_hr.employee_declaration`
- `x_hr.employee_custody_type`
- `x_hr.employee_custody_item`
- `x_hr.employee_training_commitment`
- `x_hr.employee_permission_type`
- `x_hr.employee_permission_request`
- `x_hr.employee_work_assignment`
- `x_hr.appraisal_evaluation_line`
- `x_hr.employee_separation_request`
- `x_hr.employee_clearance`
- `x_hr.employee_clearance_line`

## No employment registry by default

Employment lifecycle process models should own their own artifacts through the reusable document artifact pattern.

A central recruitment-style document registry is not required for employment unless a later governance pass proves the need.
