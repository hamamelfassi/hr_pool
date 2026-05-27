# Pass 13 — Recruitment to Employment Handover

## Ownership

Pass 13 is owned by `hr_recruitment_custom`.

Reason: the source object and action are on `hr.applicant`.

`hr_employment_custom` owns the employee lifecycle after a native employee exists, but it does not own the recruitment exit action.

## Purpose

Pass 13 converts a fully ready applicant into a payroll-ready employee footprint.

It creates or links:

```text
hr.employee
hr.contract
res.partner.bank
```

It must not create payslips, leave records, attendance work entries, appraisals, custody records, training commitments, separation records, or clearance records.

## User-facing action

Arabic:

```text
بدء التوظيف
```

English working name:

```text
On-board Now
```

## Entry guard

The action must run only when:

```text
جاهزية التوظيف مكتملة
```

Readiness requires:

- Board Decision complete;
- F-0005 Employment Contract signed and uploaded;
- F-0006 Job Description signed;
- F-0007 Policies Compliance Declaration signed;
- F-0009 Non-Disclosure Agreement signed.

Ministry accreditation is tracked but is not a handover blocker.

## Duplicate prevention

Before creating records, the action must check:

- existing employee linked to the applicant;
- existing employee with the same source applicant field;
- likely duplicate by national ID / identification number where validated;
- existing contract linked to the employee or source applicant;
- existing bank account with the same sanitized account number or IBAN and holder where available.

If uncertain, block with a clear toast. Do not silently merge or overwrite.

## Applicant to employee mapping

Minimum target mapping:

| Target | Source | Rule |
|---|---|---|
| `hr.employee.name` | `hr.applicant.partner_name` or display name | required |
| `hr.employee.image_1920` | applicant photo field | optional but preferred |
| `hr.employee.work_phone` | applicant phone | safe if field exists |
| `hr.employee.work_mobile` | applicant mobile/phone | safe if field exists |
| `hr.employee.work_email` | applicant email or company email policy | do not invent company email |
| `hr.employee.job_id` | applicant job | native job link |
| `hr.employee.department_id` | job/contract/applicant snapshot | prefer reliable job or contract source |
| `hr.employee.job_title` | TOR/job title snapshot | only if field exists/writable |
| `hr.employee.parent_id` | department/job manager | do not guess if ambiguous |
| `hr.employee.category_ids` | role/category policy | optional |
| custom source applicant field | applicant ID | required for traceability |
| custom source pool field | linked pool record if available | required where available |

Private fields such as identification, birthday, family details, emergency contact, and citizenship should only be mapped when source data is validated and target field behavior is confirmed.

## Photo and avatar mapping

Canonical chain:

```text
hr_pool.x_profile_photo
→ hr.applicant applicant photo field
→ hr.employee.image_1920
```

Implementation rule:

- write the best available original candidate photo to `hr.employee.image_1920`;
- do not manually write derivative avatar or thumbnail fields unless field metadata proves they are writable and required;
- if no photo is available, do not block onboarding; post a warning chatter message.

## Applicant to contract mapping

Create or link a native `hr.contract`.

Minimum fields:

| Target | Source |
|---|---|
| `employee_id` | created/linked employee |
| `job_id` | applicant job |
| `department_id` | applicant/job/contract snapshot |
| `date_start` | F-0005 start date / applicant availability where appropriate |
| `date_end` | F-0005 end date where present |
| `wage` | F-0005 / applicant employment contract cockpit |
| `wage_type` | payroll policy |
| `employee_type` | employment policy |
| `contract_type_id` | configured contract type |
| `structure_type_id` | pay category / salary structure type |
| `resource_calendar_id` | working schedule |
| `registration_number` | employee/contract reference |
| custom signed artifact field | signed F-0005 attachment |
| custom source field | applicant and applicant employment contract source |

The native contract is the payroll bridge, not merely a PDF mirror.

## Bank account mapping

Pass 13 must create or find a full native bank account record:

```text
Applicant bank submission / Applicant Employment Contract
→ res.partner.bank
→ hr.employee.bank_account_ids
```

Required target behavior:

- populate `res.partner.bank.acc_number`;
- write collected IBAN to the actual exported custom IBAN field on `res.partner.bank`, or create/use `x_iban` if needed;
- link bank account to `hr.employee.bank_account_ids`;
- copy bank proof attachment to employee chatter/files;
- do not store payroll bank data only as custom text fields;
- do not automatically mark the account as payment-trusted unless finance policy explicitly requires it.

Payroll-ready means employee, contract, wage/schedule/pay structure, and native bank account are prepared.

Payment-ready is a separate finance validation state.

## Signed artifact handover

Copy or post these final signed artifacts to employee chatter/files:

- Board Decision;
- F-0005 Employment Contract;
- F-0006 Job Description;
- F-0007 Policies Compliance Declaration;
- F-0009 Non-Disclosure Agreement.

Chatter/files is the mobile-safe access path. Direct `/web/content/...` icon buttons are convenience controls only.

## Post-handover states

After successful handover:

| Source | Expected result |
|---|---|
| applicant | marked onboarded / handed over |
| employee | created or linked |
| contract | created or linked |
| bank account | native `res.partner.bank` linked if source data exists |
| artifacts | posted to employee chatter/files |
| chatter | summary posted on applicant and employee |
| payroll | ready footprint present; no payslip generation |

## Acceptance checklist

- blocked if readiness is incomplete;
- blocked if duplicate employee is found;
- created employee has correct source applicant traceability;
- created contract is linked to employee and applicant source;
- bank account is native `res.partner.bank` and linked to employee;
- IBAN is written to native/custom bank field where collected;
- photo flows to `hr.employee.image_1920` when available;
- signed artifacts are visible from employee chatter/files in desktop and mobile;
- no payslip is generated.
