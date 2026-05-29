# HR Recruitment Custom Module Docs

This folder stores module-specific documentation for `hr_recruitment_custom`.

`hr_recruitment_custom` is the Marsellia Stage 2 extension of native Odoo Recruitment.

It should remain a thin recruitment extension, not a separate recruitment application.

## Authoritative docs

Read these first:

1. `docs/architecture/00_master_architecture_and_program_plan.md`
2. `docs/architecture/01_two_stage_recruitment_program_plan.md`
3. `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
4. `docs/resources/current_phase_execution_plan.md`
5. `pass_5e_f0003_native_sign_lifecycle_plan.md` — locked Pass 5E F-0003 checklist/PDF/native Sign lifecycle plan.
6. `native_odoo_sign_workflow_wiki.md` — reusable native Odoo Sign send/sync workflow pattern proven on F-0003.
7. `server_action_saas_patterns_wiki.md` — Odoo.com SaaS-safe server-action guard and toast patterns.
8. `fillout_required_document_submission_contract.md` — Fillout/Zite/n8n payload contract for Pass 6B/6C public required-document submissions.
9. `n8n_required_document_writeback_contract.md` — n8n writeback contract for creating Odoo required-document submission records from Fillout webhook payloads.


## Supporting docs

Supporting resource docs may explain rationale, gap analysis, old decisions, or concepts.

They are not authoritative if they conflict with the architecture docs above.

## Current Stage 2 cockpit

The final `hr.applicant` cockpit tabs are:

- `Role and Duties`
- `Evaluation`
- `Documents`
- `Declarations`
- `Contract`

The smart button `Recruitment Documents` opens the applicant-filtered lifecycle registry.

## Current lifecycle spine

The formal artifact lifecycle model is:

`x_hr.recruitment_document`

It tracks generated, uploaded, signed, cancelled, and superseded recruitment artifacts.

## Working rule

Do not implement from old discussion notes alone.

Before each code pass, use the current pass execution plan and confirm that the architecture docs still match the intended implementation.

## Server action SaaS patterns

Server actions in this module must follow the SaaS-safe guard pattern documented in:

- `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`

Key rule: do not use `raise Warning(...)` inside Odoo.com SaaS 19.2 server actions. Use `display_notification` toast guards and preserve them by avoiding unconditional reload overwrites.

## Pass 7 / Pass 8 continuity note

The recruitment Board Decision must consume the GRC decision engine. It should not be implemented as an isolated recruitment-only template structure.

`grc_backbone` owns:

- governance references;
- governance provisions;
- governance text patterns;
- variable dictionary;
- decision profiles;
- decision templates;
- decision instances.

`hr_recruitment_custom` owns:

- applicant context;
- Contract tab operational surface;
- applicant/job variable value mapping;
- PDF generation from the decision instance;
- Odoo Sign routing to the Chairman;
- recruitment document registry state for `board_decision`.

Pass 8 begins only after the GRC decision instance foundation is stable.

## Pass 8 lock — appointment decision tab and controlled GRC consumption

Pass 8 consumes the Pass 7 GRC generated-decision engine from `hr_recruitment_custom`.

### UX split

```text
hr.applicant tab: قرار التعيين
HR-specific generated-decision cockpit form
Native GRC generated-decision form
```

The applicant tab is a compact operational surface. It is not a full GRC decision editor.

### Applicant tab scope

The applicant tab contains:

- board decision status summary;
- manual instantiation fields:
  - decision number;
  - HR letter registration number;
  - HR letter date;
- readonly generated-decision and recruitment-document links;
- readonly artifact snapshots;
- filtered generated-decision row list.

Applicant-tab buttons, implemented after the shell, are:

```text
إنشاء القرار
تحديث القرار
فتح القرار
```

PDF and Sign buttons belong to the standalone cockpit form, not the applicant tab:

```text
توليد المستند
إرسال للتوقيع
مزامنة التوقيع
```

### Controlled consuming workflow

GRC remains the flexible governance authoring source.

`hr_recruitment_custom` consumes generated decisions in a controlled way:

- derived applicant/job variables are readonly;
- only decision number is required at creation/update;
- HR letter date and HR letter registration remain optional manual fields;
- basis and article lines are not edited from the recruitment cockpit;
- the PDF is rendered from structured generated-decision basis/article lines.

### Variable mapping

```text
decision_subject_ar → template default
honorific_ar        → hr.applicant.x_gender: Male = السيد, Female = السيدة
employee_full_name  → hr.applicant.partner_name
job_title           → hr.applicant.job_id.name
department          → hr.applicant.department_id.name
start_date          → hr.applicant.availability
decision_number     → manual field on قرار التعيين tab
decision_year       → derived from creation/issue date YYYY
issue_date          → derived from creation/issue date YYYY-MM-DD
hr_letter_date      → optional manual field
hr_letter_registration → optional manual field
```

### PDF and Sign ownership

The Board Decision QWeb/PDF and native Odoo Sign flow live in `hr_recruitment_custom`.

`grc_backbone` owns the generic generated-decision engine.

`hr_recruitment_custom` owns recruitment context, applicant mapping, PDF generation, recruitment document registry writeback, Chairman signing, and signed/certificate/stamped artifacts.

### Chairman signer

Initial Chairman signer source:

```text
User ID: 5
Arabic name: حسين عبد الكريم المطردي
English/exported name: Hsein Muttardi
```

Before sending, the implementation must validate that user 5 exists, has a partner, and the partner has an email.

### Stage guard

Production doctrine: Board Decision generation belongs in Contract Proposal / Preboarding.

For implementation/testing, the hard stage guard is deferred because the required variables are already available earlier.

### Non-scope for 8A/8B

8A/8B do not implement:

- decision instance creation action;
- variable population action;
- PDF generation;
- Odoo Sign send/sync;
- stamped-copy upload workflow;
- automatic sequence hardening;
- amendment/cancellation governance.

## Pass 9 lock — F-0005 Employment Contract

Date: 2026-05-23

Pass 9 adds and locks the official F-0005 employment contract workflow.

Implemented:

- `x_hr.applicant_employment_contract` contract snapshot/cockpit model.
- Applicant `العقد` tab mirror/control surface.
- Full seven-page official F-0005 QWeb overlay rendering.
- Generated draft PDF attachment.
- Manual print/sign lifecycle.
- Signed contract upload/confirmation.
- Ministry-accredited contract upload/confirmation.
- Existing `x_hr.recruitment_document` employment-contract artifact sync.
- Applicant-level preboarding gate check.

Important boundaries:

- No Odoo Sign dependency for F-0005.
- No registry schema extension in Pass 9.
- No native `hr.employee` or native `hr.contract` creation in Pass 9.
- Final preboarding gate remains blocked until Board Decision, Employment Contract, TOR/F-0006, F-0007, and F-0009 are complete.

Operational warning:

- Do not retarget selected `ir.attachment` records during lifecycle confirmation. Odoo Enterprise Documents can raise a duplicate `documents_document_attachment_unique` constraint if an attachment already has a document row.


## Pass 13 closure note

Pass 13 closes the recruitment-to-employment handover path.

Accepted handover chain:

```text
hr.applicant
→ hr.employee
→ hr.employee Payroll tab readiness fields
→ res.partner.bank
→ employee chatter/files artifact evidence
→ applicant Contract Signed / تم توقيع العقد
```

Odoo SaaS 19.2 note:

- `hr.contract` is not an available importable target model in this database;
- payroll readiness is populated on native `hr.employee` Payroll tab fields;
- bank handover uses `res.partner.bank.account_number`, `holder_name`, `bank_name`, `city`, `x_iban`, and the employee `work_contact_id` bank-domain behavior;
- no payslip, pay run, or work entry is generated by Pass 13.

