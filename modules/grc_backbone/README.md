# grc_backbone

`grc_backbone` is the reusable governance, risk, compliance, taxonomy, and master-data backbone for the Marsellia / MCEP Odoo SaaS IMS program.

It is an installable Odoo Online / Odoo.com SaaS custom module. Keep this folder limited to files that belong inside the uploadable Odoo module zip.

## Current purpose

The module provides the shared governance primitives used by other custom and native Odoo workflows.

Pass 7 refounded the GRC architecture around a unified governance-reference and generated-decision engine.

Current implemented areas include:

- functional taxonomy;
- Libya geographic taxonomy;
- Governance Reference Types;
- Governance References;
- Governance Reference Relations;
- Governance Provisions;
- Governance Text Patterns;
- Variable Dictionary;
- Decision Profiles;
- Decision Templates;
- Generated Decisions / Decision Instances.

## Core doctrine

### Governance Reference

A Governance Reference is a typed authority/source record.

Examples:

- law;
- regulation;
- framework;
- policy;
- procedure / SOP;
- decision;
- letter;
- contract;
- public-interest reference.

Governance References may contain Governance Provisions and may be linked to other references through Governance Reference Relations.

### Governance Provision

A Governance Provision is a clause, article, rule, control, requirement, or obligation under a Governance Reference.

### Governance Text Pattern

A Governance Text Pattern is reusable wording used by templates and generated instances.

### Variable Dictionary

The Variable Dictionary defines reusable placeholder/data-slot vocabulary.

### Decision Profile and Decision Template

Decision Profiles and Decision Templates define reusable governed decision structures.

Templates contain:

- subject templates;
- basis/preamble lines;
- article lines;
- variable bindings.

### Generated Decision / Decision Instance

Generated Decisions are stored in:

```text
x_grc.decision_instance
```

Generated Decisions are created from Decision Templates.

The generated decision is a case-specific runtime artifact. It is not itself a Governance Reference at creation time.

A later archival/governance pass may link or promote an issued signed decision into a Governance Reference of type `decision`, but that is not part of Pass 7.

## Generated decision workflow

Current lifecycle states:

```text
draft      → مسودة
prepared   → مشروع
locked     → نافذ
cancelled  → ملغي
```

Current workflow:

```text
Decision Template
→ إنشاء نسخة قرار
→ Generated Decision
→ fill variable values
→ تحديث المعاينة
→ تجهيز القرار
→ قفل القرار
```

Variable value rows are canonical. Header fields such as decision number, decision year, and issue date are readonly snapshots written from variable rows during preview refresh.

In locked/cancelled states, the generated-decision UI is readonly as a view-level safety measure. Strict server-side immutability is deferred.

## SaaS boundary

This module targets Odoo Online / Odoo.com SaaS, not Odoo.sh.

Avoid:

- migration scripts;
- server-side Python addons;
- unsafe server-action opcodes;
- hard DB cleanup of retired `ir.model` / `ir.model.fields` records;
- using server actions as schema-deletion tools.

Server actions are used only for SaaS-safe diagnostics, refreshes, generation helpers, and controlled user-facing actions.

## Retired scaffold warning

The old fragmented scaffold was retired from active source and active UI.

Do not recreate or reuse retired model names such as:

```text
x_grc.framework
x_grc.policy
x_grc.provision
x_grc.decision
x_grc.sop
x_grc.task_template
x_grc.task_template_line
x_grc.risk
x_grc.risk_assessment
x_grc.control
x_grc.compliance_check
x_grc.incident
x_grc.contract_template
x_grc.tender
x_grc.clause
```

Dormant Odoo technical metadata may remain in the SaaS database. Treat it as ignored SaaS residue, not active architecture.

## Deferred canonical principle

Locked generated governed instances should not be silently edited, directly cancelled, or amended in-place.

Future amendment/cancellation should itself be governed by a newly generated amendment/cancellation decision or equivalent governed instance.

This principle is canonical but intentionally not implemented in Pass 7.
