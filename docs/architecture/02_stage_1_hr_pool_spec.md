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

### 2.1 Initial intake simplification

The public Stage 1 employment application should remain short enough for quick candidate submission.

The initial Fillout/Zite intake should not require or collect detailed education, employment history, languages, or skills line data.

Those child models may remain in the module for backward compatibility and future enrichment workflows, but they should not be treated as required input for the first public employment application.

Later, `hr_pool` may introduce a second prefilled enrichment form, using tokenized/prefilled URL patterns, to collect education, experience, language, and credential details from selected candidates.

### Initial intake payload contract

The simplified public Stage 1 intake form is Arabic-first and should collect only the minimum data needed to create a usable `x_hr.pool` record.

The current initial intake payload should include:

- profile photo where provided;
- Arabic first name;
- Arabic father name;
- Arabic grandfather name;
- Arabic surname;
- nationality;
- national ID;
- gender;
- date of birth;
- marital status;
- phone;
- email;
- residence municipality;
- preferred role types;
- preferred work type;
- preferred work municipalities;
- personal/social commitments where provided;
- accuracy declaration;
- privacy declaration.

The initial public intake payload should not include:

- education line records;
- employment history line records;
- skill line records;
- language line records;
- typed consent name.

The previous typed consent name field is retired for initial intake. The accuracy and privacy checkboxes are sufficient at this stage. Formal declarations and signatures are handled later in Stage 2 recruitment.

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
- canonical intake identity fields including `x_national_id` and `x_gender`
- Fillout/Zite metadata
- candidate origin and phase fields
- chairman and reviewer decision fields
- recruitment handoff fields
- conversion-request linkage fields
- document/signature attachment references
- chatter and activities

### Child lines

The module contains separate one2many collections for:

- education history
- employment history
- skills
- languages
- commitments

For the simplified initial intake, education, employment history, skills, and languages should not be required and should not be populated by the first public application form.

They remain available for:

- legacy data preservation;
- internal/manual enrichment;
- future prefilled candidate-enrichment forms;
- later handover/mapping to native employee-side qualification, history, and skills structures.

Commitment lines may still be used where they represent required initial declarations or availability commitments, but the initial intake should stay lightweight.

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
- `x_gender` is part of the required intake payload and must be written into `hr_pool`
- canonical residence/location should resolve to `x_grc.location`
- the initial public intake payload should not include education, employment history, skills, or languages line payloads
- `x_source_record_id` remains useful for future child/helper enrichment rows, but child credential/history rows are not required for initial intake
- the intake payload must include only the required lightweight Stage 1 fields before the workflow is considered complete

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
