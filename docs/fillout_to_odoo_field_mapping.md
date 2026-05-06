# Fillout/Zite to Odoo Field Mapping

This file is the integration source of truth for the `Fillout -> n8n -> Odoo hr_pool` workflow.

## Rules

- Helper-backed fields should use looked-up Odoo IDs as the authoritative write value.
- User-facing Fillout labels are for UX/debugging only, not for primary matching.
- `language_ar_lookup` and `language_en_lookup` are currently treated as swapped upstream.
- `x_source_record_id` on child/helper records stores the Zite record UUID.
- `x_fillout_*` fields on `x_hr.pool` store Fillout submission metadata.
- Initial public intake no longer collects education, employment history, skills, or language lines.
- Those child models remain in Odoo for later enrichment/manual use.
- If the public form includes a canonical residence/locality picker, it should emit an Odoo `x_grc.location` ID for `x_residence_location_id`.
- Initial public intake uses municipality-level location selection, not locality-level selection.
- Residence municipality should emit an Odoo `x_grc.location` ID where `x_location_type = municipality`.
- Preferred work locations should emit one or more Odoo `x_grc.location` IDs where `x_location_type = municipality`.
- The old free-text `x_preferred_work_locations` field is legacy compatibility only and should not be the primary initial-intake field.


## Parent Record

| Fillout Question ID | Fillout Label                    | Payload Path                     | Odoo Field                          | Transform                                |
| ------------------- | -------------------------------- | -------------------------------- | ----------------------------------- | ---------------------------------------- |
| n/a                 | submission id                    | `body.submission.submissionId`   | `x_fillout_submission_id`           | direct                                   |
| n/a                 | form id                          | `body.formId`                    | `x_fillout_form_id`                 | direct                                   |
| n/a                 | submission time                  | `body.submission.submissionTime` | `x_fillout_submission_time`         | ISO datetime                             |
| n/a                 | last updated at                  | `body.submission.lastUpdatedAt`  | `x_fillout_last_updated_at`         | ISO datetime                             |
| n/a                 | source system                    | constant                         | `x_source_system`                   | `fillout_zite`                           |
| `iuY1`              | الصورة الشخصية                   | `value[0].url`                   | `x_profile_photo`                   | download and base64                      |
| `tGfg`              | الجنس                            | `value`                          | `x_gender`                          | map `Male/Female` to `male/female`       |
| `3k21`              | الاسم (عربي)                     | `value`                          | `x_first_name_ar`                   | direct                                   |
| `h4L1`              | اسم الأب (عربي)                  | `value`                          | `x_father_name_ar`                  | direct                                   |
| `1pVy`              | اسم الجد (عربي)                  | `value`                          | `x_grandfather_name_ar`             | direct                                   |
| `2JgW`              | اللقب (عربي)                     | `value`                          | `x_surname_ar`                      | direct                                   |
| `kajg`              | الاسم (انجليزي)                  | `value`                          | `x_first_name_en`                   | optional/direct                          |
| `f8s9`              | اسم الأب (انجليزي)               | `value`                          | deferred                            | hidden; do not map yet                   |
| `rR6o`              | اسم الجد (انجليزي)               | `value`                          | deferred                            | hidden; do not map yet                   |
| `aRgp`              | اللقب (انجليزي)                  | `value`                          | `x_surname_en`                      | optional/direct                          |
| `1wFk`              | الجنسية                          | `value[0].odoo_id`               | `x_nationality_id`                  | integer                                  |
| `tJiu`              | الرقم الوطني                     | `value`                          | `x_national_id`                     | direct                                   |
| `9whn`              | تاريخ الميلاد                    | `value`                          | `x_date_of_birth`                   | ISO date                                 |
| `ewBc`              | الحالة الاجتماعية                | `value`                          | `x_marital_status`                  | map Arabic label to Odoo selection key   |
| `foYg`              | رقم الهاتف                       | `value`                          | `x_phone`                           | direct                                   |
| `jbUY`              | البريد الالكتروني                | `value`                          | `x_email`                           | direct                                   |
| `dZ9v`              | بلدية الإقامة                    | `value[0].odoo_id_int`           | `x_residence_municipality_id`       | integer `x_grc.location` municipality ID |
| `8Qvt`              | العنوان                          | `value`                          | `x_address_text`                    | optional legacy/free text                |
| `3J6p`              | مجال العمل المرغوب به            | `value[].Odoo Id`                | `x_preferred_role_type_ids`         | many2many set command                    |
| `amrf`              | نوع العمل المرغوب به             | `value`                          | `x_preferred_work_type`             | map Arabic label to Odoo selection key   |
| `8wZ5`              | يمكنني العمل في البلديات التالية | `value[].odoo_id_int`            | `x_preferred_work_municipality_ids` | many2many set command                    |
| `mWVi`              | الالتزامات الشخصية والاجتماعية   | `value[]`                        | `x_commitment_line_ids`             | child line create commands               |
| `7yMN`              | صحة البيانات                     | `value`                          | `x_accuracy_declaration`            | boolean true required                    |
| `xxR6`              | حماية الخصوصية                   | `value`                          | `x_privacy_declaration`             | boolean true required                    |
| `nPEA`              | توقيع المقدم                     | n/a                              | retired                             | removed from initial intake              |

## Child Lines

The simplified initial public employment application does not emit or write:

- `x_education_line_ids`
- `x_employment_line_ids`
- `x_skill_line_ids`
- `x_language_line_ids`

These child models remain available in Odoo for manual/internal enrichment and future prefilled enrichment forms.

Commitments remain in scope for the initial intake if provided by the public form:

| Payload Path                  | Odoo Field             | Transform                              |
| ----------------------------- | ---------------------- | -------------------------------------- |
| `recordID`                    | `x_source_record_id`   | direct                                 |
| `Commitment_type_id.value[0]` | `x_commitment_type_id` | integer                                |
| `Frequency`                   | `x_frequency`          | map Arabic label to Odoo selection key |
| `Notes`                       | `x_notes`              | direct                                 |

## Helper Models

| Odoo Model                 | Purpose                   | Source Tracking Field |
| -------------------------- | ------------------------- | --------------------- |
| `x_hr.language`            | canonical language master | `x_source_record_id`  |
| `x_hr.commitment_type`     | commitment helper         | `x_source_record_id`  |
| `x_hr.preferred_role_type` | preferred role helper     | `x_source_record_id`  |
| `x_hr.skill_type`          | skill type helper         | `x_source_record_id`  |
| `x_hr.proficiency_level`   | proficiency helper        | `x_source_record_id`  |
| `x_grc.location` | municipality master for residence and preferred work municipalities | n/a |

Zite municipality helper tables must store the live Odoo database ID in `odoo_id_int`. XML IDs such as `grc_backbone.loc_municipality_002` are useful for audit/debugging but should not be sent as the Odoo create value.