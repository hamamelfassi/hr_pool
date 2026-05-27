# Stage 2 Spec: `hr_recruitment_custom`

## 1. Purpose

`hr_recruitment_custom` is the Marsellia Stage 2 extension of native Odoo Recruitment.

It connects the Stage 1 candidate pool to the formal `hr.applicant` lifecycle and manages Marsellia-specific recruitment documents, signature gates, contract/preboarding data, and final handover to employment.

The module must remain a thin extension of native Odoo workflows, not a parallel recruitment application.

## 2. Module scope

This module should:

- remain `application = False`;
- avoid a separate recruitment dashboard/app;
- inherit native `hr.job` and `hr.applicant` views;
- keep applicant operations inside the native applicant form;
- use native chatter, activities, attachments, Documents, and Sign;
- use QWeb only where Marsellia forms require controlled Arabic PDF generation;
- add only missing fields, models, lifecycle registry, and safe automation.

## 3. Ownership split

### 3.1 `hr.job`

`hr.job` owns vacancy-level and baseline role configuration.

It owns:

- baseline department;
- baseline functional area;
- baseline governed functions;
- baseline job-description / duty composition;
- vacancy recruitment configuration.

### 3.2 `hr.applicant`

`hr.applicant` is the Stage 2 cockpit and applicant runtime source.

It owns or exposes:

- backlink to originating pool record;
- applicant core identity fields;
- applicant contact fields;
- applicant location/residence fields;
- negotiated role/duty authoring;
- interview/evaluation workflow;
- document checklist workflow;
- declaration workflow;
- contract/preboarding fields;
- board decision surface;
- employment contract artifact surface;
- handover readiness;
- link to created employee after onboarding.

### 3.3 `x_hr.recruitment_document`

`x_hr.recruitment_document` is the formal artifact lifecycle registry.

It owns:

- generated/uploaded artifact reference;
- signed artifact reference;
- document type;
- state;
- version;
- source model and source record;
- signer lifecycle references where implemented;
- generated/sent/signed dates;
- gate status for stage progression.

It is not an operational checklist and not a replacement for Odoo Sign.

### 3.4 Native HR handover models

Final handover creates or links:

- `hr.employee`;
- `hr.contract`;
- payroll-relevant fields;
- `res.partner.bank`;
- signed document history.

The official labor contract PDF and Odoo `hr.contract` are related but distinct.

## 4. Stage 2 lifecycle

### 4.1 Qualification

Triggered by Stage 1 conversion from `hr_pool`.

Actions:

- create/link native `hr.applicant`;
- link selected `hr.job`;
- copy applicant core fields from pool;
- set stage to Qualification / Initial Qualification;
- preserve pool backlink.

No forms are generated in this stage.

### 4.2 Evaluation / Interviews

Triggered by creating the first interview evaluation or moving the applicant into interview stage.

Required signed artifacts:

1. F-0002 Interview Evaluation;
2. F-0003 Required Documents Checklist;
3. F-0004 Legal Documents Validity Declaration.

Completion of these artifacts unlocks Contract Proposal / Preboarding.

### 4.3 Preboarding / Contract Proposal

This is the formal contract package stage.

Required sequence:

1. Board Decision signed by Chairman;
2. Employment Contract signed by Chairman and applicant;
3. TOR / Role and Duties F-0006 signed by applicant and HR/recruitment manager;
4. F-0007 Policies Compliance Declaration signed by applicant;
5. F-0009 Non-Disclosure Agreement signed by applicant.

Completion of these artifacts unlocks `Onboard now / ترحيل كموظف`.

### 4.4 Contract Signed / Handover Complete

The `Onboard now` action creates and links employment records.

After successful handover, the applicant moves to Contract Signed.

## 5. Applicant tab framework

The final `hr.applicant` operational tabs are locked as follows.

### 5.1 `Role and Duties`

Purpose:

- TOR authoring;
- negotiated duty/function composition;
- duty lines inherited from linked `hr.job` where available;
- manual adjustment of applicant-specific duties;
- TOR generation entry point when contract prerequisites are met;
- TOR document lifecycle summary.

Shared applicant identity and contract fields should not live only inside this tab.

TOR-specific printable fields may remain here only when they are truly TOR-specific.

### 5.2 `Evaluation`

Purpose:

