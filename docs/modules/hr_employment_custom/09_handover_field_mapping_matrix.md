# Pass 13 Handover Field Mapping Matrix

## Purpose

This document is the canonical field-mapping source for the Pass 13 recruitment-to-employment handover.

Pass 13 converts a fully ready `hr.applicant` into a payroll-ready `hr.employee` and linked native `hr.contract`, while preserving traceability to:

- Stage 1 public intake / HR pool;
- Stage 2 recruitment applicant;
- signed recruitment and preboarding artifacts;
- native bank/payroll readiness records.

Pass 13 must not create payslips, attendance work entries, leave records, appraisals, custody records, or offboarding records.

---

## Handover chain

```text
x_hr.pool / Stage 1 intake
→ hr.applicant / Stage 2 recruitment
→ hr.employee / formal employee master
→ hr.contract / payroll-ready contract footprint
→ res.partner.bank / native employee bank account
```

---

## Hard guardrails

The On-board Now action must:

1. run only after `جاهزية التوظيف مكتملة`;
2. detect an existing linked employee before creating a new one;
3. detect an existing linked contract before creating a new one;
4. not silently overwrite existing employee or contract records;
5. create chatter messages on both applicant and employee;
6. copy/link signed artifacts to employee chatter/files for mobile-safe access;
7. preserve source traceability fields.

---

## Source links

Recommended fields to create/use where available:

| Target | Field | Source |
|---|---|---|
| `hr.employee` | `x_source_applicant_id` | `hr.applicant.id` |
| `hr.employee` | `x_source_pool_id` / equivalent | linked `x_hr.pool` where available |
| `hr.contract` | `x_source_applicant_id` | `hr.applicant.id` |
| `hr.contract` | `x_source_employment_contract_id` | `x_hr.applicant_employment_contract.id` |
| `hr.contract` | `x_signed_f0005_attachment_id` | signed F-0005 attachment |

If an exact source field already exists in `hr_recruitment_custom`, reuse it rather than creating a duplicate.

---

## Photo / avatar mapping

Canonical source token:

```text
hr_pool.x_profile_photo
```

Mapping:

| Stage | Field |
|---|---|
| Stage 1 | `hr_pool.x_profile_photo` / pool profile photo field |
| Stage 2 | `hr.applicant` applicant photo field, to be added if missing |
| Employment | `hr.employee.image_1920` |

Implementation doctrine:

- write the best available original candidate photo to `hr.employee.image_1920`;
- do not manually populate derivative avatar/image fields unless actual Odoo field metadata proves this is required and safe;
- document and test whether Odoo computes smaller avatar fields from `image_1920`;
- if the applicant photo is missing, do not block onboarding; post a warning chatter note.

---

## Applicant → Employee core mapping

| Target model | Target field | Source | Notes |
|---|---|---|---|
| `hr.employee` | `name` | `hr.applicant.partner_name` or applicant display name | Required |
| `hr.employee` | `image_1920` | applicant photo field | Optional but preferred |
| `hr.employee` | `work_phone` | applicant phone where suitable | Do not overwrite if manually set |
| `hr.employee` | `work_mobile` | applicant mobile/phone where suitable | Use best available phone |
| `hr.employee` | `work_email` | applicant email where suitable | Depends on whether company email exists yet |
| `hr.employee` | `department_id` | applicant/job/contract department | Prefer job/contract snapshot where reliable |
| `hr.employee` | `job_id` | `hr.applicant.job_id` | Native job link |
| `hr.employee` | `job_title` | TOR/F-0006 or job name snapshot | Use only if native field exists/writable |
| `hr.employee` | `parent_id` | department manager / job manager where safe | Do not guess if ambiguous |
| `hr.employee` | `category_ids` | tags / role category policy | Optional |
| `hr.employee` | `private_email` | applicant email | Only if field exists and policy accepts |
| `hr.employee` | `private_phone` | applicant phone | Only if field exists |
| `hr.employee` | `identification_id` / equivalent | F-0003 structured identity data | Only if validated |
| `hr.employee` | `birthday` | pool/applicant date of birth | If field exists |
| `hr.employee` | `gender` | pool/applicant gender | If field exists |
| `hr.employee` | `country_id` | nationality | If field exists |
| `hr.employee` | emergency contact fields | pool/applicant emergency/family data | If collected and validated |

