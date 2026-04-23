// n8n Code node
// Mode: Run Once for Each Item
//
// Purpose:
// - Normalize the Fillout webhook payload into a stable intermediate shape
// - Validate required fields before the Odoo create payload is built
// - Ignore uninitialized child rows emitted by Fillout/Zite
//
// Output:
// - ok: boolean
// - errors: array of blocking validation issues
// - warnings: array of non-blocking issues
// - normalized: clean data object for the next code node

const SOURCE_SYSTEM = "fillout_zite";

const WORK_TYPE_MAP = {
  "دوام كامل": "full_time",
  "full time": "full_time",
  "full-time": "full_time",
  "full_time": "full_time",
  "دوام جزئي": "part_time",
  "part time": "part_time",
  "part-time": "part_time",
  "part_time": "part_time",
  "متعاقد": "contractor",
  "مقاول": "contractor",
  "عمر حر": "contractor",
  "contractor": "contractor",
};

const MARITAL_STATUS_MAP = {
  "أعزب": "single",
  "اعزب": "single",
  single: "single",
  "متزوج": "married",
  married: "married",
};

const QUALIFICATION_TYPE_MAP = {
  "دكتوراه": "doctorate",
  doctorate: "doctorate",
  "ماجستير": "masters",
  masters: "masters",
  "بكالوريوس": "bachelors",
  bachelors: "bachelors",
  "دبلوم": "diploma",
  diploma: "diploma",
  "شهادة كلية": "college_certificate",
  college_certificate: "college_certificate",
  "شهادة مدرسة": "school_certificate",
  school_certificate: "school_certificate",
  "شهادة تدريب": "training_certificate",
  training_certificate: "training_certificate",
};

