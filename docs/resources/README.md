# Resources

Supporting assets that belong in the repository but not in the Odoo module upload archive.

Resources are context, payloads, exports, integration scripts, and historical analysis. They are not shipped inside module zips.

## Authority rule

Use this hierarchy:

1. Current repo code and installed behavior.
2. Current pass execution plan.
3. Locked module docs:
   - `docs/modules/hr_recruitment_custom/report_generation_wiki.md`
   - `docs/modules/hr_recruitment_custom/pass_5e_f0003_native_sign_lifecycle_plan.md`
   - `docs/modules/hr_recruitment_custom/native_odoo_sign_workflow_wiki.md`
4. Architecture and stage specs.
5. Resource/gap-analysis documents.

Older resource docs may contain historical assumptions. If they conflict with current repo code or locked module docs, treat them as historical.

## Suggested structure

- `current_phase_execution_plan.md`
  current bounded execution plan

- `archive/`
  stale execution plans and superseded analysis

- `n8n/`
  workflow code and payload-mapping scripts

- `payload_samples/`
  Fillout/Zite/n8n example payloads and webhook samples

- `sign_discovery/`
  Sign schema exports, payload observations, screenshots, and records used for discovery

- `hr_pool/`
  generated HR Pool artifacts that should not ship with the module

- `grc_backbone/`
  generated GRC artifacts that should not ship with the module

- `hr_recruitment_custom/`
  generated recruitment artifacts, examples, and non-module exports