- interview records;
- interviewer provenance;
- scoring;
- recommendation;
- F-0002 PDF generation;
- interviewer signature workflow;
- evaluation document state summary.

### 5.3 `Documents`

Purpose:

- required document checklist control;
- F-0003 checklist readiness validation;
- F-0003 PDF generation;
- F-0003 native Odoo Sign send/sync lifecycle;
- checklist lifecycle summary.

The checklist is the control sheet. It is not the submitted-document evidence store.

The signed checklist PDF is a registry artifact.

### 5.4 `Submissions`

Purpose:

- candidate-submitted required-document evidence;
- manual/internal submission creation during Pass 6A;
- later tokenized Fillout/n8n writeback during Pass 6B;
- accept/reject/resubmission workflow;
- latest accepted artifact per required document type;
- submission audit trail.

Accepted submissions update the relevant F-0003 checklist lines.

Rejected submissions remain in the audit trail and do not overwrite earlier submissions.

### 5.4.1 Documents governance deferral

Odoo Documents may centralize and surface attachments created from applicant chatter, recruitment records, and Sign requests.

For the current recruitment-to-employment build, Odoo Documents is a filing/navigation layer only. It is not the lifecycle authority for Evaluation, Contract Proposal, or handover gates.

The authoritative lifecycle source remains:

`x_hr.recruitment_document`

The operational evidence source remains:

`x_hr.applicant_required_document_submission`

Full Odoo Documents governance is deferred until after the complete recruitment-to-employment cycle is implemented. That later governance pass may define folder policy, tag policy, access classes, retention, employee-file migration, and Documents automation.

Until that pass, the recruitment module should not depend on custom Documents folder/tag automation for core workflow correctness.

### 5.5 `Declarations`

Purpose:

- F-0004 Legal Documents Validity Declaration;
- F-0007 Policies Compliance Declaration;
- F-0009 Non-Disclosure Agreement.

These are generated with QWeb and tracked in the recruitment document registry.

### 5.6 `Contract`

Purpose:

- board decision;
- employment contract preparation;
- contract-support fields;
- official labor contract PDF/template artifact;
- employee ID generation after signed contract;
- downstream `hr.employee` / `hr.contract` / payroll-relevant handover readiness.

### 5.7 Smart button: `Recruitment Documents`

Purpose:

- open filtered `x_hr.recruitment_document` records for the current applicant;
- show all formal generated/uploaded/signed/superseded artifacts;
- act as the registry dashboard.

It should open list/form first. Kanban can come later.

## 6. Transitional UI rule

The current `TOR Header` tab is transitional.

It was useful for proving QWeb generation and manual snapshot fields, but it is not a final architectural surface.

It should be folded into the locked applicant cockpit during the applicant cockpit cleanup pass.

## 7. Source-of-truth hierarchy

Use three data layers.

### 7.1 Core applicant fields

Reusable fields that multiple documents and handover need.

Examples:

- Arabic name parts;
- date of birth;
- gender;
- marital status;
- nationality;
- national ID;
- phone;
- email;
- canonical residence/location;
- selected PII document;
- bank information;
- academic qualification;
- specialization;
- next of kin basics.

These should be stored on `hr.applicant` or linked applicant-specific helper models, not buried inside one document tab.

### 7.2 Operational source records

Each operational tab may have source records.

Examples:

- interview record;
- document checklist;
- submitted document;
- declaration source;
- board decision source;
- contract/preboarding data.

### 7.3 Printable snapshot fields

QWeb reports should render from stable stored values.

When a report depends on linked data, generation actions should snapshot the printable value before rendering.

This preserves stable PDFs and avoids fragile live joins.

## 8. Recruitment document registry model target

Target model:

`x_hr.recruitment_document`

Minimum fields:

- `x_name`
- `x_applicant_id`
- `x_document_type`
- `x_state`
- `x_generated_attachment_id`
- `x_signed_attachment_id`
- `x_sign_request_id` if safely available
- `x_version`
- `x_generated_on`
- `x_sent_on`
- `x_signed_on`
- `x_responsible_user_id`
- `x_source_model`
- `x_source_res_id`
- `x_notes`

Document type values:

- `interview_evaluation`
- `required_documents_checklist`
- `legal_documents_validity_declaration`
- `board_decision`
- `employment_contract`
- `tor`
- `policies_compliance_declaration`
- `non_disclosure_agreement`
- `other`

