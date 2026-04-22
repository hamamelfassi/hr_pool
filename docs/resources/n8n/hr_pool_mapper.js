// n8n Code node
// Mode: Run Once for Each Item
//
// Purpose:
// - Parse the current Fillout webhook shape
// - Build Odoo ORM create payloads for x_hr.pool
// - Prefer helper Odoo ids from the webhook where available
//
// Important:
// - skill type helper ids are not yet included in the webhook payload.
// - Fill in SKILL_TYPE_ID_BY_LABEL once the helper ids are known in Odoo.
// - language_ar_lookup / language_en_lookup are currently treated as swapped upstream.

const DISPLAY_LANGUAGE = "ar";
const SOURCE_SYSTEM = "fillout_zite";

const SKILL_TYPE_ID_BY_LABEL = {
  "شخصية": null,
  "تشغيلية": null,
  "فنية": null,
  "إدارية": null,
};

const MARITAL_STATUS_MAP = {
  "أعزب": "single",
  "اعزب": "single",
  "متزوج": "married",
};

const QUALIFICATION_TYPE_MAP = {
  "دكتوراه": "doctorate",
  "ماجستير": "masters",
  "بكالوريوس": "bachelors",
  "دبلوم": "diploma",
  "شهادة كلية": "college_certificate",
  "شهادة مدرسة": "school_certificate",
  "شهادة تدريب": "training_certificate",
};

