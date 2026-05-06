# Current Phase 2 Execution Plan

## 1. Purpose

This document is the current bounded execution plan for the Marsellia Stage 2 recruitment-to-employment build.

It is not a replacement for the architecture docs.

It translates the locked architecture into sequential implementation passes.

## 2. Global constraints

- Odoo SaaS 19.2 posture.
- Use importable module XML/server-action patterns where possible.
- Avoid broad rewrites.
- Use append/update patches.
- Do not rename stable XML IDs unless necessary.
- Do not build parallel recruitment apps.
- Keep native `hr.applicant` as the cockpit.
- Keep native Sign/Documents/chatter as execution/audit layers.
- Use `x_hr.recruitment_document` as the recruitment artifact lifecycle spine.
- No parallel tracks.

## 3. Locked applicant cockpit

Final operational tabs:

1. `Role and Duties`
2. `Evaluation`
3. `Documents`
4. `Declarations`
5. `Contract`

Smart button:

- `Recruitment Documents`

## 4. Locked document type universe

`x_hr.recruitment_document.x_document_type` should cover:

- `interview_evaluation` — F-0002
- `required_documents_checklist` — F-0003
- `legal_documents_validity_declaration` — F-0004
- `board_decision`
- `employment_contract`
- `tor` — F-0006
- `policies_compliance_declaration` — F-0007
- `non_disclosure_agreement` — F-0009
- `other`

## 5. Locked signature layout rule

The legacy “fixed final signature page” rule is superseded.

Use:

- fixed page-1 signature block;
- dynamic annex/detail content on page 2+ where needed.

## 6. Sequential pass plan

### Pass 0 — Documentation harmonisation

Status: current pass.

Deliverables:

- replace master architecture doc;
- replace two-stage recruitment program plan;
- replace Stage 2 spec;
- replace module README;
- create/replace current execution plan.

No code changes.

### Pass 1 — Recruitment document registry spine

Module: `hr_recruitment_custom`.

Main code changes:

- add `x_hr.recruitment_document`;
- add fields:
  - name;
  - applicant;
  - document type;
  - state;
  - generated/uploaded attachment;
  - signed attachment;
  - Sign request reference if safely available;
  - version;
  - generated/sent/signed dates;
  - responsible user;
  - source model;
  - source record ID;
  - notes.
- add applicant one2many;
- add applicant smart button;
- add list/form/search views;
- add access rights;
- wire existing TOR and interview generation to create/update registry rows without breaking current fields.

Purpose:

- create the formal artifact lifecycle spine before adding more workflows.

### Pass 2 — Applicant cockpit cleanup

Module: `hr_recruitment_custom`.

Main code changes:

- restructure applicant form around locked tabs;
- fold transitional `TOR Header` into appropriate surfaces;
- move shared applicant identity fields out of TOR-only context;
- preserve current generation buttons where possible;
- prepare placeholders for Documents, Declarations, and Contract surfaces without implementing their full workflows.

Purpose:

- prevent UI/process drift before adding more document flows.

### Pass 3 — GRC Libya location taxonomy

Module: `grc_backbone`.

Main code changes:

- add `x_grc.location`;
- fields:
  - Arabic name;
  - English name;
  - code;
  - type;
  - parent;
  - children;
  - active;
  - notes.
- location types:
  - region;
  - district;
  - city;
  - municipality;
  - locality.
- seed initial top-level Libya locations and priority testing records.

Purpose:

- provide one canonical location source for `hr_pool`, `hr.applicant`, contract, and future modules.

### Pass 4 — Stage 1 intake field uplift and initial intake simplification

Module: `hr_pool` plus Fillout/Zite/n8n.

Main code changes:

- keep the existing Stage 1 workflow stable;
- add additive fields only:
  - expanded Arabic name parts where needed;
  - gender;
  - canonical residence/location reference to `x_grc.location`;
  - derived location parents if needed;
  - minimal identity/residence fields required for Stage 2.
- simplify the initial public intake payload by removing education, employment history, skills, and languages line collection from the first application form;
- keep existing child models for backward compatibility and later enrichment;
- update Fillout/Zite payload expectations;
- update n8n mapping to stop expecting or writing credential/history/skill/language lines during initial intake;
- update handover to `hr.applicant` with the lightweight Stage 1 fields.