State values:

- `draft`
- `generated`
- `signature_requested`
- `partially_signed`
- `signed`
- `cancelled`
- `superseded`

Version rule:

- each fresh generation may supersede a previous artifact or increment the active record version depending on the safest current implementation pattern;
- the chosen behavior must be consistent per document type and documented in the implementation summary.

### 8.1 Evaluation band and Contract Proposal / Preboarding semantics

The Odoo recruitment stages are retained as native lifecycle containers.

The system does not replace Odoo’s native recruitment stage model.

**The Evaluation band consists of:**

- Qualification / التأهيل;
- First Interview / المقابلة الأولى;
- Second Interview / المقابلة الثانية.

Within this band, reviewers may move applicants according to operational needs.

The authoritative documentary control is not the visual stage. It is the recruitment document registry.

The Evaluation gate moves the applicant to Odoo’s Contract Proposal stage only when the registry proves that these artifacts are signed:

F-0002 Interview Evaluation;
F-0003 Required Documents Checklist;
F-0004 Legal Documents Validity Declaration.

For this implementation, Contract Proposal is also treated as Preboarding.

**Contract Proposal / Preboarding is the flexible operating stage for:**

board decision;
official employment contract;
TOR / F-0006;
F-0007;
F-0009.

The registry allows flexible ordering inside this stage while preserving authority through internal gates.

Chairman-controlled board decision signing is an internal control gate.

Final movement from Contract Proposal to Contract Signed is a later gate requiring signed completion of the downstream preboarding artifacts.

## 9. Generated form strategy

### 9.1 QWeb-generated forms

Use QWeb for:

- F-0002 Interview Evaluation;
- F-0003 Required Documents Checklist;
- F-0004 Legal Documents Validity Declaration;
- Board Decision, using GRC decision-template source data when available;
- F-0006 TOR / Role and Duties;
- F-0007 Policies Compliance Declaration;
- F-0009 Non-Disclosure Agreement.

QWeb forms should preserve the successful established pattern:

- stored snapshot fields;
- explicit normalization before rendering;
- Arabic-first layout;
- Google Al Yamama Arabic font where configured;
- embedded or reliable static logo/font handling;
- inline report CSS where needed;
- fixed page-1 signature geometry;
- dynamic annex/detail content on page 2+ where needed.

### 9.2 Static/uploaded PDF artifact

The official labor contract is not QWeb-generated.

It is handled as a static PDF/template/uploaded artifact and tracked through the registry.

The Contract tab stores and prepares the values needed for:

- filling the official labor contract;
- signing;
- employee ID generation;
- `hr.employee` / `hr.contract` handover.

## 10. Evaluation stage documents

### 10.1 F-0002 Interview Evaluation

- source: Evaluation tab / interview record;
- signer: interviewer only;
- applicant does not sign;
- should be one page if possible with fixed bottom signature block;
- updated/simplified question set comes from the current source form.

### 10.2 F-0003 Required Documents Checklist

- source: Documents tab / checklist model;
- generated only after required checklist lines are accepted;
- signer: HR/recruitment manager or authorized manager;
- required document types must be defined by the source F-0003 form, not vague “etc.” language.

### 10.3 F-0004 Legal Documents Validity Declaration

- source: Declarations tab;
- generated as a single-page QWeb form with fixed signature geometry;
- tracked through `x_hr.recruitment_document` as `legal_documents_validity_declaration`;
- belongs to the Evaluation / Interviews gate;
- declares legal validity of submitted documents and applicant responsibility for false, forged, altered, or misleading documents;
- includes HR/recruitment review fields where required by the source form.

Current implementation note:

- Pass 6F closes F-0004 using the proven one-signer native Odoo Sign flow, with the applicant as signer.
- HR/recruitment review/countersignature can remain stored and printed in the source form.
- Promotion to a true two-signer native Sign workflow is deferred unless explicitly re-scoped before implementation.

## 11. Preboarding documents

### 11.1 Board Decision

The Board Decision is not owned structurally by `hr_recruitment_custom`.

Recruitment consumes the `grc_backbone` decision engine:

- decision profile from `x_grc.decision_profile`;
- decision template from `x_grc.decision_template`;
- case-specific decision instance from `x_grc.decision_instance`;
- governance references, provisions, text patterns, and variables from the GRC backbone;
- signed artifact tracked in `x_hr.recruitment_document` as `board_decision`.

