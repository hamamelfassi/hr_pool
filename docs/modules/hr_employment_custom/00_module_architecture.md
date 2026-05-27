
# `hr_employment_custom` Module Architecture

## Environment

- Odoo.com SaaS 19.2.
- Importable custom app module.
- XML/data/view/QWeb/server-action implementation only.
- No Odoo.sh.
- No server-side Python addon files.

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

Payroll, payroll accounting, and accounting are not optional in this architecture because Pass 13 must create a payroll-ready employee/contract/bank footprint even though it must not process payroll or generate payslips yet.

## Native-source-of-truth rule

Use native Odoo models where they already represent the business object:

- employee master: `hr.employee`;
- contract/payroll bridge: `hr.contract`;
- leave: `hr.leave`;
- attendance/time data: `hr.attendance` and work entries later;
- payroll: `hr.payroll` / `hr.payslip` / salary structures later;
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

## No recruitment-style employment registry

Employment lifecycle records should use the reusable Document Artifact Pattern on the source process model.

A central recruitment-style registry is not required for employment unless a later governance pass proves the need.
