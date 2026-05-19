# Pass 7 — GRC Governance Reference and Decision Engine Plan

Status: revised and locked before implementation 7A-6  
Module: `grc_backbone`  
Primary use case: recruitment board hiring decision  
Reusable scope: HR, HSE, operations, compliance, finance, contracts, procedures, letters, and future governance workflows

## 1. Purpose

Pass 7 builds the reusable GRC foundation required before recruitment can generate and sign the Board Decision in the Contract Proposal / Preboarding stage.

This is not a recruitment-only implementation.

The recruitment board decision is the first consumer of a generic governance reference and decision engine architecture.

## 2. Revised pass doctrine

The active Pass 7 foundation is:

- Governance Reference;
- Governance Reference Type;
- Governance Reference Relation;
- Governance Provision;
- Variable Dictionary;
- Governance Text Pattern;
- Governance Family / Type / Profile using the existing decision-family/type/profile technical models;
- Decision Template;
- Decision Instance.

The older fragmented scaffold doctrine is retired from active implementation.

Key doctrine:

```text
Reference = authority/source
Reference Type = configurable typed classification of references
Reference Relation = relationship/hierarchy between references
Provision = granular clause/article/rule/control/obligation
Pattern = reusable wording
Variable = reusable data slot
Template = controlled assembly
Instance = case-specific generated artifact
```

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

`تحديث القالب`

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

### 7A-6 — GRC navigation refoundation and legacy scaffold retirement

7A-6 is not only a deletion pass. It is the GRC control-centre navigation and reference-type refoundation pass.

#### 7A-6A — Docs-only lock

Scope:

- Update the GRC architecture doctrine before implementation.
- Lock the governance reference type helper model.
- Lock the current vs future menu doctrine.
- Lock the retirement policy for old scaffold surfaces/data.
- Lock that physical model/field deletion is deferred unless proven safe.

Acceptance:

- Documentation and implementation plan agree before code changes.

#### 7A-6B — Governance Reference Type helper

Scope:

- Add `x_grc.governance_reference_type`.
- Add `x_reference_type_id` to `x_grc.governance_reference`.
- Seed reference types:
  - law / القوانين;
  - regulation / اللوائح;
  - framework / الأطر;
  - standard / المعايير;
  - policy / السياسات;
  - procedure / دليل إجراءات التشغيل;
  - decision / القرارات;
  - letter / مراسلة;
  - memo / مذكرة;
  - meeting_minutes / محضر اجتماع;
  - contract / العقود;
  - free_text / نص حر;
  - other / أخرى.
- Update Governance Reference views to expose `x_reference_type_id` and hide/de-emphasize legacy `x_reference_type`.
- Update template refresh logic to derive basis type from `x_reference_type_id.x_code` first, with legacy `x_reference_type` only as fallback.

Acceptance:

- New helper type model works.
- Governance Reference form/list uses helper type.
- Existing references can be classified through the helper type.
- Refresh Template still works.

#### 7A-6C — GRC control-centre navigation shell

Scope:

Implement currently backed menus only:

```text
القواعد الحاكمة
    القوانين
    اللوائح
    الأطر
    السياسات
    دليل إجراءات التشغيل

Decisions / القرارات
    القرارات
    قوالب القرارات
    نماذج القرارات

الدليل الجغرافي
    existing location taxonomy views

الإعدادات
    Functional Taxonomy
        Functional Areas
        Functions
    Governance Taxonomy
        Governance Families
        Governance Types
        Governance Reference Types
        Governance Relations
    Governance Library
        Provisions
        Patterns
        Variables
        References
```

Filtered reference menus must use `x_reference_type_id`.

Default landing rule:

- Opening GRC should land on Decision Templates / قوالب القرارات.
- It must not land on the old Frameworks list.

Future menu slots to document but not expose as dead menus yet:

- Procedures / الإجراءات;
- Letters / المراسلات;
- Contracts / العقود;
- Organisational Structures / الهياكل التنظيمية;
- Risk;
- Compliance.

#### 7A-6D — Retire old scaffold surfaces/data

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

