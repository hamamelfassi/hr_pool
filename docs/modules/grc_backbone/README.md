# GRC Backbone Module Documentation

This folder documents the `grc_backbone` module.

`grc_backbone` is the reusable governance, reference, taxonomy, and decision-engine foundation for the Marsellia / MCEP Odoo SaaS IMS program.

It is not an operational recruitment app. It provides governed reference structures and reusable primitives that can be consumed by recruitment, HR, HSE, operations, compliance, finance, contracts, and future Odoo-native workflows.

## Current active doctrine

The active GRC doctrine is now unified and strongly typed.

### Active canonical primitives

- `x_grc.governance_reference` — typed authority/source library.
- `x_grc.governance_reference_relation` — relationship and hierarchy layer between references.
- `x_grc.governance_provision` — granular clauses, articles, controls, requirements, and obligations under a reference.
- `x_grc.variable` — global reusable variable dictionary.
- `x_grc.governance_text_pattern` — reusable wording fragments for subjects, basis lines, articles, clauses, footers, signature blocks, and general text.
- `x_grc.decision_family` — broad decision family.
- `x_grc.decision_type` — decision type under a family.
- `x_grc.decision_profile` — governed decision profile, default authority, and reference prefix.
- `x_grc.decision_template` — controlled reusable decision document assembly.
- `x_grc.decision_instance` — case-specific generated decision instance, planned after the template foundation.
- `x_grc.functional_area` — reusable functional taxonomy.
- `x_grc.function` — governed function taxonomy.
- `x_grc.location` — canonical Libya location taxonomy.

## Core semantic rule

- Governance Reference = authority/source.
- Governance Provision = granular clause, article, control, requirement, or obligation.
- Governance Text Pattern = reusable wording.
- Variable = reusable data slot.
- Decision Template = controlled document assembly.
- Decision Instance = case-specific generated decision.

## Governance reference types

`x_grc.governance_reference` covers what earlier drafts modeled as separate objects:

- laws;
- regulations;
- frameworks;
- standards;
- policies;
- procedures / SOPs;
- decisions;
- letters;
- memos;
- meeting minutes;
- free text;
- other authority/reference sources.

The type field distinguishes the reference kind. Separate hard models should not be created merely because a reference has a different category.

Hierarchy and cross-reference are modeled through `x_grc.governance_reference_relation`, not by proliferating models.

## Provisions

`x_grc.governance_provision` is the granular provision library.

It may represent:

- law articles;
- regulation clauses;
- framework clauses;
- policy rules;
- SOP steps;
- control requirements;
- compliance obligations;
- decision articles where needed.

A provision belongs to a governance reference and may later support hierarchy, owner function, obligation level, evidence expectation, and workflow/control linkage.

## Text patterns

`x_grc.governance_text_pattern` stores reusable text fragments.

Pattern roles include:

- subject;
- basis line;
- article;
- footer;
- signature block;
- general.

Patterns may contain placeholders using English snake_case keys inside braces, for example:

`{employee_full_name}`

Patterns do not own variable values. They only carry reusable wording.

## Variables

`x_grc.variable` is the global variable dictionary.

Decision templates bind required variables from the dictionary. Decision instances store actual case-specific values.

Do not create separate variable-key fields on subject, basis, or article lines. Placeholder usage should be inferred later by scanning text for `{key}` and validating that each key exists in the template variable bindings.

## Decision engine

The decision engine is built from:

- decision family;
- decision type;
- decision profile;
- decision template;
- decision basis lines;
- decision article lines;
- decision variable bindings;
- future decision instances.

The recruitment board decision is the first use case, but the engine must remain reusable for other HR, HSE, operational, financial, and compliance decisions.

## Retired / superseded scaffolds

The following early scaffolds are no longer active architecture:

- fragmented framework model;
- fragmented policy model;
- old provision model;
- old/simple decision model;
- SOP model;
- task-template and task-template-line models tied to old SOP scaffolding;
- early risk/control/compliance/incident scaffolds;
- commercial tender/contract/clause scaffolds.

These may be hidden, deleted, or left physically installed during safe migration, but they should not be used for new architecture unless deliberately reintroduced through the unified reference/provision/pattern doctrine.

Task templates and task-template lines may be deleted entirely and rebuilt later on the improved architecture.

## Location taxonomy

Pass 3 added the canonical Libya location taxonomy.

Model:

`x_grc.location`

Hierarchy:

region → district → municipality → locality

Current seeded dataset:

- Regions: 3
- Districts: 23
- Municipalities: 140
- Localities: 913
- Total: 1079

The model intentionally uses one translatable display field:

`x_name`

Arabic names are delivered through `i18n/ar_001.po`.

## Cross-module use

The active `grc_backbone` primitives are intended for:

- Stage 1 HR pool intake through functional/location taxonomy;
- Stage 2 recruitment through decision templates, document generation, and governance references;
- future employee and contract workflows;
- future HSE, operations, compliance, and audit workflows;
- future evidence/control obligations driven by governance provisions.

## Documentation authority

Architecture-level rules remain in:

- `docs/architecture/00_master_architecture_and_program_plan.md`
- `docs/architecture/01_two_stage_recruitment_program_plan.md`
- `docs/architecture/03_stage_2_hr_recruitment_custom_spec.md`
- `docs/resources/current_phase_execution_plan.md`
- `docs/modules/grc_backbone/governance_reference_and_decision_engine_architecture.md`
- `docs/modules/grc_backbone/pass_7_grc_decision_engine_plan.md`

This folder should contain module-specific notes, implementation summaries, seed-data notes, architecture decisions, and cleanup tasks.