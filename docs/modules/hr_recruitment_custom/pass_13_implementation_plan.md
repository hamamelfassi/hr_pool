# Pass 13 — Recruitment to Employment Handover Implementation Plan

## 1. Scope boundary

Pass 13 implements the controlled handover from a fully ready `hr.applicant` into formal employment records.

Primary owner:

```text
hr_recruitment_custom
```

Reason:

```text
The On-board Now / بدء التوظيف action starts from hr.applicant and exits Stage 2 recruitment/preboarding.
```

Exception:

```text
13B may patch hr_pool if Stage 1 pool photo is not yet propagated to hr.applicant.
```

### In scope

- verify installed dependencies and target fields;
- repair photo propagation from pool to applicant if missing;
- add/confirm applicant photo field where needed;
- add applicant On-board Now / بدء التوظيف action;
- guard action using final employment readiness;
- create/link `hr.employee`;
- create/link native `hr.contract`;
- create/find native `res.partner.bank`;
- write collected IBAN to bank record where supported or add/use `x_iban`;
- link bank account to `hr.employee.bank_account_ids`;
- copy/post signed recruitment/preboarding artifacts to employee chatter/files;
- post handover summary chatter;
- prevent duplicates;
- no payroll processing.

### Out of scope

- payslip generation;
- attendance/work-entry generation;
- leave workflows;
- employee declarations;
- custody workflows;
- training workflows;
- work assignment workflows;
- appraisal workflows;
- separation and clearance workflows;
- full `hr_employment_custom` implementation.

## 2. Preconditions

Required accepted state:

- Pass 10 closed: F-0006 signed lifecycle.
- Pass 11 closed: F-0007 and F-0009 signed lifecycle.
- Pass 12 closed: final readiness gate uses signed/uploaded F-0005 rather than ministry accreditation.
- Pass 14 closed: architecture, handover doctrine, and execution controls documented.

Required applicant state:

- Board Decision complete;
- F-0005 employment contract signed and uploaded;
- F-0006 job description signed;
- F-0007 policies compliance declaration signed;
- F-0009 non-disclosure declaration signed;
- `تحديث جاهزية التوظيف` reports complete readiness.

Ministry accreditation remains tracked but is not a handover blocker.

## 3. Canonical references

Pool-to-applicant handover:

```text
docs/modules/hr_pool/03_pool_to_applicant_handover.md
```

Applicant-to-employment handover:

```text
docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md
```

Execution method template:

```text
docs/resources/pass_execution_plan_template.md
```

Employee lifecycle after handover:

```text
docs/modules/hr_employment_custom/
```

## 4. Module ownership

### Primary module

```text
modules/hr_recruitment_custom
```

Expected reason:

- applicant readiness and handover action;
- employee/contract/bank creation from applicant context;
- signed artifact handover from recruitment document rows.

### Secondary module

```text
modules/hr_pool
```

Allowed only for:

- carrying `x_hr.pool.x_profile_photo` into the applicant photo field during pool-to-applicant conversion.

### Not owner in Pass 13

```text
modules/hr_employment_custom
```

`hr_employment_custom` starts after the employee and payroll-ready contract footprint exist.

## 5. Files likely touched

Likely `hr_recruitment_custom` files:

```text
modules/hr_recruitment_custom/models/01_fields.xml
modules/hr_recruitment_custom/views/01_recruitment_views.xml
modules/hr_recruitment_custom/data/29_applicant_onboard_now_actions.xml
modules/hr_recruitment_custom/__manifest__.py
modules/hr_recruitment_custom/i18n/ar_001.po
```

Possible `hr_pool` files for 13B:

```text
modules/hr_pool/models/...
modules/hr_pool/views/...
modules/hr_pool/data/...conversion...actions.xml
```

Exact files must be confirmed in 13A preflight.

Generated files that must not be committed:

```text
dist/*.zip
generated PDFs
screenshots
temporary exports
```

## 6. Slice plan

### 13A — Preflight and dependency inspection

Goal:

- inspect current module fields/actions/views before patching;
- confirm installed technical field names for `hr.employee`, `hr.contract`, `res.partner.bank`, applicant photo, applicant source links, and bank data;
- confirm manifest dependencies.

Expected output:

- no code changes unless a documentation note is required;
- precise patch scope for 13B–13G.

Checks:

- field existence;
- XML health;
- no stale dist artifacts committed.

Odoo acceptance:

- none; repo inspection only.

### 13B — Photo handover repair: `hr_pool` → `hr.applicant`

Goal:

- ensure Stage 1 candidate photo reaches Stage 2 applicant.

Expected changes:

- add applicant photo field if missing;
- map `x_hr.pool.x_profile_photo` to applicant photo field during conversion;
- preserve original image quality for later `hr.employee.image_1920`.