Task templates and task-template lines may be removed/neutralized and later rebuilt under the improved reference/provision/pattern/control/workflow architecture.

Implementation rule:

- remove/hide menus/actions/views first;
- neutralize or remove seed data tied to old SOP/task scaffolds;
- do not physically delete installed `ir.model` / `ir.model.fields` in this first cleanup pass unless dependency inspection proves it safe;
- if Odoo SaaS blocks physical deletion, defer physical deletion to a controlled cleanup pass.

Acceptance:

- GRC menus are clean.
- Old scaffold surfaces are not visible as active architecture.
- Functional taxonomy still works.
- Location taxonomy still works.
- Governance Reference Type menus/filters work.
- Decision engine uses the new reference/provision/pattern/variable foundation.
- No traceback.

#### 7A-6E — Arabic translations

Scope:

Patch Arabic UI for:

- القواعد الحاكمة;
- القوانين;
- اللوائح;
- الأطر;
- السياسات;
- دليل إجراءات التشغيل;
- القرارات;
- قوالب القرارات;
- نماذج القرارات;
- الدليل الجغرافي;
- الإعدادات;
- Governance Reference Types;
- Governance Families;
- Governance Types;
- Governance Library;
- Governance Taxonomy.

#### 7A-6F — Acceptance and commit

Acceptance:

- GRC default landing is Decision Templates.
- Filtered reference menus open the correct typed reference views.
- Governance Reference uses the helper type model.
- Old framework/policy/SOP/provision/decision/task-template menus are gone or retired.
- Functional Areas, Functions, and Locations remain working.
- Refresh Template still works.
- No traceback.

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

### 7B — Generic decision instance foundation

This slice intentionally comes after 7A-4/7A-5/7A-6 and 7C.

7B implements generic decision instances in `grc_backbone`.

It does not implement recruitment-specific generation, PDF reports, Odoo Sign, chairman security, or `hr.applicant` buttons.

Doctrine:

```text
Governance Reference = authority/source
Decision Template = reusable controlled assembly
Decision Instance = case-specific generated artifact
```

Do not create `x_grc.governance_reference_instance`.

Do not store generated runtime decisions directly as `x_grc.governance_reference`.

A signed issued decision may later be linked or promoted into a Governance Reference of type `decision`, but that is a later archival/governance feature.

#### 7B-0 — Governance Reference usability polish

Scope:

- improve `x_grc.governance_reference` form usability before instance work;
- add provisions and relations tabs if technically safe;
- optionally add lightweight source attachment/source URL fields.

Allowed surfaces:

```text
البنود / الأحكام
العلاقات
المرفقات والمصدر
ملاحظات
```

Non-scope:

- no full Documents folder/tag governance;
- no Documents automation;
- no lifecycle authority through attachments;
- no chatter dependency unless explicitly scoped.

#### 7B-1 — Decision Instance models

Add:

- `x_grc.decision_instance`;
- `x_grc.decision_instance_basis_line`;
- `x_grc.decision_instance_article_line`;
- `x_grc.decision_instance_variable_value`.

#### 7B-2 — Main instance fields

Minimum fields:

- `x_name`;
- `x_template_id`;
- `x_profile_id`;
- `x_family_id`;
- `x_type_id`;
- `x_state`;
- `x_source_model`;
- `x_source_res_id`;
- `x_title_ar`;
- `x_title_en`;
- `x_subject_ar`;
- `x_subject_en`;
- `x_issue_date`;
- `x_decision_number`;
- `x_decision_year`;
- `x_rendered_text_ar`;
- `x_rendered_text_en`;
- `x_notes`;
- `x_active`.

State values:

```text
draft
prepared
locked
cancelled
```

Strict immutability is deferred.

#### 7B-3 — Instance child lines

Basis snapshot line should preserve:

- template line reference;
- sequence;
- phrase;
- reference;
- provision;
- pattern;
- copied Arabic/English snapshot text;
- rendered Arabic/English text.

Article snapshot line should preserve:

- template article line reference;
- sequence;
- article number;
- Arabic/English title;
- Arabic/English body;
- rendered Arabic/English body;
- variable usage flag.

