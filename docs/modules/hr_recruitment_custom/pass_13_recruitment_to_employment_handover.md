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
hr.employee Payroll tab contract/payroll readiness fields
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
- existing payroll/contract overview values on the linked employee;
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

## Applicant to employee Payroll tab mapping

Odoo SaaS 19.2 does not expose an importable `hr.contract` model in this database.

Therefore Pass 13 does not create `hr.contract`.

Instead, Pass 13 populates the native Payroll tab contract/payroll overview fields directly on `hr.employee`.

Minimum mapping:

| Target | Source |
|---|---|
| `hr.employee.contract_date_start` / equivalent | F-0005 start date, applicant handover start, applicant availability fallback |
| `hr.employee.contract_date_end` / equivalent | F-0005 end date or applicant handover end |
| `hr.employee.wage` | F-0005 monthly wage / applicant handover wage |
| `hr.employee.wage_type` | `monthly` / Fixed Wage default unless overridden |
| `hr.employee.employee_type` | `employee` where supported |
| `hr.employee.contract_type_id` | applicant override, else Employee / Full-Time / Permanent fallback |
| `hr.employee.structure_type_id` | applicant override, else Fixed Month - Regular fallback |
| `hr.employee.resource_calendar_id` | applicant override, else Standard 40 hours/week fallback |
| `hr.employee.work_entry_source` | applicant override, else calendar / Working Schedule fallback |
| `hr.employee.registration_number` / reference where available | F-0005 contract number where available |

Source precedence:

```text
F-0005 cockpit
→ applicant payroll handover override fields
→ safe operational defaults
```

The native Payroll tab fields are the payroll bridge, while F-0005 remains the signed legal document artifact.

Pass 13 must not create payslips, pay runs, or work entries.

## Bank account mapping

Pass 13 creates or finds a full native bank account record:

```text
Applicant bank submission / Applicant Employment Contract
→ res.partner.bank
→ hr.employee.bank_account_ids
```

Odoo SaaS 19.2 bank target fields:

| Target | Rule |
|---|---|
| `res.partner.bank.account_number` | canonical account number; do not use `acc_number` |
| `res.partner.bank.holder_name` | employee/applicant name |
| `res.partner.bank.bank_name` | bank name from F-0005 / accepted bank submission |
| `res.partner.bank.city` | branch/location fallback |
| `res.partner.bank.x_bank_branch_snapshot` | explicit Marsellia branch snapshot |
| `res.partner.bank.x_iban` | collected IBAN |
| `res.partner.bank.partner_id` | partner matching employee `work_contact_id` domain |
| `hr.employee.bank_account_ids` | link the bank account to the employee |

Rules:

- do not write IBAN into `clearing_number`;
- do not use `clearing_number` unless Marsellia later collects a true domestic routing/clearing number;
- do not auto-enable Send Money/payment trust;
- payment-ready is a finance validation state, not an HR handover state;
- bank proof attachments should be copied/postable to employee chatter/files where available.

Payroll-ready means employee, Payroll tab fields, and native bank account are prepared.

Payment-ready remains separate.

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
| Payroll tab | contract/payroll overview fields populated on employee |
| bank account | native `res.partner.bank` linked if source data exists |
| artifacts | posted to employee chatter/files |
| chatter | summary posted on applicant and employee |
| payroll | ready footprint present; no payslip, pay run, or work entry generation |

## Final closure and stage movement

After employee, Payroll tab, bank, and artifact checks complete, the On-board Now action moves the applicant to:

```text
Contract Signed / تم توقيع العقد
```

The action remains idempotent:

- rerun reuses the linked employee;
- rerun syncs Payroll tab values;
- rerun reuses the linked bank account;
- rerun confirms copied artifacts without duplicating them;
- rerun records final closure notes.

## Known deferred hardening

Existing `hr_recruitment_custom` Sign Requests smart-button anchoring may show sign requests from other applicants.

Decision:

- defer fixing existing recruitment sign-button leakage until after Pass 15+;
- do not risk breaking the accepted recruitment/preboarding signing flows now;
- all new `hr_employment_custom` sign flows from Pass 15+ onward must use a strict employee/process-record-specific sign.request anchor pattern from the start.

## Acceptance checklist

- blocked if readiness is incomplete;
- blocked if duplicate employee is found and cannot be safely linked;
- created employee has correct source applicant traceability;
- created employee has Payroll tab contract/payroll readiness fields populated;
- bank account is native `res.partner.bank` and linked to employee;
- bank account uses `account_number`, `holder_name`, `bank_name`, branch snapshot, and `x_iban`;
- IBAN is written to `x_iban` where collected;
- IBAN is not written to `clearing_number`;
- Send Money/payment trust remains untouched;
- photo flows to `hr.employee.image_1920` when available;
- signed artifacts are visible from employee chatter/files in desktop and mobile;
- applicant moves to Contract Signed / تم توقيع العقد after final closure;
- no `hr.contract` is created;
- no payslip is generated;
- no pay run is generated;
- no work entry is generated.
