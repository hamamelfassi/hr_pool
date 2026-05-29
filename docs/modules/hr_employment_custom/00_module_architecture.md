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

`hr_employment_custom` should start with the smallest safe dependency set required for the first employment lifecycle slice:

- `base`
- `mail`
- `hr`
- `sign`
- `grc_backbone`

Do not add `hr_contract`, `hr_payroll`, `hr_payroll_account`, or `account` as starting dependencies.

Pass 13 proved that the tested Odoo.com SaaS 19.2 database did not expose/import `hr.contract` in the way originally assumed. Payroll/contract readiness is therefore represented through native `hr.employee` Payroll tab fields populated by the recruitment handover action until later technical preflight proves a safer contract/payroll integration path.

`hr_recruitment_custom` remains the owner of applicant-to-employee handover. `hr_employment_custom` may be installed after recruitment handover, but it must not create a circular dependency with `hr_recruitment_custom`.

## Native-source-of-truth rule

Use native Odoo models where they already represent the business object:

- employee master: `hr.employee`;
- employee payroll/contract overview footprint: native `hr.employee` Payroll tab fields until `hr.contract` is proven safe in the current SaaS database;
- leave: `hr.leave`;
- attendance/time data: `hr.attendance` and work entries later;
- appraisals: `hr.appraisal`;
- bank accounts: `res.partner.bank`.

Use custom models only where Marsellia has a real process object or reusable HR data object that Odoo does not model natively for this implementation.

For Pass 15+, declaration PDFs should source common values directly from `hr.employee` wherever available:

- employee name: `hr.employee.name`;
- department/division: `hr.employee.department_id.name`;
- job title: `hr.employee.job_title` or safe native fallback;
- direct manager/supervisor: `hr.employee.parent_id.name`;
- national ID: `hr.employee.identification_id`;
- payroll/contract start date: populated native `hr.employee` Payroll tab field where available.

The generated PDF attachment is the controlled legal snapshot. Do not duplicate broad employee snapshot fields onto declaration records unless a later legal or lifecycle requirement proves the need.

## Custom model families

- `x_hr.employee_identification_document`
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

## Pass 15A rebaseline

Pass 15A locks the following implementation posture before code:

```text
15A — documentation/dependency correction
15B — scaffold hr_employment_custom and employee Identification tab/model
13J — optional recruitment handover hardening to populate employee identification lines if the model exists
15C+ — employee declarations using thin declaration records and employee/identity source values
```

The employee identification model is intentionally thin and reusable. It supports typed identity records for:

```text
id_card
passport
driving_license
company_id_card
```

The declarations tab consumes those records through a selected identification document field where a form requires “Personal ID”, “ID Passport No.”, passport, driving-license, or company-card details.
