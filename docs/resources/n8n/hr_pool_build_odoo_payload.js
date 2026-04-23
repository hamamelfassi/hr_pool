// n8n Code node
// Mode: Run Once for Each Item
//
// Purpose:
// - Convert the normalized payload into the final Odoo ORM create payload
// - Attach the candidate photo if a binary download was merged onto the item
//
// Expected input:
// - $json.normalized from the previous normalize/validate node
// - optional binary photo data on $binary if you merged in a prior HTTP Request node
//
// Output:
// - odoo_model: "x_hr.pool"
// - odoo_payload: final ORM payload for the Odoo Create node

function compactObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function commandCreate(values) {
  const cleanValues = compactObject(values);
  if (Object.keys(cleanValues).length === 0) return null;
  return [0, 0, cleanValues];
}

function commandSet(ids) {
  const cleanIds = [...new Set(asArray(ids).map((value) => Number.parseInt(String(value), 10)).filter(Number.isInteger))];
  return cleanIds.length ? [[6, 0, cleanIds]] : [];
}

function getFirstBinary(item) {
  const currentItem = typeof $input !== "undefined" && $input?.item ? $input.item : null;
  const inputBinary = currentItem?.binary ?? null;
  const explicitBinary = typeof $binary !== "undefined" && $binary ? $binary : null;
  const itemBinary = item.binary ?? null;
  const binary = inputBinary ?? explicitBinary ?? itemBinary ?? {};

  if (binary.photo) return binary.photo;

  const keys = Object.keys(binary);
  if (keys.length === 0) return null;
  return binary[keys[0]];
}

function binaryToBase64(binary) {
  if (!binary) return null;
  if (typeof binary.data === "string" && binary.data.trim()) return binary.data;
  if (typeof binary.fileData === "string" && binary.fileData.trim()) return binary.fileData;
  if (Buffer.isBuffer(binary)) return binary.toString("base64");
  return null;
}

const item = Array.isArray($json) ? $json[0] : $json;
const normalized = item.normalized ?? $json.normalized ?? null;

if (!normalized) {
  throw new Error("Missing normalized payload from previous node");
}

const candidate = normalized.candidate ?? {};
const lines = normalized.lines ?? {};
const relations = normalized.relations ?? {};

const photoBinary = getFirstBinary(item);
const photoBase64 = binaryToBase64(photoBinary);

const odooPayload = compactObject({
  x_name: candidate.x_name,
  x_intake_reference: candidate.x_intake_reference,
  x_fillout_submission_id: candidate.x_fillout_submission_id,
  x_fillout_form_id: candidate.x_fillout_form_id,
  x_fillout_submission_time: candidate.x_fillout_submission_time,
  x_fillout_last_updated_at: candidate.x_fillout_last_updated_at,
  x_source_system: candidate.x_source_system,
  x_candidate_origin: candidate.x_candidate_origin,
  x_source_channel: candidate.x_source_channel,
  x_intake_phase: candidate.x_intake_phase,
  x_chairman_decision: candidate.x_chairman_decision,
  x_profile_photo: photoBase64,
  x_first_name_ar: candidate.x_first_name_ar,
  x_surname_ar: candidate.x_surname_ar,
  x_first_name_en: candidate.x_first_name_en,
  x_surname_en: candidate.x_surname_en,
  x_nationality_id: candidate.x_nationality_id,
  x_national_id: candidate.x_national_id,
  x_date_of_birth: candidate.x_date_of_birth,
  x_marital_status: candidate.x_marital_status,
  x_phone: candidate.x_phone,
  x_email: candidate.x_email,
  x_address_text: candidate.x_address_text,
  x_preferred_work_type: candidate.x_preferred_work_type,
  x_preferred_work_locations: candidate.x_preferred_work_locations,
  x_accuracy_declaration: candidate.x_accuracy_declaration,
  x_privacy_declaration: candidate.x_privacy_declaration,
  x_typed_consent_name: candidate.x_typed_consent_name,
  x_preferred_role_type_ids: commandSet(relations.x_preferred_role_type_ids),
  x_education_line_ids: asArray(lines.education).map((row) => commandCreate({
    x_sequence: row.x_sequence,
    x_source_record_id: row.x_source_record_id,
    x_qualifying_institution: row.x_qualifying_institution,
    x_qualification_subject: row.x_qualification_subject,
    x_qualification_type: row.x_qualification_type,
    x_graduation_year: row.x_graduation_year,
  })).filter(Boolean),
  x_employment_line_ids: asArray(lines.employment).map((row) => commandCreate({
    x_sequence: row.x_sequence,
    x_source_record_id: row.x_source_record_id,
    x_employer_name: row.x_employer_name,
    x_job_title: row.x_job_title,
    x_start_date: row.x_start_date,
    x_end_date: row.x_end_date,
  })).filter(Boolean),
  x_skill_line_ids: asArray(lines.skills).map((row) => commandCreate({
    x_sequence: row.x_sequence,
    x_source_record_id: row.x_source_record_id,
    x_skill_type_id: row.x_skill_type_id,
    x_skill_description: row.x_skill_description,
    x_proficiency_level: row.x_proficiency_level,
  })).filter(Boolean),
  x_language_line_ids: asArray(lines.languages).map((row) => commandCreate({
    x_sequence: row.x_sequence,
    x_source_record_id: row.x_source_record_id,
    x_language_id: row.x_language_id,
    x_language_name: row.x_language_name,
    x_working_level_value: row.x_working_level_value,
  })).filter(Boolean),
  x_commitment_line_ids: asArray(lines.commitments).map((row) => commandCreate({
    x_sequence: row.x_sequence,
    x_source_record_id: row.x_source_record_id,
    x_commitment_type_id: row.x_commitment_type_id,
    x_frequency: row.x_frequency,
    x_notes: row.x_notes,
  })).filter(Boolean),
});

return {
  json: {
    odoo_model: "x_hr.pool",
    odoo_payload: odooPayload,
  },
};