Recruitment owns the operational applicant context and registry linkage. GRC owns the reusable decision doctrine.

The target chairman workflow is:

1. open the applicant in Contract Proposal / Preboarding;
2. instantiate the recruitment board decision from the locked GRC template;
3. generate the decision PDF;
4. chairman signs through Odoo Sign;
5. the signed decision closes the registry artifact and unlocks employment contract preparation.

Signer: Chairman.

Signed decision unlocks employment contract preparation, but does not itself create the employment contract.


### 11.1.1 GRC decision engine dependency

The recruitment board decision must be generated from the unified GRC decision engine, not from ad-hoc recruitment-only fields.

The GRC layer provides:

- Governance Reference = authority/source;
- Governance Provision = granular clause, article, control, requirement, or obligation;
- Governance Text Pattern = reusable wording;
- Variable Dictionary = reusable data slots;
- Decision Template = controlled reusable assembly;
- Decision Instance = case-specific generated decision.

Recruitment may supply applicant/job values into the decision instance variable values, but it should not redefine the decision template architecture.

### 11.2 Employment Contract

- source: Contract tab;
- artifact type: official labor contract PDF/template/upload;
- signers: Chairman and applicant;
- signed contract generates employee ID;
- signed contract unlocks TOR generation/signing.

### 11.3 TOR / F-0006

- source: Role and Duties tab;
- authored from governed job functions and applicant-negotiated duty lines;
- generation/signing gated by signed employment contract;
- signers: applicant and HR/recruitment manager;
- page 1 fixed signature block;
- page 2+ duties annex;
- uses generated employee ID.

### 11.4 F-0007 Policies Compliance Declaration

- source: Declarations tab;
- QWeb-generated;
- signer: applicant.

### 11.5 F-0009 Non-Disclosure Agreement

- source: Declarations tab;
- QWeb-generated;
- signer: applicant.

## 12. Required documents workflow

The required documents workflow should use:

- `x_hr.recruitment_required_document_type`;
- `x_hr.applicant_required_document_checklist`;
- `x_hr.applicant_required_document_line`;
- `x_hr.applicant_required_document_submission` (Pass 6A target).

The checklist controls readiness and PDF/signature lifecycle.

The submission model stores evidence files and review outcomes.

The Fillout upload URL should be tokenized. Raw applicant/checklist IDs are not trusted as authority.

New submision uploads never overwrite previous uploads.

Rejected or superseded submissions remain part of the audit trail.

### 12.1 Required-document evidence and Documents app boundary

The F-0003 checklist controls readiness and the signed checklist artifact.

The Submissions model stores evidence and review outcomes.

Odoo Documents may display, centralize, and search related attachments, but it does not determine whether a checklist line is accepted, whether F-0003 is ready, or whether the Evaluation gate is complete.

The Evaluation gate must read registry state, not Documents folders, tags, or search results.

## 13. Location taxonomy dependency

Libya location hierarchy belongs in `grc_backbone`, not `hr_pool` or `hr_recruitment_custom`.

`hr_pool` and `hr.applicant` should reference the canonical location model.

Hierarchy:

- region;
- district;
- city;
- municipality;
- locality.

Stage 1 may ask for the narrowest practical value, then derive parents.

## 14. Stage 1 field uplift dependency

Stage 1 workflow remains stable.

Only additive fields and mapping are added where later Stage 2 needs them.

Examples:

- expanded Arabic name parts;
- gender;
- location reference;
- municipality/city/district/region;
- identity/residence fields needed for contract handover.

## 15. Employment handover target

`Onboard now / ترحيل كموظف` appears only after required recruitment documents are signed.

The action should:

- create/link `hr.employee`;
- link applicant to employee;
- create/link `hr.contract`;
- write payroll-relevant values;
- create/link `res.partner.bank`;
- write employee ID;
- transfer core applicant data;
- link signed artifact history.

Detailed employment lifecycle after handover is a separate future architecture track.

## 16. Locked sequential implementation order

