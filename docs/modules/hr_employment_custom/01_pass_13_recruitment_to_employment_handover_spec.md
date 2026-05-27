
# Pass 13 — Recruitment to Employment Handover Specification

## Purpose

Pass 13 creates the formal employee and contract footprint from a fully ready applicant.

It does not implement live employee lifecycle workflows such as leave, training, assignments, appraisal, separation, or clearance.

## Entry guard

The applicant must have completed employment readiness:

- Board Decision complete;
- F-0005 employment contract signed and uploaded;
- F-0006 job description signed;
- F-0007 policies compliance declaration signed;
- F-0009 non-disclosure declaration signed.

Ministry accreditation is tracked but is not a handover blocker.

## Handover action

User-facing action:

- Arabic: `بدء التوظيف`
- English working name: `On-board Now`

Guardrails:

- block unless readiness is complete;
- detect existing linked `hr.employee`;
- detect existing linked `hr.contract`;
- do not silently overwrite employee or contract records;
- post chatter on applicant and employee;
- copy/link signed recruitment artifacts to employee chatter/files.

## Pool → applicant photo repair

Pass 13 also repairs the earlier pipeline so the candidate photo flows forward:

```text
x_hr.pool.x_profile_photo
→ hr.applicant applicant photo field
→ hr.employee.image_1920
```

If `hr.applicant` has no suitable image field, add one in `hr_recruitment_custom` or `hr_employment_custom` and include it in pool-to-applicant conversion.

## Applicant → employee mapping

Minimum mapping:

- `hr.employee.name` ← `hr.applicant.partner_name`;
- `hr.employee.image_1920` ← applicant photo field;
- work phone/mobile from applicant/contact fields where available;
- job position from `hr.applicant.job_id`;
- department from job/department linkage;
- manager from job/department safe derivation where available;
- tags/categories where useful;
- source applicant link field;
- source pool link field if available.

Do not over-map uncertain private data until verified against actual exported fields.

## Applicant → contract mapping

Create a draft/native `hr.contract` linked to the employee.

Map where available:

- employee;
- job;
- department;
- start date;
- end date;
- wage;
- wage type;
- contract type;
- salary structure/pay category;
- working schedule;
- registration/reference;
- signed F-0005 attachment/source record.

## Payroll readiness

Pass 13 prepares the employee/contract for payroll but does not generate payslips.

Readiness includes:

- native employee created;
- native contract created;
- wage/salary structure/working schedule populated where available;
- bank account linked through native `res.partner.bank`;
- signed recruitment artifacts visible on employee;
- payroll readiness note/check field if implemented.

## Artifact handover

Copy/link these final recruitment artifacts to employee chatter/files:

- Board Decision;
- F-0005 signed employment contract;
- F-0006 signed job description;
- F-0007 signed policies declaration;
- F-0009 signed NDA.

Use chatter/files as the mobile-safe access path.

## Pass 13B/13D/13F canonical mapping reference

Pass 13 implementation must follow:

```text
docs/modules/hr_employment_custom/09_handover_field_mapping_matrix.md
```

Locked clarifications:

- the candidate photo source is canonically referred to as `hr_pool.x_profile_photo`;
- the employee photo target is `hr.employee.image_1920`;
- bank data must create/find a native `res.partner.bank` record;
- collected IBAN must be written to an existing IBAN custom field on `res.partner.bank`, or to `x_iban` if introduced by `hr_employment_custom`;
- `hr.employee.bank_account_ids` must link to the native bank account record;
- Pass 13 creates a payroll-ready footprint but does not create payslips;
- signed recruitment/preboarding artifacts must be copied/posted to employee chatter/files for mobile-safe access.

