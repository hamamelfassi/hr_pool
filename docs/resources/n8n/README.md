# n8n Code Module Sources

This folder stores source-controlled JavaScript used inside n8n Code nodes for the MCEP/Marsellia Odoo IMS integrations.

n8n remains the runtime. These files are the human-readable/versioned source modules copied into n8n Code nodes.

## Folder Structure

Each n8n workflow must have its own subdirectory.

Current workflow folders:

```text
marsellia_recruitment_required_document_submission/
```

## Each workflow folder must contain:

README.md
*.js source files for Code nodes
optional *.md node notes/specs
optional sample payloads, with secrets removed

## Rules

1. One n8n Code node = one .js source file where practical.
2. Use JavaScript for n8n Code nodes unless there is a strong reason not to.
3. File names should identify the workflow and the code-node responsibility.
4. Do not store secrets, API keys, tokens, webhook URLs, or production credentials in these files.
5. Odoo IDs and Fillout/Zite payload contracts should be documented in adjacent markdown files, not hardcoded unless they are stable public form/schema constants.
6. Code must return plain JSON-compatible objects for downstream n8n nodes.
7. Each code module should include a short header comment describing:
    * workflow;
    * node name;
    * input shape;
    * output shape;
    * related contract document.
8. Each workflow subdirectory README should define:
    * workflow purpose;
    * node sequence;
    * source file mapped to each Code node;
    * implementation status;
    * manual test checklist.

## Current Workflow

**Marsellia Recruitment Required Document Submission**

Folder:

`docs/resources/n8n/marsellia_recruitment_required_document_submission/`

Primary contract:

`docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md`

Planned Code modules:

```
required_document_writeback_parse_payload.js
required_document_writeback_validate_envelope.js
required_document_writeback_normalize_sections.js
required_document_writeback_build_odoo_payloads.js
required_document_writeback_summarize_result.js
```