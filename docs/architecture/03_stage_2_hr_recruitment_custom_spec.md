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

- source: Contract tab;
- template source: `grc_backbone` decision template foundation once implemented;
- signer: Chairman;
- signed decision unlocks employment contract preparation.

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
8. Pass 7 — GRC decision template foundation.
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
