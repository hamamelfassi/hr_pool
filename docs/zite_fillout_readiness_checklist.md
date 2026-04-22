# Zite/Fillout Readiness Checklist for `hr_pool`

This checklist aligns your Fillout/Zite payload with the currently installed Odoo `hr_pool` schema.

## 1) Required Odoo Fields vs Current Payload Baseline

## Main model `x_hr.pool`

Provided today (from payload + constants in n8n):
- `x_first_name_ar`
- `x_surname_ar`
- `x_nationality_id` (from `odoo_id` in country picker)
- `x_date_of_birth`
- `x_marital_status` (mapped)
- `x_phone`
- `x_email`
- `x_address_text`
- `x_candidate_origin` (constant)
- `x_intake_phase` (constant)
- `x_chairman_decision` (constant)

Missing in current payload baseline (must be added or defaulted in n8n):
- `x_preferred_work_type` (required selection)
- `x_preferred_work_locations` (required char)
- `x_accuracy_declaration` (required boolean)
- `x_privacy_declaration` (required boolean)
- `x_typed_consent_name` (required char)

Conditionally risky:
- `x_preferred_role_type_ids` is required and must be non-empty.

## Child lines

Education line `x_hr.pool_education_line` required:
- `x_qualifying_institution`
- `x_qualification_subject`
- `x_qualification_type`
- `x_graduation_year`

Employment line `x_hr.pool_employment_line` required:
- `x_employer_name`
- `x_job_title`

Skill line `x_hr.pool_skill_line` required:
- `x_skill_description`

Language line `x_hr.pool_language_line` required:
- `x_language_id`
- `x_language_name`

Commitment line `x_hr.pool_commitment_line` required:
- `x_commitment_type_id`

## 2) Zite Helper Tables to Maintain (ID-first)

Keep helper rows authoritative by Odoo IDs:
- Countries (`res.country.id`) -> already in payload as `odoo_id`
- Preferred Roles (`x_hr.preferred_role_type.id`) -> `Odoo Id`
- Languages (`x_hr.language.id`) -> `Odoo Id (from language_names)`
- Commitment Types (`x_hr.commitment_type.id`) -> `Commitment_type_id.value[0]`
- Skill Types (`x_hr.skill_type.id`) -> add lookup and output Odoo ID
- Proficiency Levels (`x_hr.proficiency_level.id`) -> optional ID, keep numeric value required

Recommended columns per helper table:
- `recordID` (Zite UUID)
- `odoo_id` (integer, unique)
- `name_ar`
- `name_en`
- `active`

## 3) Fillout Form Changes Required Before n8n Finalization

Add these questions to the public form and webhook payload:
- Preferred work type (single select)
: output an Odoo-ready key (`full_time`, `part_time`, `contractor`) or map table key.
- Preferred work locations (short/long text)
- Accuracy declaration checkbox (must be true)
- Privacy declaration checkbox (must be true)
- Typed consent name (short answer)

Strengthen subform validations:
- Education: institution, subject, qualification type, graduation year all required.
- Employment: employer name, job title required.
- Skills: if `Notes` is used for `x_skill_description`, make it required or provide fallback text.
- Languages: ensure `Odoo Id (from language_names)` and `language_working_level` are always present.
- Preferred role picker: require at least one selected record.

## 4) Payload Contract to Target (Starting Baseline + Additions)

Keep current baseline keys and add the following top-level question outputs:
- `preferred_work_type_key` (or lookup containing key)
- `preferred_work_locations`
- `accuracy_declaration`
- `privacy_declaration`
- `typed_consent_name`

For ID-first child lookups, prefer these fields in each row:
- Skills row: `skill_type_odoo_id`, `proficiency_value` (and optional `proficiency_odoo_id`)
- Languages row: `language_odoo_id`, `language_name_snapshot`, `working_level_value`
- Commitments row: `commitment_type_odoo_id`

## 5) Known Upstream Data Note

Current payload still indicates language lookups are swapped (`language_ar_lookup`/`language_en_lookup`).
Keep this documented until corrected upstream in Zite.

## 6) Go/No-Go Before n8n Build

Go only when all are true:
- Required main-form fields listed in section 1 are present in webhook payload.
- Every helper-backed selection emits Odoo IDs.
- Language lines emit `language_odoo_id` and numeric working level.
- Preferred roles emits at least one Odoo ID.