Purpose:

- improve Stage 1 data quality while making the first employment application shorter and easier to submit.

### Pass 5 — Evaluation stage gate

Module: `hr_recruitment_custom`.

Main code changes:

- update F-0002 QWeb/layout/questions;
- implement or update required-document checklist models;
- implement F-0003 checklist PDF generation;
- implement F-0004 QWeb/sign lifecycle;
- gate Contract Proposal on signed F-0002, F-0003, and F-0004.

Purpose:

- complete Evaluation / Interviews as a governed stage.

### Pass 6 — Required document upload flow

Module: `hr_recruitment_custom` plus Fillout/Zite/n8n.

Main code changes:

- tokenized Fillout upload URL;
- allowed checklist line scope;
- missing/rejected/resubmission document request;
- submitted document model writes;
- accept/reject/resubmission actions;
- supplemental applicant/contract data capture.

Purpose:

- make document collection controlled and repeatable.

### Pass 7 — GRC decision template foundation

Module: `grc_backbone`.

Main code changes:

- add minimal reusable decision-template models;
- seed recruitment board decision template;
- support basis/article/variable structure without building a large decision engine.

Purpose:

- make board decisions reusable across recruitment and later operations.

### Pass 8 — Contract tab and Board Decision

Module: `hr_recruitment_custom`.

Main code changes:

- add Contract tab;
- add board decision generation from GRC template;
- send/sign board decision;
- signed board decision unlocks employment contract preparation.

Purpose:

- create the internal authority gate for hiring.

### Pass 9 — Employment contract workflow

Module: `hr_recruitment_custom`.

Main code changes:

- add contract-support fields;
- manage official labor contract PDF/template/upload artifact;
- track contract through registry;
- support chairman/applicant signature lifecycle;
- generate employee ID after signed contract.

Purpose:

- handle the official legal contract as a document artifact separate from Odoo `hr.contract`.

### Pass 10 — TOR reposition and update

Module: `hr_recruitment_custom`.

Main code changes:

- update F-0006 QWeb;
- page-1 fixed signature block;
- page 2+ duties annex;
- gate generation/signing by signed employment contract;
- use generated employee ID;
- applicant + HR/recruitment manager countersign.

Purpose:

- move TOR signing to the correct preboarding position.

### Pass 11 — Final declarations

Module: `hr_recruitment_custom`.

Main code changes:

- F-0007 QWeb/sign flow;
- F-0009 QWeb/sign flow;
- applicant-only signature;
- registry tracking.

Purpose:

- complete the preboarding legal declaration package.

### Pass 12 — Onboard now handover

Module: `hr_recruitment_custom`, native HR modules.

Main code changes:

- show `Onboard now / ترحيل كموظف` only when required artifacts are signed;
- create/link `hr.employee`;
- create/link `hr.contract`;
- create/link `res.partner.bank`;
- write employee ID;
- write core employee fields;
- link signed artifact history;
- move applicant to Contract Signed after successful handover.

Purpose:

- complete recruitment-to-employment transition.

### Pass 13 — Employment lifecycle architecture

Future module/track.

Main work:

- onboarding forms;
- HSE declarations;
- training;
- assets/vehicles/company card receipt;
- time management;
- payroll administration;
- employee document lifecycle.

Purpose:

- design post-recruitment employment operations separately.

## 6.1 Future Stage 1 enrichment cleanup

After the current locked recruitment-to-employment pass sequence is complete, revisit Stage 1 enrichment.

Future work may include:

- a second prefilled Fillout/Zite enrichment form from `hr_pool`;
- controlled collection of education, employment history, credentials, languages, and skills after initial candidate submission;
- handover of education and experience data into native employee-side qualification/history structures;
- replacement of custom skills/language intake models with Odoo-native Skills where practical;
- use of native job/applicant skill matching instead of custom skill scoring.

## 7. Pass discipline

For each pass:

1. generate patch plan;
2. generate exact files/snippets;
3. manually apply to repo;
4. commit;
5. verify changed docs/code from source;
6. test in Odoo;
7. capture errors;
8. only then proceed.

## 8. Current next implementation pass after documentation

After Pass 0 is committed and verified, proceed to:

Pass 1 — Recruitment document registry spine.