const FREQUENCY_MAP = {
  "يومي": "daily",
  "أسبوعي": "weekly",
  "شهري": "monthly",
  "سنوي": "annually",
};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function cleanString(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function toInt(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isInteger(value)) return value;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeDate(value) {
  const text = cleanString(value);
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

function commandCreate(values) {
  const cleanValues = compactObject(values);
  if (Object.keys(cleanValues).length === 0) return null;
  return [0, 0, cleanValues];
}

function commandSet(ids) {
  const cleanIds = [...new Set(asArray(ids).map(toInt).filter(Number.isInteger))];
  return cleanIds.length ? [[6, 0, cleanIds]] : [];
}

function requireValue(label, value) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required value for ${label}`);
  }
  if (Array.isArray(value) && value.length === 0) {
    throw new Error(`Missing required value for ${label}`);
  }
  return value;
}

async function urlToBase64(url) {
  const cleanUrl = cleanString(url);
  if (!cleanUrl) return null;

  const response = await fetch(cleanUrl);
  if (!response.ok) {
    throw new Error(`Photo download failed: ${response.status} ${response.statusText}`);
  }

  const bytes = await response.arrayBuffer();
  return Buffer.from(bytes).toString("base64");
}

function getQuestionMap(questions) {
  const map = new Map();
  for (const question of questions) {
    map.set(question.id, question);
    map.set(question.name, question);
  }
  return map;
}

function getQuestionValue(questionMap, idOrName, fallback = null) {
  return questionMap.get(idOrName)?.value ?? fallback;
}

function pickFirstLookupValue(record, key) {
  return record?.[key]?.value?.[0] ?? null;
}

const item = Array.isArray($json) ? $json[0] : $json;
const body = item.body ?? item;
const submission = body.submission ?? {};
const questions = asArray(submission.questions);
const questionMap = getQuestionMap(questions);

const photo = asArray(getQuestionValue(questionMap, "iuY1"))[0] ?? null;
const nationality = asArray(getQuestionValue(questionMap, "1wFk"))[0] ?? null;
const education = asArray(getQuestionValue(questionMap, "crsx"));
const experience = asArray(getQuestionValue(questionMap, "1MsN"));
const languages = asArray(getQuestionValue(questionMap, "a4cy"));
const skills = asArray(getQuestionValue(questionMap, "69tX"));
const preferredRoles = asArray(getQuestionValue(questionMap, "3J6p"));
const commitments = asArray(getQuestionValue(questionMap, "mWVi"));

const x_language_name_from_payload = (record) => {
  if (DISPLAY_LANGUAGE === "ar") {
    return cleanString(pickFirstLookupValue(record, "language_en_lookup"));
  }
  return cleanString(pickFirstLookupValue(record, "language_ar_lookup"));
};

const odooPayload = compactObject({
  x_name: [
    cleanString(getQuestionValue(questionMap, "3k21")),
    cleanString(getQuestionValue(questionMap, "2JgW")),
  ].filter(Boolean).join(" "),
  x_intake_reference: submission.submissionId ? `FILL-${submission.submissionId}` : null,
  x_fillout_submission_id: cleanString(submission.submissionId),
  x_fillout_form_id: cleanString(body.formId),
  x_fillout_submission_time: cleanString(submission.submissionTime),
  x_fillout_last_updated_at: cleanString(submission.lastUpdatedAt),
  x_source_system: SOURCE_SYSTEM,
  x_candidate_origin: "public_candidate",
  x_source_channel: SOURCE_SYSTEM,
  x_intake_phase: "prescreening",
  x_chairman_decision: "pending",
  x_profile_photo: await urlToBase64(photo?.url),
  x_first_name_ar: requireValue("x_first_name_ar", cleanString(getQuestionValue(questionMap, "3k21"))),
  x_surname_ar: requireValue("x_surname_ar", cleanString(getQuestionValue(questionMap, "2JgW"))),
  x_first_name_en: cleanString(getQuestionValue(questionMap, "kajg")),
  x_surname_en: cleanString(getQuestionValue(questionMap, "aRgp")),
  x_nationality_id: requireValue("x_nationality_id", toInt(nationality?.odoo_id)),
  x_national_id: cleanString(getQuestionValue(questionMap, "tJiu")),
  x_date_of_birth: requireValue("x_date_of_birth", normalizeDate(getQuestionValue(questionMap, "9whn"))),
  x_marital_status: requireValue(
    "x_marital_status",
    MARITAL_STATUS_MAP[cleanString(getQuestionValue(questionMap, "ewBc"))] ?? null,
  ),
  x_phone: requireValue("x_phone", cleanString(getQuestionValue(questionMap, "foYg"))),
  x_email: requireValue("x_email", cleanString(getQuestionValue(questionMap, "jbUY"))),
  x_address_text: requireValue("x_address_text", cleanString(getQuestionValue(questionMap, "8Qvt"))),
  x_preferred_role_type_ids: commandSet(preferredRoles.map((row) => row?.["Odoo Id"])),
  x_education_line_ids: education.map((row, index) => commandCreate({
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_qualifying_institution: cleanString(row.Institution),
    x_qualification_subject: cleanString(row.Subject),
    x_qualification_type: QUALIFICATION_TYPE_MAP[cleanString(row.Qualification_type)] ?? null,
    x_graduation_year: toInt(row["Graduation Year"]),
  })).filter(Boolean),
  x_employment_line_ids: experience.map((row, index) => commandCreate({
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_employer_name: cleanString(row["Employer Name"]),
    x_job_title: cleanString(row["Job Title"]),
    x_start_date: normalizeDate(row.From),
    x_end_date: normalizeDate(row.To),
  })).filter(Boolean),
  x_skill_line_ids: skills.map((row, index) => commandCreate({
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_skill_type_id: toInt(SKILL_TYPE_ID_BY_LABEL[cleanString(row.Type)]),
    x_skill_description: cleanString(row.Notes),
    x_proficiency_level: toInt(
      pickFirstLookupValue(row, "skills_proficiency_level_lookup") ??
      pickFirstLookupValue(row, "proficiency_level_value_lookup"),
    ),
  })).filter(Boolean),
  x_language_line_ids: languages.map((row, index) => commandCreate({
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_language_id: requireValue(`x_language_line_ids[${index}].x_language_id`, toInt(pickFirstLookupValue(row, "Odoo Id (from language_names)"))),
    x_language_name: requireValue(`x_language_line_ids[${index}].x_language_name`, x_language_name_from_payload(row)),
    x_working_level_value: requireValue(`x_language_line_ids[${index}].x_working_level_value`, toInt(pickFirstLookupValue(row, "language_working_level"))),
    x_notes: cleanString(row.Notes),
  })).filter(Boolean),
  x_commitment_line_ids: commitments.map((row, index) => commandCreate({
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_commitment_type_id: requireValue(`x_commitment_line_ids[${index}].x_commitment_type_id`, toInt(pickFirstLookupValue(row, "Commitment_type_id"))),
    x_frequency: FREQUENCY_MAP[cleanString(row.Frequency)] ?? null,
    x_notes: cleanString(row.Notes),
  })).filter(Boolean),
});

return {
  json: {
    odoo_model: "x_hr.pool",
    odoo_payload: odooPayload,
  },
};
