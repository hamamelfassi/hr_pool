// n8n Code node
// Mode: Run Once for Each Item
//
// Output:
// {
//   odoo_model: "x_hr.pool",
//   odoo_payload: { ... }
// }
//
// Assumption:
// - The incoming item is either already flattened, or wrapped in body/data/payload.
// - Repeating sections are arrays such as education / experience / skills / languages / commitments.
// - Helper lookups already carry Odoo integer ids where needed.

const ENABLE_FUNCTIONAL_AREA = false;

const raw = $json;
const root = raw.body ?? raw.data ?? raw.payload ?? raw;
const candidate = root.candidate ?? root.record ?? root.fields ?? root;

function getByPath(obj, path) {
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function pick(obj, paths, fallback = undefined) {
  for (const path of paths) {
    const value = getByPath(obj, path);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return fallback;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
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

function toBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = cleanString(value)?.toLowerCase();
  if (["true", "1", "yes", "y", "on", "checked"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off", "unchecked"].includes(normalized)) return false;
  return Boolean(value);
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

function mapSelection(map, value) {
  const text = cleanString(value);
  if (!text) return null;
  const key = text.toLowerCase().replace(/[\s/-]+/g, "_");
  return map[key] ?? map[text] ?? null;
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

function collectIds(records, candidatePaths) {
  return asArray(records)
    .map((record) => toInt(pick(record, candidatePaths)))
    .filter(Number.isInteger);
}

const selectionMaps = {
  candidateOrigin: {
    current_staff: "current_staff",
    public_candidate: "public_candidate",
    referral: "referral",
    manual_intake: "manual_intake",
  },
  maritalStatus: {
    single: "single",
    married: "married",
  },
  preferredWorkType: {
    full_time: "full_time",
    part_time: "part_time",
    contractor: "contractor",
    fulltime: "full_time",
    parttime: "part_time",
  },
  qualificationType: {
    doctorate: "doctorate",
    masters: "masters",
    "bachelor's": "bachelors",
    bachelors: "bachelors",
    diploma: "diploma",
    college_certificate: "college_certificate",
    school_certificate: "school_certificate",
    training_certificate: "training_certificate",
  },
  skillType: {
    interpersonal: "interpersonal",
    operational: "operational",
    technical: "technical",
    administrative: "administrative",
  },
  workingLevel: {
    basic: "basic",
    intermediate: "intermediate",
    advanced: "advanced",
    proficient: "proficient",
  },
  frequency: {
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly",
    annually: "annually",
    "\u064a\u0648\u0645\u064a": "daily",
    "\u0623\u0633\u0628\u0648\u0639\u064a": "weekly",
    "\u0634\u0647\u0631\u064a": "monthly",
    "\u0633\u0646\u0648\u064a": "annually",
  },
};

const submissionId = cleanString(
  pick(root, ["submissionId", "submission_id", "responseId", "response_id", "id"]),
);

const firstNameAr = cleanString(pick(candidate, ["first_name_ar", "firstNameAr", "name_ar.first"]));
const middleNamesAr = cleanString(
  pick(candidate, ["middle_names_ar", "middleNamesAr", "name_ar.middle"]),
);
const surnameAr = cleanString(pick(candidate, ["surname_ar", "last_name_ar", "surnameAr", "name_ar.last"]));

const firstNameEn = cleanString(pick(candidate, ["first_name_en", "firstNameEn", "name_en.first"]));
const middleNamesEn = cleanString(
  pick(candidate, ["middle_names_en", "middleNamesEn", "name_en.middle"]),
);
const surnameEn = cleanString(pick(candidate, ["surname_en", "last_name_en", "surnameEn", "name_en.last"]));

const displayName =
  [firstNameAr, middleNamesAr, surnameAr].filter(Boolean).join(" ") ||
  [firstNameEn, middleNamesEn, surnameEn].filter(Boolean).join(" ") ||
  `Candidate ${submissionId ?? new Date().toISOString()}`;

const nationalityId = toInt(
  pick(candidate, [
    "nationality_odoo_id",
    "country_odoo_id",
    "nationality.odoo_id",
    "country.odoo_id",
    "nationality.id",
  ]),
);

const preferredRoles = asArray(
  pick(candidate, ["preferred_roles", "preferred_role_types", "preferredRoleTypes"], []),
);
const preferredRoleIds = collectIds(preferredRoles, [
  "odoo_id",
  "odooId",
  "id",
  "value",
]);

const education = asArray(pick(candidate, ["education", "educations"], []));
const experience = asArray(pick(candidate, ["experience", "employment", "experiences"], []));
const skills = asArray(pick(candidate, ["skills"], []));
const languages = asArray(pick(candidate, ["languages"], []));
const commitments = asArray(pick(candidate, ["commitments"], []));

const profilePhotoUrl = pick(candidate, [
  "profile_photo_url",
  "profilePhotoUrl",
  "photo_url",
  "photoUrl",
  "profile_photo.s3_url",
  "profilePhoto.s3Url",
]);

const functionalAreaId = toInt(
  pick(candidate, [
    "functional_area_odoo_id",
    "grc_functional_area_odoo_id",
    "x_grc_functional_area_id",
  ]),
);

const odooPayload = compactObject({
  x_name: displayName,
  x_intake_reference: submissionId ? `FILL-${submissionId}` : null,
  x_candidate_origin:
    mapSelection(
      selectionMaps.candidateOrigin,
      pick(candidate, ["candidate_origin", "candidateOrigin"], "public_candidate"),
    ) ?? "public_candidate",
  x_source_channel: cleanString(
    pick(candidate, ["source_channel", "sourceChannel"], pick(root, ["source"], "fillout_zite")),
  ),
  x_intake_phase: "prescreening",
  x_chairman_decision: "pending",
  x_profile_photo: await urlToBase64(profilePhotoUrl),
  x_first_name_ar: requireValue("x_first_name_ar", firstNameAr),
  x_middle_names_ar: middleNamesAr,
  x_surname_ar: requireValue("x_surname_ar", surnameAr),
  x_first_name_en: firstNameEn,
  x_middle_names_en: middleNamesEn,
  x_surname_en: surnameEn,
  x_nationality_id: requireValue("x_nationality_id", nationalityId),
  x_national_id: cleanString(pick(candidate, ["national_id", "nationalId"])),
  x_date_of_birth: requireValue(
    "x_date_of_birth",
    normalizeDate(pick(candidate, ["date_of_birth", "dateOfBirth", "dob"])),
  ),
  x_marital_status: requireValue(
    "x_marital_status",
    mapSelection(selectionMaps.maritalStatus, pick(candidate, ["marital_status", "maritalStatus"])),
  ),
  x_phone: requireValue("x_phone", cleanString(pick(candidate, ["phone", "phone_number", "mobile"]))),
  x_email: requireValue("x_email", cleanString(pick(candidate, ["email", "email_address"]))),
  x_address_text: requireValue(
    "x_address_text",
    cleanString(pick(candidate, ["address_text", "address", "full_address"])),
  ),
  x_preferred_work_type: requireValue(
    "x_preferred_work_type",
    mapSelection(
      selectionMaps.preferredWorkType,
      pick(candidate, ["preferred_work_type", "preferredWorkType"]),
    ),
  ),
  x_preferred_work_locations: requireValue(
    "x_preferred_work_locations",
    cleanString(
      pick(candidate, ["preferred_work_locations", "preferredWorkLocations", "work_locations"]),
    ),
  ),
  x_commitments_description: cleanString(
    pick(candidate, ["commitments_description", "commitmentsDescription"]),
  ),
  x_accuracy_declaration: requireValue(
    "x_accuracy_declaration",
    toBool(pick(candidate, ["accuracy_declaration", "accuracyDeclaration"])),
  ),
  x_privacy_declaration: requireValue(
    "x_privacy_declaration",
    toBool(pick(candidate, ["privacy_declaration", "privacyDeclaration"])),
  ),
  x_typed_consent_name: requireValue(
    "x_typed_consent_name",
    cleanString(pick(candidate, ["typed_consent_name", "typedConsentName", "signature_name"])),
  ),
  x_preferred_role_type_ids: requireValue(
    "x_preferred_role_type_ids",
    commandSet(preferredRoleIds),
  ),
  ...(ENABLE_FUNCTIONAL_AREA && functionalAreaId
    ? { x_grc_functional_area_id: functionalAreaId }
    : {}),
  x_education_line_ids: education
    .map((row, index) =>
      commandCreate({
        x_sequence: index + 1,
        x_qualifying_institution: cleanString(
          pick(row, ["institution", "qualifying_institution", "school", "university"]),
        ),
        x_qualification_subject: cleanString(
          pick(row, ["subject", "qualification_subject", "major"]),
        ),
        x_qualification_type: mapSelection(
          selectionMaps.qualificationType,
          pick(row, ["qualification_type", "qualificationType", "degree"]),
        ),
        x_graduation_year: toInt(pick(row, ["graduation_year", "graduationYear", "year"])),
      }),
    )
    .filter(Boolean),
  x_employment_line_ids: experience
    .map((row, index) =>
      commandCreate({
        x_sequence: index + 1,
        x_employer_name: cleanString(pick(row, ["employer_name", "employerName", "company"])),
        x_job_title: cleanString(pick(row, ["job_title", "jobTitle", "title"])),
        x_start_date: normalizeDate(pick(row, ["start_date", "startDate"])),
        x_end_date: normalizeDate(pick(row, ["end_date", "endDate"])),
      }),
    )
    .filter(Boolean),
  x_skill_line_ids: skills
    .map((row, index) =>
      commandCreate({
        x_sequence: index + 1,
        x_skill_type: mapSelection(
          selectionMaps.skillType,
          pick(row, ["skill_type", "skillType", "category"]),
        ),
        x_skill_description: cleanString(
          pick(row, ["skill_description", "skillDescription", "name", "label"]),
        ),
        x_proficiency_level: toInt(
          pick(row, ["proficiency_level", "proficiencyLevel", "level_score", "score"]),
        ),
      }),
    )
    .filter(Boolean),
  x_language_line_ids: languages
    .map((row, index) => {
      const languageId = toInt(
        pick(row, ["odoo_id", "odooId", "language_odoo_id", "language.id", "id"]),
      );
      const languageName = cleanString(
        pick(row, ["name", "label", "language_name", "languageName"]),
      );

      return commandCreate({
        x_sequence: index + 1,
        x_language_id: requireValue(`x_language_line_ids[${index}].x_language_id`, languageId),
        x_language_name: requireValue(
          `x_language_line_ids[${index}].x_language_name`,
          languageName,
        ),
        x_working_level: requireValue(
          `x_language_line_ids[${index}].x_working_level`,
          mapSelection(
            selectionMaps.workingLevel,
            pick(row, ["working_level", "workingLevel", "level"]),
          ),
        ),
        x_notes: cleanString(pick(row, ["notes", "note"])),
      });
    })
    .filter(Boolean),
  x_commitment_line_ids: commitments
    .map((row, index) => {
      const commitmentTypeId = toInt(
        pick(row, ["odoo_id", "odooId", "commitment_type_odoo_id", "commitment_type.id", "id"]),
      );

      return commandCreate({
        x_sequence: index + 1,
        x_commitment_type_id: requireValue(
          `x_commitment_line_ids[${index}].x_commitment_type_id`,
          commitmentTypeId,
        ),
        x_frequency: mapSelection(
          selectionMaps.frequency,
          pick(row, ["frequency", "frequency_label"]),
        ),
        x_notes: cleanString(pick(row, ["notes", "note"])),
      });
    })
    .filter(Boolean),
});

return {
  json: {
    odoo_model: "x_hr.pool",
    odoo_payload: odooPayload,
  },
};