Uncertain private fields must not be filled blindly. Pass 13 should map only fields confirmed by actual exported Odoo field metadata and available source data.

---

## Applicant → Employee resume/skills policy

Stage 1 already collects education, employment, skill, language, and commitment lines. The public-intake mapping docs identify these source lines and helper IDs.

Pass 13 should not bulk-create all resume/skill records unless explicitly scoped.

Default Pass 13 rule:

```text
create employee first;
preserve source traceability;
defer full hr.resume.line / hr.skill migration to the training/skills passes;
```

Exception:

- if a minimal education/certificate field is directly needed for contract/payroll readiness and is already validated, it may be mapped.

---

## Bank account mapping

The handover must create or find a full native `res.partner.bank` record.

Source candidates:

- accepted bank-information submission;
- `x_hr.applicant_employment_contract`;
- existing `x_partner_bank_id` on recruitment-side records;
- structured bank fields collected during document intake.

Required target:

```text
res.partner.bank
→ hr.employee.bank_account_ids
```

Required bank values:

| `res.partner.bank` target | Source | Notes |
|---|---|---|
| `acc_number` | collected account number or IBAN fallback | Native operational account number must be populated |
| custom `x_iban` or existing IBAN field | collected IBAN | Use existing custom IBAN field if present; otherwise create/use `x_iban` |
| `partner_id` | employee private/contact partner where safe | Must be selected carefully |
| `bank_id` | matched native bank where available | Optional if not safely matchable |
| source attachment/custom fields | bank proof attachment | Store/copy to employee chatter/files |

Doctrine:

- do not store bank data only as text fields on employee;
- do not mark payment trust automatically unless finance policy requires it;
- payroll-ready means a native bank account is linked;
- payment-ready/trusted bank status is a separate finance validation.

---

## Contract mapping

Pass 13 must create/link a native `hr.contract` record.

Recommended mapping:

| Target | Source |
|---|---|
| `employee_id` | created/linked employee |
| `job_id` | applicant job |
| `department_id` | applicant/job/contract snapshot |
| `date_start` | F-0005 contract start / applicant availability where appropriate |
| `date_end` | F-0005 contract end where present |
| `wage` | F-0005/applicant employment contract cockpit |
| `wage_type` | contract/payroll policy |
| `employee_type` | employment contract policy |
| `contract_type_id` | configured contract type |
| `structure_type_id` | configured pay category |
| `resource_calendar_id` | working schedule |
| `registration_number` / reference | employee/contract reference |
| custom source fields | applicant/F-0005 links and signed artifact |

Do not generate payslips in Pass 13.

---

## Payroll readiness

Pass 13 output should be payroll-ready, not payroll-processed.

Minimum readiness checks:

- `hr.employee` exists;
- native `hr.contract` exists and is linked to employee;
- contract has start date, wage/pay category, contract type, working schedule where required;
- employee has native bank account linked;
- signed recruitment/preboarding evidence is accessible from employee chatter/files;
- employee is not duplicated.

---

## Signed artifact handover

Copy or attach these to employee chatter/files:

- Board Decision;
- F-0005 Employment Contract;
- F-0006 Job Description;
- F-0007 Policies Declaration;
- F-0009 Non-Disclosure Agreement.

Use attachments as mobile-safe access paths. Direct `/web/content/...` action buttons are convenience controls only.

---

## Post-handover states

After successful On-board Now:

| Source | Expected state |
|---|---|
| applicant | handover/onboarded marker set |
| employee | created/linked |
| contract | draft/open according to scoped policy |
| chatter | handover summary posted |
| artifacts | visible on employee files/chatter |
| payroll | ready footprint present, no payslip processing |

---

## Duplicate prevention

Before creating records, search for:

- employee already linked to applicant;
- employee with same source applicant field;
- existing employee with same national ID / identification number where available;
- existing contract linked to employee/source applicant;
- existing bank account with same sanitized account number/IBAN and partner.

If a possible duplicate exists, block and show a clear warning rather than silently merging.

