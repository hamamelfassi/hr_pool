# Pass 7 — GRC Governance Reference and Decision Engine Plan

Status: revised and locked before implementation 7A-4  
Module: `grc_backbone`  
Primary use case: recruitment board hiring decision  
Reusable scope: HR, HSE, operations, compliance, finance, contracts, and future governance workflows

## 1. Purpose

Pass 7 builds the reusable GRC foundation required before recruitment can generate and sign the Board Decision in the Contract Proposal / Preboarding stage.

This is not a recruitment-only implementation.

The recruitment board decision is the first consumer of a generic governance reference and decision engine architecture.

## 2. Revised pass doctrine

The active Pass 7 foundation is:

- Governance Reference;
- Governance Reference Relation;
- Governance Provision;
- Variable Dictionary;
- Governance Text Pattern;
- Decision Family / Type / Profile;
- Decision Template;
- Decision Instance.

The older fragmented scaffold doctrine is retired from active implementation.

## 3. Slice sequence

### 7A-4 — Unified governance library foundation

Scope:

- Add `x_grc.governance_reference_relation`.
- Add `x_grc.governance_provision`.
- Add `x_grc.governance_text_pattern`.
- Extend governance references only where needed for type/status/active/reference metadata.
- Extend decision basis lines with:
  - governance reference;
  - optional governance provision;
  - optional text pattern.
- Extend decision article lines with:
  - governance text pattern.
- Add views/actions/menus for reference relations, provisions, and text patterns.

Acceptance:

- Can create governance references.
- Can relate one governance reference to another.
- Can create a provision under a governance reference.
- Can create reusable text patterns.
- Decision basis lines can select reference/provision/pattern.
- Decision article lines can select pattern.
- No decision instance yet.
- No recruitment link yet.
- No QWeb/signing yet.

### 7A-5 — Decision template authoring UX

Scope:

Add parent-level action on decision templates:

`تحديث القالب من المحددات`

The action populates all selected child lines at once.

Basis line population:

- name from reference/pattern;
- basis type from reference type;
- relationship phrase from basis phrase;
- reference text from reference/provision/pattern;
- snapshot text from populated reference text.

Article line population:

- name from selected text pattern;
- article number if supplied;
- Arabic/English title;
- Arabic/English body;
- uses variables flag.

Variable binding population:

- name from selected global variable;
- key;
- Arabic label;
- English label;
- value type.

Placeholder validation:

- scan subject template, basis text, and article body for `{key}` placeholders;
- warn if any key is used but not bound in the Variables tab;
- do not block unless later explicitly required.

Acceptance:

- User selects references, provisions, patterns, and variables.
- User saves.
- User clicks one parent refresh action.
- Template lines become readable and populated.
- Manual override fields remain editable as snapshots.
- No per-line button needed.
- No unsafe onchange assumption.

### 7A-6 — Retire old scaffold surfaces/data

Scope:

Retire old active surfaces for early scaffolds:

- framework;
- policy;
- old provision;
- old/simple decision;
- SOP;
- old task-template and task-template-line;
- early risk/control/compliance/incident surfaces;
- early tender/contract/clause surfaces.

Task templates and task-template lines may be deleted and rebuilt later according to the improved architecture.

Implementation rule:

- remove/hide menus/actions/views first;
- neutralize or remove seed data tied to old SOP/task scaffolds;
- physically delete models/fields only if safe;
- if Odoo SaaS blocks physical deletion, defer physical deletion to a controlled cleanup pass.

Acceptance:

- GRC menus are clean.
- Old scaffold surfaces are not visible as active architecture.
- Functional taxonomy still works.
- Location taxonomy still works.
- Decision engine uses the new reference/provision/pattern/variable foundation.

### 7C — Recruitment decision template seed/setup

Scope:

Seed/setup the recruitment board hiring decision using the improved foundation.

Governance references:

- Law 23 of 2010 on commercial activity;
- company founding contract;
- articles/statute;
- founding/amendment meeting minutes;
- employee affairs regulation;
- HR office letter;
- public interest.

Variables:

- decision_number;
- decision_year;
- decision_subject_ar;
- hr_letter_date;
- hr_letter_registration;
- honorific_ar;
- employee_full_name;
- job_title;
- department;
- start_date;
- issue_date.

Text patterns:

- subject pattern where useful;
- basis line patterns where useful;
- appointment article;
- effectiveness/implementation article.

Decision template:

- profile = MCEP Board Hiring Decision;
- title = قرار مجلس الإدارة;
- subject = بشأن {decision_subject_ar};
- basis lines from governance references;
- article lines from text patterns;
- variables bound in one variables tab.

Acceptance:

- Template can be authored mostly from selections.
- No retyping of repeated basis/reference text.
- Article text comes from reusable text patterns.
- Variables are bound once in the Variables tab.
- Template is ready for instance generation.

### 7B — Decision instances

This slice intentionally comes after 7A-4/7A-5/7A-6 and 7C.

Scope:

- Add `x_grc.decision_instance`.
- Add instance basis/article/variable-value lines.
- Add instantiate-from-template action.
- Copy template snapshots into a draft instance.
- Preserve source model/source record fields for future recruitment linkage.

Acceptance:

- Can instantiate a draft decision from the recruitment board decision template.
- Instance preserves copied text snapshots.
- Instance variable values are editable.
- No PDF generation yet unless separately scoped.
- No Odoo Sign yet.
- No HR recruitment linkage yet unless later explicitly scoped.

### 7D — Documentation lock

Scope:

- Update GRC README.
- Update architecture docs if needed.
- Update current phase plan.
- Add implementation notes from 7A-4/5/6, 7C, and 7B.
- Record retired old scaffold policy.
- Record SaaS-safe parent refresh action pattern.

Acceptance:

- Code and docs agree.
- No old scaffold doctrine remains as active guidance.
- Pass 8 can begin with a stable GRC decision instance foundation.

## 4. Out of scope for Pass 7

Pass 7 does not implement:

- board decision PDF report/signature inside `hr_recruitment_custom`;
- chairman role security enforcement;
- applicant-specific variable value mapping;
- employee creation;
- employment contract generation;
- TOR generation;
- F-0007/F-0009 generation;
- full compliance/audit/control workflows.

Those belong to later passes.

## 5. Commit discipline

Each slice should be committed separately where practical.

Suggested commits:

- `pass7a4: add unified GRC reference library foundation`
- `pass7a5: add decision template authoring refresh action`
- `pass7a6: retire old GRC scaffold surfaces`
- `pass7c: seed recruitment board decision template foundation`
- `pass7b: add decision instances`
- `pass7d: lock GRC decision engine documentation`

Do not commit built module zips, exported PO files, screenshots, generated PDFs, or temporary scripts.