# GRC Backbone Module Documentation

This folder documents the `grc_backbone` module.

`grc_backbone` is the reusable governance and master-data layer for the Marsellia / MCEP Odoo SaaS IMS program.

## Current implemented scope

The module currently supports:

- governance frameworks
- policies
- provisions / rules
- functional areas
- governed functions
- SOP/task-template structures
- risk and compliance primitives
- commercial/tender governance primitives
- Libya location taxonomy

## Location taxonomy

Pass 3 added the canonical Libya location taxonomy.

Model:

```text
x_grc.location
```

## Hierarchy:

region → district → municipality → locality

Current seeded dataset:

Type	Count
Regions	3
Districts	23
Municipalities	140
Localities	913
Total	1079

The model intentionally uses one translatable display field:

`x_name`

It does not use separate Arabic and English name fields.

Arabic names are delivered through i18n/ar_001.po.

## Translation status

Arabic translations were appended for safe non-conflicting location names and new UI labels.

### Known cleanup items:

resolve location records where the same English source name maps to different Arabic values;
verify and patch any untranslated location type/menu labels after Odoo import;
optionally regenerate a final PO cleanup block after conflict resolution.
Cross-module use

### The location taxonomy is intended to be referenced later by:

hr_pool during Stage 1 intake field uplift;
hr_recruitment_custom for applicant identity/residence/contract fields;
future employee and contract workflows;
future operational modules needing canonical Libya locations.
Documentation authority

### Architecture-level rules remain in:

docs/architecture/00_master_architecture_and_program_plan.md
docs/architecture/01_two_stage_recruitment_program_plan.md
docs/architecture/03_stage_2_hr_recruitment_custom_spec.md
docs/resources/current_phase_2_execution_plan.md

This folder should contain module-specific notes, implementation summaries, seed-data notes, and cleanup tasks only.