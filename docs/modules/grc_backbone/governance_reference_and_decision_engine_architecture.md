# Governance Reference and Decision Engine Architecture

Status: canonical GRC architecture doctrine for Pass 7 onward  
Module: `grc_backbone`  
Environment: Odoo.com Enterprise SaaS 19.2

## 1. Purpose

This document defines the revised GRC backbone foundation for Marsellia / MCEP.

The goal is to avoid fragmented one-model-per-document-type scaffolding and replace it with a unified, strongly typed governance architecture that can serve recruitment, HR, HSE, operations, compliance, finance, contracts, and future Odoo workflows.

## 2. Core doctrine

The canonical model split is:

- Governance Reference = authority/source.
- Governance Reference Relation = hierarchy and cross-reference between authority sources.
- Governance Provision = granular clause, article, control, requirement, or obligation.
- Governance Text Pattern = reusable wording.
- Variable = reusable data slot.
- Decision Template = controlled document assembly.
- Decision Instance = case-specific generated decision.

These concepts must not be blurred.

## 3. Governance Reference

Model:

`x_grc.governance_reference`

A governance reference is a typed authority/source record.

It may represent:

- law;
- regulation;
- framework;
- standard;
- policy;
- procedure / SOP;
- decision;
- letter / correspondence;
- memo;
- meeting minutes;
- contract;
- free text;
- other source.

The reference type must be driven by a helper model, not by separate hard models for each reference category.

Canonical helper model:

`x_grc.governance_reference_type`

The legacy selection field `x_reference_type` may remain temporarily as a migration/snapshot fallback, but normal views, filtered menus, actions, and refresh logic should use:

`x_reference_type_id → x_grc.governance_reference_type`

This replaces the earlier fragmented approach where frameworks, policies, SOPs, decisions, and provisions were started as separate unrelated scaffolds.

### Canonical reference types

The initial seeded reference types are:

| Code              | Arabic display label | English helper label              |
| ----------------- | -------------------- | --------------------------------- |
| `law`             | القوانين             | Laws                              |
| `regulation`      | اللوائح              | Regulations                       |
| `framework`       | الأطر                | Frameworks                        |
| `standard`        | المعايير             | Standards                         |
| `policy`          | السياسات             | Policies                          |
| `procedure`       | دليل إجراءات التشغيل | SOPs / Operating Procedure Manual |
| `decision`        | القرارات             | Decisions                         |
| `letter`          | مراسلة               | Correspondence / Letter           |
| `memo`            | مذكرة                | Memo                              |
| `meeting_minutes` | محضر اجتماع          | Meeting Minutes                   |
| `contract`        | العقود               | Contracts                         |
| `free_text`       | نص حر                | Free Text                         |
| `other`           | أخرى                 | Other                             |

Rules:

- `x_code` is the stable technical key.
- `x_name` is the Arabic-first translatable display label.
- `x_label_en` is the English helper label.
- Type-specific menus must filter references through `x_reference_type_id`, not through the legacy selection field.

## 4. Governance Reference Relation

Model:

`x_grc.governance_reference_relation`

Purpose: represent hierarchy and relationships between governance references.

Expected relationship types:

- implements;
- amends;
- supersedes;
- cites;
- interprets;
- depends_on;
- derived_from;
- replaces.

Examples:

- a regulation implements a law;
- a policy implements a framework;
- an SOP implements a policy;
- meeting minutes authorize a decision;
- a decision cites a policy.

Do not create separate hard models just because a reference is part of a hierarchy.

## 4A. Governance Reference Type

Model:

`x_grc.governance_reference_type`

Purpose: provide a reusable, translatable, analytics-friendly type layer for governance references.

Fields:

- `x_name` — Arabic-first translatable display label.
- `x_code` — stable technical key.
- `x_label_en` — English helper label.
- `x_sequence` — ordering.
- `x_active` — active flag.
- `x_description` — optional explanatory note.

This model exists because a selection field is too rigid for the long-term GRC control centre. A helper model enables:

- translatable Arabic-first dropdowns;
- type-filtered reference menus;
- analytics by type;
- future configuration without model refactors;
- consistent reference-type usage across references, provisions, patterns, and decisions.

Downstream usage:

