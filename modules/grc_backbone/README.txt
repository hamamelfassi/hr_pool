GRC Backbone Starter Pack

Type
- Odoo importable XML module for Odoo.com SaaS
- No Python code, no server actions, no automations in v1

Dependencies
- base
- uom
- no HR runtime dependencies in the current reshuffled graph

Included
- 15 core GRC models
- Full internal GRC relations
- Canonical task templates:
  - task template
  - task template line
- Minimal ACLs
- Preliminary list/form/search views
- Functional area and function seed data

Notes
- Sequences are included but not auto-assigned in this starter pack.
- Compliance checks, incidents, and tenders use manual name/reference entry in v1.
- Wider operational/commercial integrations are intentionally deferred.

Install
1. Ensure base_import_module is installed on the target database.
2. Go to Apps -> Import Module and upload the zip.

Patch v9: canonical GRC only, with task templates added as a cross-domain primitive and HR bridge logic removed from the backbone layer.
