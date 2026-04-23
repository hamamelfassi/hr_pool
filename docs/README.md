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
- `modules/hr_pool/`
  HR Pool-specific documentation
- `modules/grc_backbone/`
  GRC-specific documentation
- `modules/grc_recruitment_bridge/`
  recruitment governance bridge documentation
- `resources/n8n/`
  n8n code-node scripts and mapping helpers

Add future integration notes, field maps, webhook payload examples, and deployment notes here.