Variable value line should preserve:

- template variable binding reference;
- variable dictionary reference;
- key;
- Arabic/English labels;
- value type;
- required flag;
- default value;
- manual value fields;
- source model/field hints;
- resolved display value.

#### 7B-4 — Actions

On `x_grc.decision_template`:

```text
إنشاء نسخة قرار
```

Expected behavior:

- create draft `x_grc.decision_instance`;
- copy profile/family/type/title/subject;
- copy basis lines as snapshots;
- copy article lines as snapshots;
- create variable-value rows from template variables;
- open the created instance.

On `x_grc.decision_instance`:

```text
تحديث من القالب
تحديث المعاينة
تجهيز القرار
قفل القرار
إلغاء القرار
```

Rules:

- refresh from template only in draft/prepared;
- preview rendering replaces `{key}` placeholders from variable-value rows;
- missing required values produce SaaS-safe display-notification toasts;
- lock is lightweight only in 7B.

#### 7B acceptance

Acceptance:

- Decision Instances menu opens.
- A draft instance can be created from the recruitment board decision template.
- Instance preserves copied template profile/family/type/title/subject.
- Instance preserves copied basis text snapshots.
- Instance preserves copied article text snapshots.
- Instance variable values are editable.
- Preview can be rendered from variable values.
- Missing required values produce a clear toast.
- No QWeb/PDF generation.
- No Odoo Sign.
- No HR recruitment linkage.
- No recruitment document registry write.


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

## Procedure / SOP terminology lock

For governance reference type `procedure`, use these labels consistently:

- reference type code: `procedure`
- parent/menu heading: دليل إجراءات التشغيل
- filtered view/list label: إجراءات التشغيل
- singular record label: إجراء تشغيل

Do not use دليل إجراءات التشغيل as the singular record label. It is the parent/menu heading for the SOP/procedure library surface.

## Pass 7D lock status

Pass 7 is now implementation-complete pending final acceptance.

### Completed

7A completed the GRC refoundation and retired the old fragmented scaffold from active source/UI.

7C completed manual/user-assisted recruitment board decision template seeding.

7B completed the generic generated-decision foundation.

### 7B locked runtime

Implemented:

- `x_grc.decision_instance`;
- `x_grc.decision_instance_basis_line`;
- `x_grc.decision_instance_article_line`;
- `x_grc.decision_instance_variable_value`;
- generated decisions menu under `القرارات` as `القرارات المولدة`;
- `إنشاء نسخة قرار` from Decision Template;
- variable-value rows as canonical values;
- header metadata as readonly snapshots;
- `تحديث المعاينة`;
- lifecycle actions:
  - `تجهيز القرار`;
  - `قفل القرار`;
  - `إلغاء القرار`;
- Arabic lifecycle labels:
  - Draft → مسودة;
  - Prepared → مشروع;
  - Locked → نافذ;
  - Cancelled → ملغي;
- view-level readonly behavior for locked/cancelled generated decisions.

### Deferred from Pass 7

Not implemented in Pass 7:

- QWeb/PDF generation;
- Odoo Sign integration;
- recruitment applicant binding;
- chairman-only security gates;
- hard server-side immutability;
- generated-document registry writeback;
- governed amendment/cancellation flow;
- direct physical DB deletion of retired SaaS metadata remnants.

### Amendment/cancellation canonical principle

Locked generated governed instances should not be silently edited, directly cancelled, or amended in-place.

Future amendment/cancellation should be governed by a newly generated amendment/cancellation decision or equivalent governed instance.

This is a canonical principle for future governance architecture, but it is not added to the current 14-pass implementation plan unless explicitly scoped later.

### Final 7D acceptance

Pass 7 closes when:

- module upgrades cleanly;
- GRC opens on decision templates;
- generated decisions menu opens;
- recruitment hiring decision template remains usable;
- generated decisions instantiate from template;
- preview refresh works from variable rows;
- lifecycle transitions work;
- locked/cancelled generated decisions are readonly in UI;
- retired scaffold sanity check passes;
- docs are committed.

