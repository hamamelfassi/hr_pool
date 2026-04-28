# Stage 1 Spec: `hr_pool`

## 1. Purpose

`hr_pool` is the governed intake layer for public and manual candidate capture.

It exists to normalize candidate data before conversion into Odoo Recruitment.

## 2. Ownership

`hr_pool` owns:

- intake records in `x_hr.pool`
- child line records for education, employment, skills, languages, and commitments
- helper taxonomy tables for commitment types, preferred roles, skill types, proficiency levels, and languages
- chairman/reviewer workflow on the intake record
- intake snapshot reporting

It does not own the native applicant lifecycle.

## 3. Workflow

The current stage 1 lifecycle is:

1. `prescreening`
2. `pooling`
3. `conversion`
4. `converted`

The intended behavior is:

- intake starts in `prescreening`
- chairman can approve, hold, or reject
- once ready, a conversion request is prepared for stage 2
- after approval, the intake record is marked converted and linked back to a native applicant

## 4. Conversion request handoff

The stage 1 handoff uses a dedicated child model, not just button-only state changes on the intake record.

Recommended child model:

- `x_hr.pool_conversion_request`

Recommended fields:

- `x_name`
- `x_pool_id`
- `x_job_id`
- `x_state`
- `x_notes`
- `x_requested_by`
- `x_decided_by`
- chatter and activities

Recommended request states:

- `pending`
- `approved`
- `rejected`

Recommended UX rules:

- the `Convert` button appears on the intake record only when the pool is in the right operational state, typically `pooling` with a chairman decision of `approved` or `on_hold`
- the `Convert` button is usable by HR manager or chairman
- pressing `Convert` creates a conversion request in `pending`
- while the request is pending, `x_intake_phase` becomes `conversion`
- while the request is pending, `x_chairman_decision` becomes readonly
- chairman approval sets the request to `approved`, creates the applicant, back-links the applicant, and sets the pool to `converted`
- chairman rejection sets the request to `rejected`, moves the pool back to `pooling`, and re-enables chairman decision editing

## 5. Schema outline

### Main record

`x_hr.pool` carries:

- identity and contact fields
- Fillout/Zite metadata
- candidate origin and phase fields
- chairman and reviewer decision fields
- recruitment handoff fields
- conversion-request linkage fields
- document/signature attachment references
- chatter and activities

### Child lines

The intake record contains separate one2many collections for:

- education history
- employment history
- skills
- languages
- commitments

### Helper masters

The module also ships canonical helper tables for:

- commitment types
- preferred role types
- skill types
- proficiency levels
- languages

These helper tables are intentionally separate from the main intake record so they can be reused and referenced by ID in n8n and later recruitment logic.

## 6. Native Odoo alignment

Aligned:

- chatter and activities
- QWeb PDF report
- list / kanban / form views
- role-based access groups
- many2one and one2many relational structure

Partially aligned:

- Documents
- Sign

`hr_pool` currently only stores document and signature attachment references. It does not implement the native document/sign request lifecycle.

Not aligned yet:

- WhatsApp-specific integration
- applicant creation
- recruitment stage integration

Applicant creation belongs to stage 2, but the stage 1 record should keep the backlink and status of the conversion request visible for auditability.

## 7. n8n contract

The intake module depends on the external Fillout/Zite -> n8n payload contract in:

- `docs/fillout_to_odoo_field_mapping.md`
- `docs/resources/n8n/hr_pool_mapper.js`
- `docs/zite_fillout_readiness_checklist.md`

Key rules:

- helper-backed selections should resolve to stable Odoo IDs
- `x_source_record_id` keeps Zite traceability on child/helper rows
- the intake payload must include all required stage-1 fields before the workflow is considered complete

## 8. Translation delivery

For every stage-1 release:

- update the module Arabic PO files
- make sure menus, actions, fields, selections, and report strings are translated
- keep translations inside the installable module archive

## 9. Install/test checklist

Before stage-1 install:

- module zip contains only `hr_pool`
- helper data is still present
- chatter renders on the main intake form
- report action exists
- no Studio scratch artifacts remain in the database

After stage-1 install:

- create one intake record
- confirm chatter and activities
- confirm list, kanban, and form views
- confirm report generation
- confirm helper CRUD menus
- confirm n8n payload still maps to the current schema
