# Zite/Fillout Readiness Checklist for `hr_pool`

This checklist aligns your Fillout/Zite payload with the currently installed Odoo `hr_pool` schema.

## Required Odoo Fields vs Current Payload Baseline

## Main model `x_hr.pool`

Required or expected from the simplified public payload:

- `x_first_name_ar`
- `x_father_name_ar`
- `x_grandfather_name_ar`
- `x_surname_ar`
- `x_gender`
- `x_nationality_id`
- `x_national_id`
- `x_date_of_birth`
- `x_marital_status`
- `x_phone`
- `x_email`
- `x_residence_municipality_id`
- `x_preferred_role_type_ids`
- `x_preferred_work_type`
- `x_preferred_work_municipality_ids`
- `x_accuracy_declaration`
- `x_privacy_declaration`

Optional / legacy:

- `x_profile_photo`
- `x_first_name_en`
- `x_surname_en`
- `x_address_text`
- `x_preferred_work_locations`

Retired from initial intake:

- `x_typed_consent_name`

## Child lines

The initial public intake payload should not emit:

- education lines
- employment history lines
- skills
- languages

The matching Odoo child models remain available for manual/internal enrichment and future prefilled enrichment forms.

Commitment lines may still be emitted by the public form.

## Zite Helper Tables to Maintain

Keep helper rows authoritative by Odoo IDs:

- Countries (`res.country.id`) -> `odoo_id`
- Preferred Roles (`x_hr.preferred_role_type.id`) -> `Odoo Id`
- Municipalities (`x_grc.location.id`, filtered to `x_location_type = municipality`) -> `odoo_id_int`
- Commitment Types (`x_hr.commitment_type.id`) -> `Commitment_type_id.value[0]`

Legacy/deferred helper tables:

- Languages
- Skill Types
- Proficiency Levels

## Fillout Form Changes Required Before n8n Finalization

Add these questions to the public form and webhook payload:
- Preferred work type (single select)
: output an Odoo-ready key (`full_time`, `part_time`, `contractor`) or map table key.
- Preferred work locations (short/long text)
- Accuracy declaration checkbox (must be true)
- Privacy declaration checkbox (must be true)
- Typed consent name (short answer)
- Residence municipality picker:
  - required;
  - emits the Odoo ID of an `x_grc.location` municipality.
- Preferred work municipalities picker:
  - required or strongly recommended;
  - emits one or more Odoo IDs of `x_grc.location` municipality records.

Do not require the old credentials subforms for initial intake.

Future enrichment forms may reintroduce validation for:

- education
- employment history
- credentials
- languages
- skills

## Payload Contract to Target (Starting Baseline + Additions)

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

## Known Upstream Data Note

Current payload still indicates language lookups are swapped (`language_ar_lookup`/`language_en_lookup`).
Keep this documented until corrected upstream in Zite.

## Go/No-Go Before n8n Activation

Go only when all are true:

- Gender emits `Male` or `Female` and n8n maps it to `male` or `female`.
- Residence municipality emits a valid `x_grc.location` Odoo integer ID.
- Preferred work municipalities emit one or more valid `x_grc.location` Odoo integer IDs.
- Preferred roles emit at least one valid Odoo ID.
- Accuracy declaration is true.
- Privacy declaration is true.
- The payload does not emit education, employment, skills, or language arrays.
- Typed consent is not required.
- Commitment type IDs match the live Odoo helper records.
