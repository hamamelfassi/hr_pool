# Retired GRC Scaffold Ignore Register

## Status

Locked in Pass 7A-6I.

This register protects the refounded GRC Backbone architecture from drift caused by old Odoo Online SaaS database metadata that cannot be safely removed through normal import-module/server-action workflows.

## Final source-of-truth position

The active GRC Backbone source of truth is now:

- Functional Taxonomy:
  - `x_grc.functional_area`
  - `x_grc.function`
- Location Taxonomy:
  - `x_grc.location`
- Decision Engine:
  - `x_grc.decision_template`
  - `x_grc.decision_basis_line`
  - `x_grc.decision_template_article_line`
  - `x_grc.decision_template_variable`
  - `x_grc.decision_family`
  - `x_grc.decision_type`
  - `x_grc.decision_profile`
  - `x_grc.decision_basis_phrase`
- Governance Reference Library:
  - `x_grc.governance_reference`
  - `x_grc.governance_reference_type`
  - `x_grc.governance_reference_relation`
  - `x_grc.governance_provision`
  - `x_grc.governance_text_pattern`
  - `x_grc.variable_dictionary`

## Retired model names

The following model names are retired and must not be reused:

- `x_grc.framework`
- `x_grc.policy`
- `x_grc.provision`
- `x_grc.decision`
- `x_grc.sop`
- `x_grc.task_template`
- `x_grc.task_template_line`
- `x_grc.risk`
- `x_grc.risk_assessment`
- `x_grc.control`
- `x_grc.compliance_check`
- `x_grc.incident`
- `x_grc.contract_template`
- `x_grc.tender`
- `x_grc.clause`

## Cleanup evidence

The Pass 7A-6 audit actions confirmed:

- retired business records: `0`
- retired module-owned business XMLIDs: `0`
- retired non-null column values: `0`
- retired field XMLIDs: `0`
- retired model XMLIDs: `0`
- retired selection XMLIDs: `0`
- retired active views/actions/access rows: cleaned or inactive

## SaaS boundary

Odoo Online SaaS import-module and server-action execution could not safely complete physical deletion of dormant `ir.model` / `ir.model.fields` schema metadata.

The hard deletion attempt failed during Odoo registry/model unlink cascades after old source fields had already been detached from the active registry.

Therefore, any remaining retired `ir.model` or `ir.model.fields` records visible only in Odoo technical metadata are to be treated as dormant database remnants.

They are not part of the active architecture.

## Rules

1. Do not reference retired model names in any active manifest-loaded XML, CSV, action, view, model, or data file.
2. Do not create new features on retired model names.
3. Do not use retired model names as bridge models, helper models, or compatibility shims.
4. Do not reintroduce old fragmented governance models for laws, policies, SOPs, risks, tenders, clauses, or old decisions.
5. Use the unified Governance Reference / Governance Provision / Governance Text Pattern / Variable Dictionary architecture instead.
6. If old retired models appear in Odoo technical metadata, ignore them unless Odoo.sh/on-prem upgrade utilities become available.
7. Physical DB schema cleanup must only be retried through a proper Odoo upgrade-script path, not through server actions.

## Future cleanup path if platform changes

If this project later moves to Odoo.sh or a controlled on-prem upgrade process, the proper cleanup path is:

- use Odoo upgrade utilities;
- remove fields and models from upgrade scripts;
- use framework-supported `remove_field()` / `remove_model()` style operations;
- test on a copy of production before applying to the live database.

## Acceptance rule

The active source is clean if:

- no active `__manifest__.py` data file references retired model names;
- no active menu/action/view exposes retired models;
- no access CSV row grants access to retired models;
- no business workflow depends on retired models.
