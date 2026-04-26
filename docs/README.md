# Docs

This folder stores project documentation and non-module implementation assets that should not be uploaded inside any Odoo SaaS module zip.

## Structure

- `architecture/`
  master architecture, integrated plans, and program strategy
- `architecture/01_module_boundary_map.md`
  concrete module ownership and bridge-domain rules
- `architecture/02_grc_recruitment_bridge_module_spec.md`
  concrete recruitment governance bridge module specification
- `architecture/03_hr_form_family_inventory.md`
  runtime ownership and form-family mapping
- `architecture/04_hr_document_generation_and_signature_workflow.md`
  document generation, PDF export, and signature routing rules
- `architecture/05_hr_native_first_decision_matrix.md`
  form-family generation/signing decision matrix
- `architecture/06_hr_native_first_workflow_playbook.md`
  native-first build sequence for documents, chatter, activities, Sign, and QWeb
- `architecture/07_native_document_schema_implementation.md`
  concrete model, field, report, and storage hooks for native HR documents
- `architecture/08_recruitment_runtime_ui_and_schema_map.md`
  corrected recruitment runtime ownership, menus, views, and document submission model
- `architecture/09_hr_job_vs_hr_applicant_gap_matrix.md`
  strict baseline-vacancy versus negotiated-runtime ownership matrix
- `architecture/10_hr_high_priority_implementation_pass.md`
  next implementation pass for the structural recruitment/runtime work
- `architecture/11_hr_medium_priority_implementation_pass.md`
  follow-on implementation pass for cleanup, translations, and usability refinements
- `modules/hr_pool/`
  HR Pool-specific documentation
- `modules/grc_backbone/`
  GRC-specific documentation
- `modules/grc_recruitment_bridge/`
  recruitment governance bridge documentation
- `resources/forms/`
  source markdown form corpus used by the recruitment bridge
- `resources/grc_recruitment_bridge/`
  generated PDFs, evidence artifacts, and bridge outputs
- `resources/n8n/`
  n8n code-node scripts and mapping helpers

Add future integration notes, field maps, webhook payload examples, and deployment notes here.