const FREQUENCY_MAP = {
  "يومي": "daily",
  daily: "daily",
  "أسبوعي": "weekly",
  weekly: "weekly",
  "شهري": "monthly",
  monthly: "monthly",
  "سنوي": "annually",
  annually: "annually",
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

function normalizeOdooDatetime(value) {
  const text = cleanString(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");
  const second = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
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

function isUninitializedRecord(row) {
  return Boolean(row?.___record_uninitialized);
}

function normalizeRecordPickerRows(value) {
  return asArray(value)
    .filter((row) => row && !isUninitializedRecord(row) && row.recordID)
    .map((row) => ({ ...row }));
}

function mapSelection(map, value) {
  const key = cleanString(value);
  if (!key) return null;
  return map[key] ?? null;
}

function buildError(path, message, value = undefined) {
  const error = { path, message };
  if (value !== undefined) error.value = value;
  return error;
}

function requireValue(errors, path, value) {
  const clean = cleanString(value);
  if (!clean) {
    errors.push(buildError(path, "Missing required value", value));
    return null;
  }
  return clean;
}

function requireInt(errors, path, value) {
  const parsed = toInt(value);
  if (parsed === null) {
    errors.push(buildError(path, "Missing or invalid required integer", value));
    return null;
  }
  return parsed;
}

function mapHelperIdList(rows, key, errors, pathPrefix) {
  const ids = [];
  rows.forEach((row, index) => {
    const rawValue = row?.[key];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue?.value?.[0] ?? rawValue;
    const parsed = toInt(value);
    if (parsed === null) {
      errors.push(
        buildError(`${pathPrefix}[${index}].${key}`, "Missing or invalid helper id", value),
      );
      return;
    }
    ids.push(parsed);
  });
  return [...new Set(ids)];
}

function firstQuestionValue(questionMap, candidates) {
  for (const candidate of candidates) {
    const value = getQuestionValue(questionMap, candidate);
    if (value !== undefined && value !== null) return value;
  }
  return null;
}

const item = Array.isArray($json) ? $json[0] : $json;
const body = item.body ?? item;
const submission = body.submission ?? {};
const questions = asArray(submission.questions);
const questionMap = getQuestionMap(questions);
const errors = [];
const warnings = [];

const photo = asArray(getQuestionValue(questionMap, "iuY1"))[0] ?? null;
const nationality = asArray(getQuestionValue(questionMap, "1wFk"))[0] ?? null;
const educationRows = normalizeRecordPickerRows(getQuestionValue(questionMap, "crsx"));
const experienceRows = normalizeRecordPickerRows(getQuestionValue(questionMap, "1MsN"));
const languageRows = normalizeRecordPickerRows(getQuestionValue(questionMap, "a4cy"));
const skillRows = normalizeRecordPickerRows(getQuestionValue(questionMap, "69tX"));
const roleRows = normalizeRecordPickerRows(getQuestionValue(questionMap, "3J6p"));
const commitmentRows = normalizeRecordPickerRows(getQuestionValue(questionMap, "mWVi"));

const preferredWorkTypeRaw = firstQuestionValue(questionMap, ["amrf", "نوع العمل المرغوب به"]);
const preferredWorkType = mapSelection(WORK_TYPE_MAP, preferredWorkTypeRaw);
if (!preferredWorkType && cleanString(preferredWorkTypeRaw)) {
  errors.push(
    buildError("amrf", "Unsupported preferred work type", preferredWorkTypeRaw),
  );
}

const nationalityId = toInt(nationality?.odoo_id);
if (nationality && nationalityId === null) {
  errors.push(buildError("1wFk.odoo_id", "Nationality helper id is invalid", nationality?.odoo_id));
}

const candidate = {
  x_name: [
    cleanString(getQuestionValue(questionMap, "3k21")),
    cleanString(getQuestionValue(questionMap, "2JgW")),
  ].filter(Boolean).join(" "),
  x_intake_reference: submission.submissionId ? `FILL-${submission.submissionId}` : null,
  x_fillout_submission_id: cleanString(submission.submissionId),
  x_fillout_form_id: cleanString(body.formId),
  x_fillout_submission_time: normalizeOdooDatetime(submission.submissionTime),
  x_fillout_last_updated_at: normalizeOdooDatetime(submission.lastUpdatedAt),
  x_source_system: SOURCE_SYSTEM,
  x_candidate_origin: "public_candidate",
  x_source_channel: SOURCE_SYSTEM,
  x_intake_phase: "prescreening",
  x_chairman_decision: "pending",
  x_first_name_ar: cleanString(getQuestionValue(questionMap, "3k21")),
  x_surname_ar: cleanString(getQuestionValue(questionMap, "2JgW")),
  x_first_name_en: cleanString(getQuestionValue(questionMap, "kajg")),
  x_surname_en: cleanString(getQuestionValue(questionMap, "aRgp")),
  x_nationality_id: nationalityId,
  nationality_source: compactObject({
    record_id: nationality?.recordID,
    odoo_id: nationality?.odoo_id,
    code: nationality?.code,
    country_ar: nationality?.country_ar,
    country_en: nationality?.country_en,
  }),
  x_national_id: cleanString(getQuestionValue(questionMap, "tJiu")),
  x_date_of_birth: normalizeDate(getQuestionValue(questionMap, "9whn")),
  x_marital_status: mapSelection(MARITAL_STATUS_MAP, getQuestionValue(questionMap, "ewBc")),
  x_phone: cleanString(getQuestionValue(questionMap, "foYg")),
  x_email: cleanString(getQuestionValue(questionMap, "jbUY")),
  x_address_text: cleanString(getQuestionValue(questionMap, "8Qvt")),
  x_preferred_work_type: preferredWorkType,
  x_preferred_work_locations: cleanString(getQuestionValue(questionMap, "rQCn")),
  x_accuracy_declaration: Boolean(getQuestionValue(questionMap, "7yMN")),
  x_privacy_declaration: Boolean(getQuestionValue(questionMap, "xxR6")),
  x_typed_consent_name: cleanString(getQuestionValue(questionMap, "nPEA")),
  x_profile_photo_url: cleanString(photo?.url),
};

if (!candidate.x_nationality_id) {
  errors.push(buildError("1wFk", "Missing or invalid nationality Odoo id"));
}

if (!candidate.x_fillout_submission_id) {
  errors.push(buildError("submission.submissionId", "Missing submission id"));
}

if (!candidate.x_fillout_form_id) {
  warnings.push(buildError("body.formId", "Missing form id"));
}

if (!candidate.x_first_name_ar) {
  errors.push(buildError("3k21", "Missing first name in Arabic"));
}

if (!candidate.x_surname_ar) {
  errors.push(buildError("2JgW", "Missing surname in Arabic"));
}

if (!candidate.x_date_of_birth) {
  errors.push(buildError("9whn", "Missing or invalid date of birth"));
}

if (!candidate.x_marital_status) {
  errors.push(buildError("ewBc", "Unsupported marital status", getQuestionValue(questionMap, "ewBc")));
}

if (!candidate.x_phone) {
  errors.push(buildError("foYg", "Missing phone number"));
}

if (!candidate.x_email) {
  errors.push(buildError("jbUY", "Missing email"));
}

if (!candidate.x_address_text) {
  errors.push(buildError("8Qvt", "Missing address"));
}

if (!candidate.x_preferred_work_type) {
  errors.push(buildError("amrf", "Missing or unsupported preferred work type", preferredWorkTypeRaw));
}

if (!candidate.x_preferred_work_locations) {
  errors.push(buildError("rQCn", "Missing preferred work locations"));
}

if (candidate.x_accuracy_declaration !== true) {
  errors.push(buildError("7yMN", "Accuracy declaration must be true", getQuestionValue(questionMap, "7yMN")));
}

if (candidate.x_privacy_declaration !== true) {
  errors.push(buildError("xxR6", "Privacy declaration must be true", getQuestionValue(questionMap, "xxR6")));
}

if (!candidate.x_typed_consent_name) {
  errors.push(buildError("nPEA", "Missing typed consent name"));
}

const preferredRoleTypeIds = mapHelperIdList(roleRows, "Odoo Id", errors, "3J6p");
if (preferredRoleTypeIds.length === 0) {
  errors.push(buildError("3J6p", "Preferred roles must contain at least one Odoo id"));
}

const normalizedEducation = educationRows.map((row, index) => {
  const item = {
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_qualifying_institution: cleanString(row.Institution),
    x_qualification_subject: cleanString(row.Subject),
    x_qualification_type: mapSelection(QUALIFICATION_TYPE_MAP, row.Qualification_type),
    x_graduation_year: toInt(row["Graduation Year"]),
  };

  if (!item.x_qualifying_institution) {
    errors.push(buildError(`crsx[${index}].Institution`, "Missing education institution"));
  }
  if (!item.x_qualification_subject) {
    errors.push(buildError(`crsx[${index}].Subject`, "Missing education subject"));
  }
  if (!item.x_qualification_type) {
    errors.push(buildError(`crsx[${index}].Qualification_type`, "Unsupported education qualification type", row.Qualification_type));
  }
  if (item.x_graduation_year === null) {
    errors.push(buildError(`crsx[${index}].Graduation Year`, "Missing or invalid education graduation year", row["Graduation Year"]));
  }

  return compactObject(item);
}).filter((row) => Object.keys(row).length > 0);

const normalizedEmployment = experienceRows.map((row, index) => {
  const item = {
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_employer_name: cleanString(row["Employer Name"]),
    x_job_title: cleanString(row["Job Title"]),
    x_start_date: normalizeDate(row.From),
    x_end_date: normalizeDate(row.To),
  };

  if (!item.x_employer_name) {
    errors.push(buildError(`1MsN[${index}].Employer Name`, "Missing employer name"));
  }
  if (!item.x_job_title) {
    errors.push(buildError(`1MsN[${index}].Job Title`, "Missing job title"));
  }

  return compactObject(item);
}).filter((row) => Object.keys(row).length > 0);

const normalizedSkills = skillRows.map((row, index) => {
  const item = {
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_skill_type_id: toInt(pickFirstLookupValue(row, "skill_type_id")),
    x_skill_type_name: cleanString(pickFirstLookupValue(row, "skill_type_ar_lookup")) || cleanString(row.Type),
    x_skill_description: cleanString(row.Notes),
    x_proficiency_level: toInt(
      pickFirstLookupValue(row, "skills_proficiency_level_lookup") ??
      pickFirstLookupValue(row, "proficiency_level_value_lookup"),
    ),
    x_skill_type_source_ids: asArray(row.skill_types).map(cleanString).filter(Boolean),
  };

  if (item.x_skill_type_id === null) {
    errors.push(buildError(`69tX[${index}].skill_type_id`, "Missing or invalid skill type Odoo id", pickFirstLookupValue(row, "skill_type_id")));
  }
  if (!item.x_skill_description) {
    errors.push(buildError(`69tX[${index}].Notes`, "Missing skill description"));
  }
  if (item.x_proficiency_level === null) {
    errors.push(buildError(`69tX[${index}].proficiency_level`, "Missing or invalid skill proficiency value"));
  }

  return compactObject(item);
}).filter((row) => Object.keys(row).length > 0);

const normalizedLanguages = languageRows.map((row, index) => {
  const item = {
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_language_id: toInt(pickFirstLookupValue(row, "Odoo Id (from language_names)")),
    x_language_name: cleanString(pickFirstLookupValue(row, "language_ar_lookup")) ||
      cleanString(pickFirstLookupValue(row, "language_en_lookup")),
    x_working_level_value: toInt(pickFirstLookupValue(row, "language_working_level")),
    x_language_source_ids: asArray(row.language).map(cleanString).filter(Boolean),
    x_proficiency_source_ids: asArray(row.proficiency_level).map(cleanString).filter(Boolean),
  };

  if (item.x_language_id === null) {
    errors.push(buildError(`a4cy[${index}].Odoo Id (from language_names)`, "Missing or invalid language Odoo id"));
  }
  if (!item.x_language_name) {
    errors.push(buildError(`a4cy[${index}].language_ar_lookup`, "Missing language display snapshot"));
  }
  if (item.x_working_level_value === null) {
    errors.push(buildError(`a4cy[${index}].language_working_level`, "Missing or invalid working level"));
  }

  return compactObject(item);
}).filter((row) => Object.keys(row).length > 0);

const normalizedCommitments = commitmentRows.map((row, index) => {
  const item = {
    x_sequence: index + 1,
    x_source_record_id: cleanString(row.recordID),
    x_commitment_type_id: toInt(pickFirstLookupValue(row, "Commitment_type_id")),
    x_frequency: mapSelection(FREQUENCY_MAP, row.Frequency),
    x_notes: cleanString(row.Notes),
    x_commitment_type_source_ids: asArray(row["Commitment Type"]).map(cleanString).filter(Boolean),
  };

  if (item.x_commitment_type_id === null) {
    errors.push(buildError(`mWVi[${index}].Commitment_type_id`, "Missing or invalid commitment type Odoo id"));
  }
  if (!item.x_frequency) {
    errors.push(buildError(`mWVi[${index}].Frequency`, "Unsupported commitment frequency", row.Frequency));
  }

  return compactObject(item);
}).filter((row) => Object.keys(row).length > 0);

const normalized = {
  source: {
    system: SOURCE_SYSTEM,
    form_id: cleanString(body.formId),
    form_name: cleanString(body.formName),
    webhook_url: cleanString(item.webhookUrl),
    execution_mode: cleanString(item.executionMode),
  },
  submission: {
    id: cleanString(submission.submissionId),
    submitted_at: normalizeOdooDatetime(submission.submissionTime),
    last_updated_at: normalizeOdooDatetime(submission.lastUpdatedAt),
  },
  candidate,
  relations: {
    x_preferred_role_type_ids: preferredRoleTypeIds,
  },
  lines: {
    education: normalizedEducation,
    employment: normalizedEmployment,
    skills: normalizedSkills,
    languages: normalizedLanguages,
    commitments: normalizedCommitments,
  },
  meta: {
    photo_url: candidate.x_profile_photo_url,
    question_count: questions.length,
  },
};

return {
  json: {
    ok: errors.length === 0,
    errors,
    warnings,
    normalized,
  },
};