Acceptance:

- new/converted applicant has photo;
- existing applicants without photo do not block handover;
- missing photo posts warning during On-board Now, not fatal blocker.

### 13C — Applicant readiness guard and On-board Now action shell

Goal:

- add `بدء التوظيف` / On-board Now action on applicant;
- enforce final readiness guard;
- prevent duplicate handover.

Expected changes:

- server action shell;
- applicant header or appropriate handover button placement;
- chatter warning/success messages;
- no employee creation yet until 13D.

Acceptance:

- blocked applicant cannot onboard;
- ready applicant reaches dry-run/shell success;
- no native HR records created in 13C.

### 13D — Create/link `hr.employee`

Goal:

- create or link native employee.

Mapping:

```text
hr.applicant.partner_name → hr.employee.name
applicant photo → hr.employee.image_1920
applicant/job department → hr.employee.department_id
hr.applicant.job_id → hr.employee.job_id
manager where safely derivable → hr.employee.parent_id
phone/email where safe → work/private contact fields
source applicant → x_source_applicant_id or equivalent
source pool → x_source_pool_id or equivalent if available
```

Acceptance:

- employee is created once;
- rerun does not duplicate;
- employee links back to applicant;
- photo appears on employee where available.

### 13E — Create/link native `hr.contract`

Goal:

- create payroll-ready native contract footprint.

Mapping:

```text
employee_id
job_id
department_id
date_start
date_end
wage
wage_type
employee_type
contract_type_id
structure_type_id
resource_calendar_id
registration_number/reference
source F-0005 cockpit record
signed F-0005 attachment
```

Acceptance:

- contract is linked to employee;
- rerun does not duplicate;
- contract has minimum payroll-readiness fields where source data exists;
- no payslip is generated.

### 13F — Create/link `res.partner.bank` + IBAN

Goal:

- create/find native bank account and link it to employee.

Rules:

```text
Applicant bank data / F-0005 cockpit / accepted bank submission
→ res.partner.bank
→ hr.employee.bank_account_ids
```

IBAN rule:

- write collected IBAN to existing IBAN custom field on `res.partner.bank`, or add/use `x_iban`;
- keep `res.partner.bank.acc_number` populated;
- do not store bank data only in text notes;
- do not auto-mark payment trust unless finance policy explicitly requires it.

Acceptance:

- `res.partner.bank` exists;
- bank account is linked to employee;
- IBAN is populated where collected;
- source bank proof is posted to employee chatter/files;
- no duplicate bank account is created for the same sanitized account/partner.

### 13G — Copy signed artifacts to employee chatter/files

Goal:

- make recruitment/preboarding evidence mobile-safe on employee.

Artifacts:

```text
Board Decision
F-0005 Employment Contract
F-0006 Job Description
F-0007 Policies Declaration
F-0009 Non-Disclosure Agreement
bank proof attachment where available
```

Acceptance:

- employee chatter/files contains signed artifacts;
- messages clearly name artifact type;
- mobile app can open files from employee chatter/files;
- direct URL buttons are not the only access path.

### 13H — Acceptance/regression lock

Goal:

- final Pass 13 verification.

Repo checks:

- XML parses;
- server-action Python compiles;
- module zip builds;
- generated zips/PDFs/screenshots not committed.

Odoo checks:

- incomplete applicant is blocked;
- ready applicant creates employee/contract/bank;
- rerun blocks or reuses safely;
- signed artifacts visible on employee;
- no payroll/payslip generated;
- no employment lifecycle workflows created.

## 7. Slice implementation log

Append implementation details here as slices are implemented.

### 13A implementation log

Pending.

### 13B implementation log

Pending.

### 13C implementation log

Pending.

### 13D implementation log

Pending.

### 13E implementation log

Pending.

### 13F implementation log

Pending.

### 13G implementation log

Pending.

### 13H implementation log

Pending.

## 8. Tracebacks and fixes

Append tracebacks and fixes here.

## 9. Lessons learned

Append lessons here.

## 10. Final acceptance gates

Pass 13 cannot close until:

- [ ] incomplete applicant blocked;
- [ ] ready applicant can run On-board Now;
- [ ] employee created/linked;
- [ ] contract created/linked;
- [ ] bank account created/found and linked to employee;
- [ ] collected IBAN written to bank account record where available;
- [ ] signed artifacts copied to employee chatter/files;
- [ ] rerun does not duplicate employee, contract, or bank account;
- [ ] no payslip generated;
- [ ] no leave/custody/training/appraisal/offboarding workflow created;
- [ ] mobile-safe artifact access checked;
- [ ] generated artifacts not committed;
- [ ] final commit and closure notes recorded.

## 11. Commit log

Pending.

## 12. Closure notes

Pending.
