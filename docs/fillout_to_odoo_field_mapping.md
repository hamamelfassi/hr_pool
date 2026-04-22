# Fillout/Zite to Odoo Field Mapping

This file is the integration source of truth for the `Fillout -> n8n -> Odoo hr_pool` workflow.

## Rules

- Helper-backed fields should use looked-up Odoo IDs as the authoritative write value.
- User-facing Fillout labels are for UX/debugging only, not for primary matching.
- `language_ar_lookup` and `language_en_lookup` are currently treated as swapped upstream.
- `x_source_record_id` on child/helper records stores the Zite record UUID.
- `x_fillout_*` fields on `x_hr.pool` store Fillout submission metadata.

## Parent Record

| Fillout Question ID | Fillout Label | Payload Path | Odoo Field | Transform |
|---|---|---|---|---|
| n/a | submission id | `body.submission.submissionId` | `x_fillout_submission_id` | direct |
| n/a | form id | `body.formId` | `x_fillout_form_id` | direct |
| n/a | submission time | `body.submission.submissionTime` | `x_fillout_submission_time` | ISO datetime |
| n/a | last updated at | `body.submission.lastUpdatedAt` | `x_fillout_last_updated_at` | ISO datetime |
| n/a | source system | constant | `x_source_system` | `fillout_zite` |
| `iuY1` | الصورة الشخصية | `value[0].url` | `x_profile_photo` | download and base64 |
| `3k21` | الاسم (عربي) | `value` | `x_first_name_ar` | direct |
| `2JgW` | اللقب (عربي) | `value` | `x_surname_ar` | direct |
| `kajg` | الاسم (انجليزي) | `value` | `x_first_name_en` | direct |
| `aRgp` | اللقب (انجليزي) | `value` | `x_surname_en` | direct |
| `1wFk` | الجنسية | `value[0].odoo_id` | `x_nationality_id` | integer |
| `tJiu` | الرقم الوطني | `value` | `x_national_id` | direct |
| `9whn` | تاريخ الميلاد | `value` | `x_date_of_birth` | ISO date |
| `ewBc` | الحالة الاجتماعية | `value` | `x_marital_status` | map Arabic label to Odoo selection key |
| `foYg` | رقم الهاتف | `value` | `x_phone` | direct |
| `jbUY` | البريد الالكتروني | `value` | `x_email` | direct |
| `8Qvt` | العنوان | `value` | `x_address_text` | direct |
| `3J6p` | مجال العمل المرغوب به | `value[].Odoo Id` | `x_preferred_role_type_ids` | many2many set command |

## Child Lines

### Education -> `x_education_line_ids`

| Payload Path | Odoo Field | Transform |
|---|---|---|
| `recordID` | `x_source_record_id` | direct |
| `Institution` | `x_qualifying_institution` | direct |
| `Subject` | `x_qualification_subject` | direct |
| `Qualification_type` | `x_qualification_type` | map Arabic label to Odoo selection key |
| `Graduation Year` | `x_graduation_year` | integer |

### Employment -> `x_employment_line_ids`

| Payload Path | Odoo Field | Transform |
|---|---|---|
| `recordID` | `x_source_record_id` | direct |
| `Employer Name` | `x_employer_name` | direct |
| `Job Title` | `x_job_title` | direct |
| `From` | `x_start_date` | ISO datetime -> date |
| `To` | `x_end_date` | ISO datetime -> date |

### Skills -> `x_skill_line_ids`

| Payload Path | Odoo Field | Transform |
|---|---|---|
| `recordID` | `x_source_record_id` | direct |
| `Notes` | `x_skill_description` | direct |
| `skills_proficiency_level_lookup.value[0]` | `x_proficiency_level` | integer |
| `Type` | `x_skill_type_id` | map to helper Odoo ID in n8n until payload provides helper IDs |

### Languages -> `x_language_line_ids`

| Payload Path | Odoo Field | Transform |
|---|---|---|
| `recordID` | `x_source_record_id` | direct |
| `Odoo Id (from language_names).value[0]` | `x_language_id` | integer |
| `language_en_lookup.value[0]` | `x_language_name` | use as Arabic display snapshot because lookup keys are currently swapped |
| `language_working_level.value[0]` | `x_working_level_value` | integer |
| `Notes` | `x_notes` | direct |

### Commitments -> `x_commitment_line_ids`

| Payload Path | Odoo Field | Transform |
|---|---|---|
| `recordID` | `x_source_record_id` | direct |
| `Commitment_type_id.value[0]` | `x_commitment_type_id` | integer |
| `Frequency` | `x_frequency` | map Arabic label to Odoo selection key |
| `Notes` | `x_notes` | direct |

## Helper Models

| Odoo Model | Purpose | Source Tracking Field |
|---|---|---|
| `x_hr.language` | canonical language master | `x_source_record_id` |
| `x_hr.commitment_type` | commitment helper | `x_source_record_id` |
| `x_hr.preferred_role_type` | preferred role helper | `x_source_record_id` |
| `x_hr.skill_type` | skill type helper | `x_source_record_id` |
| `x_hr.proficiency_level` | proficiency helper | `x_source_record_id` |
