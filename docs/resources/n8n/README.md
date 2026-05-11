# n8n Code Module Sources

This folder stores the source-controlled JavaScript used inside n8n Code nodes for the MCEP/Marsellia Odoo IMS integrations.

n8n remains the runtime. These files are the human-readable/versioned source modules copied into n8n Code nodes.

## Rules

1. One n8n Code node = one `.js` source file where practical.
2. File names should identify the workflow and the code-node responsibility.
3. Do not store secrets, API keys, tokens, or production credentials in these files.
4. Odoo IDs and Fillout/Zite payload contracts should be documented in adjacent markdown files, not hardcoded unless they are stable public form/schema constants.
5. Code must return plain JSON-compatible objects for downstream n8n nodes.
6. Each code module should include a short header comment describing:
   - workflow;
   - input shape;
   - output shape;
   - related contract document.

## Required document writeback modules

Pass 6C modules will use the prefix:

```text
required_document_writeback_
```

## Planned modules:

```
required_document_writeback_parse_payload.js
required_document_writeback_validate_envelope.js
required_document_writeback_normalize_sections.js
required_document_writeback_build_odoo_payloads.js
required_document_writeback_summarize_result.js
```

Primary contract:

`docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md`