- Governance References select `x_reference_type_id`.
- Governance Provisions derive their type context through their linked reference.
- Governance Text Patterns derive type context through their linked reference or provision where applicable.
- Governance Reference Relations relate typed references but do not need their own type field.
- Decision template basis-line type derivation should use `x_reference_type_id.x_code` first, with legacy `x_reference_type` only as fallback.
- Variables are independent from reference types.

Do not physically remove the legacy `x_reference_type` selection field during the first migration. Hide/de-emphasize it in UI and detach new logic from it first.

## 5. Governance Provision

Model:

`x_grc.governance_provision`

Purpose: model granular provisions under any governance reference.

A provision may represent:

- law article;
- regulation clause;
- framework control;
- standard requirement;
- policy rule;
- SOP step;
- decision article;
- compliance obligation;
- control requirement.

A provision belongs to a governance reference and may later have parent/child provision structure.

Future provision fields may include:

- code;
- Arabic title;
- English title;
- Arabic body;
- English body;
- obligation level;
- requirement/control type;
- owner function;
- evidence expectation;
- review status;
- effective date;
- active flag.

## 6. Variable Dictionary

Model:

`x_grc.variable`

Purpose: global reusable dictionary of variables used in templates and text patterns.

Examples:

- `employee_full_name`
- `job_title`
- `department`
- `start_date`
- `decision_number`
- `decision_year`
- `hr_letter_date`

Rules:

- Use English snake_case keys.
- Use `{key}` placeholders inside text.
- Do not use Arabic phrases inside braces.
- Do not put spaces inside braces.
- Define the variable once globally.
- Bind variables to templates where required.

## 7. Governance Text Pattern

Model:

`x_grc.governance_text_pattern`

Purpose: reusable wording fragments.

Pattern roles:

- subject;
- basis_line;
- article;
- footer;
- signature_block;
- general.

A pattern may optionally link to:

- decision family;
- decision type;
- decision profile;
- governance reference;
- governance provision.

Example article pattern:

`يتم تعيين {honorific_ar} / {employee_full_name} بوظيفة {job_title} بإدارة {department} اعتباراً من {start_date}.`

The pattern can contain placeholders, but it does not own the template’s variable authority. The decision template variables tab remains the required variable binding authority.

## 8. Governance family, type, and profile

The existing technical models remain:

- `x_grc.decision_family`
- `x_grc.decision_type`
- `x_grc.decision_profile`

For 7A-6 and later UI, these should be presented as:

- Governance Families
- Governance Types
- Governance Profiles / Decision Profiles where the surface is specifically decision-oriented

Reason: these models are becoming the classification spine for governed processes, not only board decisions.

Semantic usage:

- `x_grc.decision_family` = broad governance/process family such as HR, Logistics, Sales, Procurement, Finance, HSE, Operations, General Governance.
- `x_grc.decision_type` = process/type under a family, such as Recruitment Hiring, Leave, Mission, Advance, Resignation, Termination.
- `x_grc.decision_profile` = governed profile carrying default template code, reference prefix, issuer title, and later authority restrictions.

Do not physically rename the Odoo models in 7A-6. Use UI labels and documentation to generalize them while preserving technical stability.

The template selects a profile. Profile-derived family/type/code/issuer fields should be display/related fields, not separately authored fields.

## 9. Decision Template

Model:

`x_grc.decision_template`

Purpose: controlled reusable decision document assembly.

A decision template includes:

- profile;
- title;
- subject template;
- basis lines;
- article lines;
- variable bindings;
- notes/version/active state.

Basis lines should select:

- basis phrase;
- governance reference;
- optional governance provision;
- optional text pattern.

Article lines should select:

- governance text pattern;
- article number/sequence;
- title/body copied from the pattern as editable snapshots.

Variable bindings select variables from `x_grc.variable` and store template-specific required/default/source-hint information.

## 10. Decision Instance

Model planned:

`x_grc.decision_instance`

Purpose: actual case-specific generated decision.

A decision instance copies controlled snapshots from the template:

- profile/family/type;
- subject;
- basis line text;
- article line text;
- variable bindings into value rows;
- source model/res_id where connected to an operational workflow.

Instances may be edited before generation/signing, then locked later by lifecycle rules.

## 11. SaaS-safe authoring UX

Odoo.com SaaS importable XML modules cannot rely on custom Python model methods or true `@api.onchange` behavior.

