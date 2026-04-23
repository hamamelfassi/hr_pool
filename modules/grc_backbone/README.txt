GRC Backbone Starter Pack

Type
- Odoo importable XML module for Odoo.com SaaS
- No Python code, no server actions, no automations in v1

Dependencies
- base
- uom
- hr
- hr_recruitment
- hr_pool

Included
- 15 core GRC models
- Full internal GRC relations
- Minimal HR bridges:
  - HR Pool -> Functional Area
  - Preferred Role Type -> Functional Areas
  - Recruitment Jobs -> Functional Area / Function
- Minimal ACLs
- Preliminary list/form/search views
- Functional area and function seed data

Notes
- Sequences are included but not auto-assigned in this starter pack.
- Compliance checks, incidents, and tenders use manual name/reference entry in v1.
- Wider operational/commercial integrations are intentionally deferred.

Install
1. Ensure hr_pool is already installed.
2. Ensure base_import_module is installed on the target database.
3. Go to Apps -> Import Module and upload the zip.


Patch v8: added translate=True to key reference/content fields and bundled Arabic translations in i18n/ar.po and i18n/ar_001.po.