1. Pass 0 — Documentation harmonisation.
2. Pass 1 — Recruitment document registry spine.
3. Pass 2 — Applicant cockpit cleanup.
4. Pass 3 — GRC Libya location taxonomy.
5. Pass 4 — Stage 1 intake field uplift.
6. Pass 5 — Evaluation stage gate.
7. Pass 6 — Required document upload flow.
8. Pass 7 — GRC governance reference and decision engine foundation.
9. Pass 8 — Contract tab and Board Decision.
10. Pass 9 — Employment contract workflow.
11. Pass 10 — TOR reposition and update.
12. Pass 11 — Final declarations.
13. Pass 12 — Onboard now handover.
14. Pass 13 — Employment lifecycle architecture.

## 17. Current pass constraints

Until the relevant pass is reached:

- do not redesign Stage 1 workflow;
- do not build document checklist before the registry and cockpit are stable;
- do not build GRC decision templates before the location/intake prerequisites are handled;
- do not build employment handover before all recruitment gates are stable;
- do not merge declarations into Documents tab;
- do not restore the old final-signature-page doctrine.

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

## Pass 9 lock addendum — F-0005 official employment contract

Date: 2026-05-23

This addendum supersedes any earlier wording that treated the official labor contract as only a static uploaded artifact.

### Locked F-0005 implementation

The official labor contract `MCEP-HR-F-0005` is implemented as a controlled QWeb overlay using official page-image backgrounds.

The implementation does not recreate the government template text. It uses the official pages as immutable visual backgrounds and overlays only applicant/company/contract values from a frozen contract snapshot.

Primary model:

```text
x_hr.applicant_employment_contract
```

Primary applicant surface:

```text
hr.applicant / العقد
```

Primary detailed cockpit:

```text
x_hr.applicant_employment_contract
```

### Contract snapshot doctrine

F-0005 renders from stored snapshot fields, not fragile live joins.

Snapshot sources include:

- `hr.applicant`
- linked `hr_pool` candidate
- linked `x_hr.pool_conversion_request`
- accepted required-document submissions
- `grc_backbone` location hierarchy
- fixed Marsellia company defaults
- manual contract snapshot fields

### Manual lifecycle doctrine

F-0005 does not use Odoo Sign by default.

The accepted lifecycle is:

```text
مسودة بيانات
→ جاهز للتوليد
→ مسودة مولدة
→ مطبوع / قيد التوقيع اليدوي
→ موقع ومرفوع
→ معتمد من وزارة العمل
```

The signed and ministry-accredited copies are uploaded/selected as controlled attachments and linked through the contract cockpit, applicant files/chatter, and existing recruitment document registry fields.

### Odoo Documents attachment rule

Do not retarget existing signed/ministry `ir.attachment` records by rewriting `res_model` / `res_id`.

Odoo Enterprise Documents may already have a `documents.document` row for the attachment. Retargeting can attempt to create a duplicate document for the same attachment and violate the `documents_document_attachment_unique` constraint.

### Recruitment document registry boundary

Pass 9 consumes the existing `x_hr.recruitment_document` registry.

It does not add new registry fields or new registry states.

For F-0005, the registry tracks the generated and signed employment contract artifact using existing fields.

Ministry accreditation is stored on the contract cockpit and applicant mirror fields, and may be referenced in registry notes without changing the registry schema.

### Final preboarding gate doctrine

The official employment contract is required but not sufficient for final handover.

The final preboarding gate requires:

1. Board Decision
2. Employment Contract / F-0005
3. TOR / F-0006
4. F-0007 Policies Compliance Declaration
5. F-0009 Non-Disclosure Agreement

Until all five are complete, the applicant-level preboarding gate remains blocked.

### Native HR handover deferral

Pass 9 does not create:

- `hr.employee`
- native Odoo `hr.contract`
- payroll records
- bank records
- timesheet records

Native handover remains a later pass after the preboarding package is complete.


## Boundary with employment lifecycle

`hr_recruitment_custom` owns Stage 2 recruitment/preboarding up to employment readiness and On-board Now handover eligibility.

It does not own the full employee lifecycle.

The downstream module `hr_employment_custom` owns:

- `hr.employee` creation/linkage;
- `hr.contract` creation/linkage;
- bank/payroll readiness;
- employee declarations;
- custody;
- training;
- leave overlays;
- permissions;
- assignments;
- appraisals;
- separation;
- clearance/offboarding.

Stage 2 recruitment remains the source of signed recruitment artifacts, while `hr_employment_custom` copies the final artifact history to the employee record during handover.