Therefore child-line auto-population should use a safe parent-level action:

`تحديث القالب`

Expected behavior:

1. User selects references, provisions, patterns, and variables in child rows.
2. User saves.
3. User clicks the parent-level refresh action `تحديث القالب`.
4. Server action populates snapshots and helper fields.

The action should populate:

Basis lines:

- name;
- basis type;
- relationship phrase Arabic/English;
- reference text Arabic/English;
- snapshot text Arabic/English.

Article lines:

- article number if supplied by pattern;
- name;
- Arabic/English title;
- Arabic/English body;
- uses variables flag.

Variable bindings:

- binding name;
- key;
- Arabic label;
- English label;
- value type.

The action should later scan text placeholders and warn if a used `{key}` is not bound in the variables tab.

## 12. Retired scaffolds

The following early scaffolds are retired from the active architecture:

- old framework model;
- old policy model;
- old provision model;
- old/simple decision model;
- old SOP model;
- old task-template and task-template-line models;
- early risk/control/compliance/incident scaffolds;
- early tender/contract/clause scaffolds.

They may be physically removed, hidden, or neutralized in migration-safe order.

If Odoo SaaS blocks physical field/model deletion because views still reference them, detach them from source/UI first and delete in a later controlled cleanup.

Task templates and task-template lines may be deleted entirely and rebuilt later under the improved governance-reference/provision/control/workflow architecture.

## 13. Recruitment board decision use case

The first operational use case is the recruitment hiring board decision.

The source document contains:

- company/logo/header;
- Board Decision title;
- number/year;
- subject line;
- basis/preamble lines;
- two operative articles;
- chairman signature block;
- city and issue date.

The implementation should map this as:

- report header/layout in QWeb;
- subject template in decision template;
- preamble/basis lines from governance references;
- article lines from governance text patterns;
- variables from the template variables tab;
- actual values from a decision instance connected later to `hr.applicant`.

## 14. GRC Control Centre navigation doctrine

The `grc_backbone` module should present itself as a central Governance, Risk, and Compliance control centre.

The long-term navigation model is broader than the surfaces currently implemented. Only backed surfaces should be clickable now; future headings should be documented but not exposed as dead menus.

### Current implementable menus for 7A-6

The 7A-6 navigation should implement the currently backed surfaces:

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
    current location taxonomy views

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

Rules:

- Opening the GRC app must not land on old Frameworks.
- The safe default landing for now is Decision Templates / قوالب القرارات.
- Filtered reference menus under `القواعد الحاكمة` must use `x_reference_type_id`.
- Old framework/policy/SOP/provision/decision/task-template surfaces must not remain active competing menus.
- Functional taxonomy and location taxonomy remain active.

### Future documented menu slots

The following surfaces are documented for future implementation but should not be exposed as dead menus until they have backed models/workflows:

```text
Procedures / الإجراءات
    Procedure Templates
    Task Templates
    Task Lines / Steps

Letters / المراسلات
    Letters
    Letter Templates
    Letter Profiles

Contracts / العقود
    Contracts
    Contract Templates
    Contract Profiles

Organisational Structures / الهياكل التنظيمية
    Internal Organisational Units
    Government Organisations
    Banks and Branches
    Vendor List
    Client List

Risk
Compliance
```

Future procedures, letters, and contracts should reuse the same doctrine:

- Governance Reference for typed source/record identity.
- Governance Provision for granular clauses/requirements.
- Governance Text Pattern for reusable wording.
- Variable Dictionary for data slots.
- Profiles/Templates/Instances for recurring generated documents/processes.

## 15. Non-goals for Pass 7 foundation

Pass 7 foundation does not implement:

- full HSE compliance workflow;
- full audit/control lifecycle;
- payroll/employee handover;
- Odoo Documents governance;
- automatic onchange on child lines;
- complex graph-like reference ontology;
- automatic employee creation;
- final employment lifecycle.

Those come after the decision engine foundation is stable.

## Procedure / SOP terminology lock

For governance reference type `procedure`, use these labels consistently:

- reference type code: `procedure`
- parent/menu heading: دليل إجراءات التشغيل
- filtered view/list label: إجراءات التشغيل
- singular record label: إجراء تشغيل

Do not use دليل إجراءات التشغيل as the singular record label. It is the parent/menu heading for the SOP/procedure library surface.
