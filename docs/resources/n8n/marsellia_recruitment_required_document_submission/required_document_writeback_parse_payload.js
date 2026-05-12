/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Parse Fillout Payload
 * Module: required_document_writeback_parse_payload.js
 *
 * Input:
 * - n8n Webhook node item(s)
 * - Expected Fillout payload shape:
 *   body.formId
 *   body.formName
 *   body.submission.submissionId
 *   body.submission.submissionTime
 *   body.submission.lastUpdatedAt
 *   body.submission.questions
 *   body.submission.urlParameters
 *
 * Output:
 * - One normalized JSON item per webhook item.
 *
 * Related contract:
 * docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md
 */

const EXPECTED_FORM_ID = "sZFxwo2u1bus";

const CONFIG = {
    parserVersion: "6C-5A",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    includeDebugPayload: false,
};

const PUBLIC_SECTION_PREFIXES = [
    "cv",
    "qualification",
    "birth_certificate",
    "family_status",
    "residence_certificate",
    "national_id",
    "criminal_record",
    "health_certificate",
    "passport",
    "id_card",
    "driving_license",
    "non_duplication_certificate",
    "bank_information",
];

const NON_PUBLIC_SECTION_PREFIXES = [
    "passport_photos",
];

const SECTION_ROUTING_FIELD_SUFFIXES = new Set([
    "show",
    "request_line_id",
    "checklist_line_id",
    "document_type_id",
    "document_code",
]);

function isSectionRoutingField(prefix, fieldName) {
    if (!fieldName || !fieldName.startsWith(`${prefix}_`)) return false;

    const suffix = fieldName.slice(prefix.length + 1);
    return SECTION_ROUTING_FIELD_SUFFIXES.has(suffix);
}

const IGNORED_URL_PARAMETER_NAMES = new Set([
    "generated_url",
]);

const FIELD_ID_TO_CANONICAL_NAME = {
    "4qDA": "form_base_url",
    "9jDc": "request_reference",
    "jU4d": "token_reference",
    "11E1": "state",
    "m3pV": "candidate_name",
    "ukoR": "candidate_email",
    "hgtH": "odoo_request_id",
    "6h4X": "odoo_applicant_id",
    "rKQf": "odoo_checklist_id",
    "e538": "odoo_request_id",
    "qamX": "expires_at",
    "ioYz": "sent_at",
    "12mB": "last_response_at",

    "iEoh": "cv_file_upload",
    "66uF": "cv_notes",

    "jzWb": "qualification_file_upload",
    "rfRH": "qualification_document_number",
    "dvmD": "qualification_subject",
    "pnZ3": "qualification_type",
    "jSpv": "qualification_issuing_authority",
    "wXi5": "qualification_place_of_issue",
    "5UjP": "qualification_date_of_issue",
    "sDDB": "qualification_date_of_expiry",
    "ewg6": "qualification_notes",

    "c7Fa": "birth_certificate_file_upload",
    "eXE9": "date_of_birth",
    "jman": "place_of_birth",
    "tdTT": "country_of_birth",
    "kzKV": "birth_certificate_document_number",
    "gNr5": "birth_certificate_issuing_authority",
    "e4ef": "birth_certificate_place_of_issue",
    "uxFt": "birth_certificate_date_of_issue",
    "jUCa": "birth_certificate_date_of_expiry",
    "mz3F": "birth_certificate_notes",

    "1KXp": "family_status_file_upload",
    "c8Jz": "family_reference_number",
    "gLB5": "family_paper_number",
    "c1hW": "next_of_kin_phone",
    "epgD": "next_of_kin_name",
    "qDRY": "family_status_document_number",
    "9vz5": "family_status_issuing_authority",
    "4JR6": "family_status_place_of_issue",
    "22QV": "family_status_date_of_issue",
    "vxXB": "family_status_date_of_expiry",
    "tjsQ": "family_status_notes",

    "hyYw": "residence_certificate_file_upload",
    "ksVL": "residence_certificate_document_number",
    "ifcA": "residence_certificate_issuing_authority",
    "u1dZ": "residence_certificate_place_of_issue",
    "1QHD": "residence_certificate_date_of_issue",
    "pC8G": "residence_certificate_date_of_expiry",
    "4ny8": "residence_certificate_notes",

    "poLi": "national_id_file_upload",
    "xuPR": "national_id_document_number",
    "2enp": "national_id_issuing_authority",
    "uPi7": "national_id_place_of_issue",
    "cdaF": "national_id_date_of_issue",
    "bzXp": "national_id_date_of_expiry",
    "tXhc": "national_id_notes",

    "tyRF": "criminal_record_file_upload",
    "4432": "criminal_record_document_number",
    "iTuG": "criminal_record_issuing_authority",
    "6XRN": "criminal_record_place_of_issue",
    "gU6k": "criminal_record_date_of_issue",
    "1WFQ": "criminal_record_date_of_expiry",
    "82VC": "criminal_record_notes",

    "9QRg": "health_certificate_file_upload",
    "jqxu": "blood_type",
    "oeaH": "health_certificate_document_number",
    "qire": "health_certificate_issuing_authority",
    "m6sx": "health_certificate_place_of_issue",
    "mTnb": "health_certificate_date_of_issue",
    "rLtb": "health_certificate_date_of_expiry",
    "6Lxr": "health_certificate_notes",

    "couc": "passport_file_upload",
    "8P7s": "passport_document_number",
    "nuRr": "passport_issuing_authority",
    "2A52": "passport_place_of_issue",
    "4Jsq": "passport_date_of_issue",
    "gho6": "passport_date_of_expiry",
    "s1Xy": "passport_notes",

    "fmfU": "id_card_file_upload",
    "9HJb": "id_card_document_number",
    "xjzj": "id_card_issuing_authority",
    "gdEy": "id_card_place_of_issue",
    "ssVb": "id_card_date_of_issue",
    "iqUf": "id_card_date_of_expiry",
    "aakM": "id_card_notes",

    "iMXW": "driving_license_file_upload",
    "vfQj": "driving_license_document_number",
    "mGdT": "driving_license_issuing_authority",
    "bMYb": "driving_license_place_of_issue",
    "uKdZ": "driving_license_date_of_issue",
    "cCiZ": "driving_license_date_of_expiry",
    "9Rzj": "driving_license_notes",

    "c7Z2": "non_duplication_certificate_file_upload",
    "18YW": "non_duplication_certificate_document_number",
    "jDfS": "non_duplication_certificate_issuing_authority",
    "qFjp": "non_duplication_certificate_place_of_issue",
    "jsEL": "non_duplication_certificate_date_of_issue",
    "miDH": "non_duplication_certificate_date_of_expiry",
    "gwFN": "non_duplication_certificate_notes",

    "5U3s": "account_number",
    "32uF": "bank_branch",
    "tJF4": "bank_name",
    "pvXT": "iban",
    "7jUn": "bank_notes",
    "jpNf": "form_notes",
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function firstNonEmpty(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return null;
}

function normalizeScalar(value) {
    if (Array.isArray(value)) {
        return value.length ? normalizeScalar(value[0]) : null;
    }

    if (isObject(value)) {
        if ("odoo_id" in value) return normalizeScalar(value.odoo_id);
        if ("value" in value) return normalizeScalar(value.value);
        if ("answer" in value) return normalizeScalar(value.answer);
        if ("text" in value) return normalizeScalar(value.text);
        if ("label" in value) return normalizeScalar(value.label);
        if ("id" in value) return normalizeScalar(value.id);
        if ("recordID" in value) return normalizeScalar(value.recordID);
    }

    if (value === undefined || value === null || value === "") return null;

    return String(value);
}

function normalizeBooleanFlag(value) {
    const scalar = normalizeScalar(value);
    if (scalar === null) return false;

    return ["1", "true", "yes", "y", "on"].includes(
        String(scalar).trim().toLowerCase()
    );
}

function normalizeUrlParameters(raw) {
    if (!raw) return {};

    if (isObject(raw)) {
        const result = {};
        for (const [key, value] of Object.entries(raw)) {
            if (!IGNORED_URL_PARAMETER_NAMES.has(String(key))) {
                result[key] = normalizeScalar(value);
            }
        }
        return result;
    }

    if (Array.isArray(raw)) {
        const result = {};

        for (const item of raw) {
            if (!isObject(item)) continue;

            const key = firstNonEmpty(
                item.name,
                item.key,
                item.id,
                item.field,
                item.parameter
            );

            if (!key) continue;

            if (IGNORED_URL_PARAMETER_NAMES.has(String(key))) continue;

            result[String(key)] = normalizeScalar(
                firstNonEmpty(item.value, item.answer, item.text)
            );
        }

        return result;
    }

    return {};
}

function getQuestionValue(question) {
    if (!isObject(question)) return null;

    return firstNonEmpty(
        question.value,
        question.answer,
        question.answers,
        question.response,
        question.text,
        question.files,
        question.file,
        question.url
    );
}

function questionLooksLikeFile(question) {
    if (!isObject(question)) return false;

    const type = normalizeScalar(question.type);
    if (type && type.toLowerCase().includes("file")) return true;

    const value = getQuestionValue(question);

    if (Array.isArray(value)) {
        return value.some((entry) => isObject(entry) && (
            "url" in entry ||
            "downloadUrl" in entry ||
            "filename" in entry ||
            "fileName" in entry ||
            "name" in entry
        ));
    }

    if (isObject(value)) {
        return (
            "url" in value ||
            "downloadUrl" in value ||
            "filename" in value ||
            "fileName" in value ||
            "name" in value
        );
    }

    return false;
}

function normalizeFileEntries(value) {
    if (!value) return [];

    const rawEntries = Array.isArray(value) ? value : [value];

    return rawEntries
        .filter((entry) => entry !== undefined && entry !== null && entry !== "")
        .map((entry) => {
            let normalized;

            if (typeof entry === "string") {
                normalized = {
                    url: entry,
                    fileName: null,
                    mimeType: null,
                    size: null,
                };
            } else if (isObject(entry)) {
                normalized = {
                    url: firstNonEmpty(entry.url, entry.downloadUrl, entry.href, entry.link),
                    fileName: firstNonEmpty(entry.filename, entry.fileName, entry.name),
                    mimeType: firstNonEmpty(entry.mimeType, entry.mimetype, entry.type),
                    size: firstNonEmpty(entry.size, entry.sizeBytes, entry.fileSize),
                };
            } else {
                normalized = {
                    url: null,
                    fileName: null,
                    mimeType: null,
                    size: null,
                };
            }

            if (CONFIG.includeDebugPayload) {
                normalized.raw = entry;
            }

            return normalized;
        });
}

function normalizeQuestions(rawQuestions) {
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];

    const byId = {};
    const byName = {};
    const byCanonicalName = {};
    const byOriginalName = {};
    const byLabel = {};
    const filesByName = {};

    for (const question of questions) {
        if (!isObject(question)) continue;

        const id = firstNonEmpty(question.id, question.questionId, question.fieldId);
        const originalName = firstNonEmpty(question.name, question.key, question.slug);
        const canonicalName = id && FIELD_ID_TO_CANONICAL_NAME[id]
            ? FIELD_ID_TO_CANONICAL_NAME[id]
            : originalName;

        const label = firstNonEmpty(question.label, question.question, question.title);
        const value = getQuestionValue(question);
        const normalizedValue = normalizeScalar(value);
        const isFile = questionLooksLikeFile(question);

        const normalizedQuestion = {
            id,
            name: canonicalName,
            canonicalName,
            originalName,
            label,
            type: firstNonEmpty(question.type, question.fieldType),
            value,
            normalizedValue,
            isFile,
            files: isFile ? normalizeFileEntries(value) : [],
            raw: question,
        };

        if (id) byId[String(id)] = normalizedQuestion;
        if (canonicalName) {
            byName[String(canonicalName)] = normalizedQuestion;
            byCanonicalName[String(canonicalName)] = normalizedQuestion;
        }
        if (originalName) byOriginalName[String(originalName)] = normalizedQuestion;
        if (label) byLabel[String(label)] = normalizedQuestion;

        if (canonicalName && normalizedQuestion.isFile) {
            filesByName[String(canonicalName)] = normalizedQuestion.files;
        }
    }

    return {
        raw: questions,
        byId,
        byName,
        byCanonicalName,
        byOriginalName,
        byLabel,
        filesByName,
    };
}

function getQuestionByName(questionIndex, name) {
    if (!questionIndex) return null;

    if (questionIndex.byCanonicalName && questionIndex.byCanonicalName[name]) {
        return questionIndex.byCanonicalName[name];
    }

    if (questionIndex.byName && questionIndex.byName[name]) {
        return questionIndex.byName[name];
    }

    return null;
}

function getQuestionScalar(questionIndex, name) {
    const question = getQuestionByName(questionIndex, name);
    return question ? question.normalizedValue : null;
}

function getQuestionFiles(questionIndex, name) {
    const question = getQuestionByName(questionIndex, name);
    return question && Array.isArray(question.files) ? question.files : [];
}

function collectPrefixedScalarFields(prefix, questionIndex, uploadFieldName) {
    const scalarFields = {};
    const names = Object.keys(questionIndex.byName || {})
        .filter((key) => key === prefix || key.startsWith(`${prefix}_`));

    for (const fieldName of names) {
        if (fieldName === uploadFieldName) continue;
        if (isSectionRoutingField(prefix, fieldName)) continue;

        scalarFields[fieldName] = getQuestionScalar(questionIndex, fieldName);
    }

    return scalarFields;
}

function addKnownNonPrefixedFields(prefix, questionIndex, scalarFields) {
    if (prefix === "birth_certificate") {
        for (const fieldName of ["date_of_birth", "place_of_birth", "country_of_birth"]) {
            scalarFields[fieldName] = getQuestionScalar(questionIndex, fieldName);
        }
    }

    if (prefix === "family_status") {
        for (const fieldName of [
            "family_paper_number",
            "family_reference_number",
            "next_of_kin_name",
            "next_of_kin_phone",
        ]) {
            scalarFields[fieldName] = getQuestionScalar(questionIndex, fieldName);
        }
    }

    if (prefix === "health_certificate") {
        scalarFields.blood_type = getQuestionScalar(questionIndex, "blood_type");
    }

    if (prefix === "bank_information") {
        for (const fieldName of [
            "bank_name",
            "bank_branch",
            "account_number",
            "iban",
            "bank_notes",
        ]) {
            scalarFields[fieldName] = getQuestionScalar(questionIndex, fieldName);
        }
    }

    return scalarFields;
}

function buildSection(prefix, urlParams, questionIndex) {
    const show = normalizeBooleanFlag(urlParams[`${prefix}_show`]);

    const routing = {
        show,
        requestLineId: normalizeScalar(urlParams[`${prefix}_request_line_id`]),
        checklistLineId: normalizeScalar(urlParams[`${prefix}_checklist_line_id`]),
        documentTypeId: normalizeScalar(urlParams[`${prefix}_document_type_id`]),
        documentCode: normalizeScalar(urlParams[`${prefix}_document_code`]),
    };

    const uploadFieldName = prefix === "bank_information"
        ? null
        : `${prefix}_file_upload`;

    const files = uploadFieldName
        ? getQuestionFiles(questionIndex, uploadFieldName)
        : [];

    let scalarFields = collectPrefixedScalarFields(prefix, questionIndex, uploadFieldName);
    scalarFields = addKnownNonPrefixedFields(prefix, questionIndex, scalarFields);

    const hasStructuredData = Object.values(scalarFields).some((value) => {
        return value !== undefined && value !== null && value !== "";
    });

    return {
        prefix,
        routing,
        uploadFieldName,
        files,
        scalarFields,
        hasFiles: files.length > 0,
        hasStructuredData,
        hasPayload: files.length > 0 || hasStructuredData,
        rawStatus: show ? "requested" : "skipped_not_requested",
    };
}

function getPayloadFromItem(item) {
    const json = item && item.json ? item.json : {};

    if (json.body && isObject(json.body)) return json.body;

    return json;
}

function buildRequestEnvelope(urlParameters) {
    return {
        odooRequestId: normalizeScalar(urlParameters.odoo_request_id),
        odooApplicantId: normalizeScalar(urlParameters.odoo_applicant_id),
        odooChecklistId: normalizeScalar(urlParameters.odoo_checklist_id),
        requestReference: normalizeScalar(urlParameters.request_reference),
        candidateName: normalizeScalar(urlParameters.candidate_name),
        candidateEmail: normalizeScalar(urlParameters.candidate_email),
        tokenReference: normalizeScalar(urlParameters.token_reference),
        expiresAt: normalizeScalar(urlParameters.expires_at),
        formBaseUrl: normalizeScalar(urlParameters.form_base_url),
        state: normalizeScalar(urlParameters.state),
        sentAt: normalizeScalar(urlParameters.sent_at),
        lastResponseAt: normalizeScalar(urlParameters.last_response_at),
    };
}

function buildValidationHints(payload, submission, request) {
    const validationHints = [];

    if (payload.formId !== EXPECTED_FORM_ID) {
        validationHints.push({
            level: "error",
            code: "unexpected_form_id",
            message: `Expected formId ${EXPECTED_FORM_ID}, received ${payload.formId || "empty"}.`,
        });
    }

    if (!submission.submissionId) {
        validationHints.push({
            level: "error",
            code: "missing_submission_id",
            message: "Fillout submissionId is missing.",
        });
    }

    if (!submission.urlParameters) {
        validationHints.push({
            level: "error",
            code: "missing_url_parameters",
            message: "Fillout urlParameters object is missing.",
        });
    }

    for (const key of [
        "odooRequestId",
        "odooApplicantId",
        "odooChecklistId",
        "tokenReference",
    ]) {
        if (!request[key]) {
            validationHints.push({
                level: "error",
                code: `missing_${key}`,
                message: `Request envelope value is missing: ${key}.`,
            });
        }
    }

    return validationHints;
}

function parseItem(item, itemIndex) {
    const payload = getPayloadFromItem(item);
    const submission = payload.submission || {};
    const urlParameters = normalizeUrlParameters(submission.urlParameters);
    const questionIndex = normalizeQuestions(submission.questions);
    const request = buildRequestEnvelope(urlParameters);
    const formNotes = getQuestionScalar(questionIndex, "form_notes");

    const sections = PUBLIC_SECTION_PREFIXES.map((prefix) => {
        return buildSection(prefix, urlParameters, questionIndex);
    });

    const requestedSections = sections.filter((section) => section.routing.show);
    const sectionsWithPayload = sections.filter((section) => section.hasPayload);
    const validationHints = buildValidationHints(payload, submission, request);

    const parsed = {
        parser: {
            module: "required_document_writeback_parse_payload.js",
            version: CONFIG.parserVersion,
            workflow: CONFIG.workflow,
            itemIndex,
            parsedAt: new Date().toISOString(),
            compactOutput: !CONFIG.includeDebugPayload,
        },
        form: {
            id: payload.formId || null,
            name: payload.formName || null,
            expectedFormId: EXPECTED_FORM_ID,
            isExpectedForm: payload.formId === EXPECTED_FORM_ID,
        },
        submission: {
            id: submission.submissionId || null,
            submissionTime: submission.submissionTime || null,
            lastUpdatedAt: submission.lastUpdatedAt || null,
        },
        request,
        formNotes,
        urlParameters,
        sections,
        constants: {
            publicSectionPrefixes: PUBLIC_SECTION_PREFIXES,
            nonPublicSectionPrefixes: NON_PUBLIC_SECTION_PREFIXES,
            fieldIdMapVersion: "6C-2A",
            compactParserVersion: CONFIG.parserVersion,
        },
        summary: {
            questionCount: questionIndex.raw.length,
            urlParameterCount: Object.keys(urlParameters).length,
            sectionCount: sections.length,
            requestedSectionCount: requestedSections.length,
            sectionsWithPayloadCount: sectionsWithPayload.length,
            requestedPrefixes: requestedSections.map((section) => section.prefix),
            payloadPrefixes: sectionsWithPayload.map((section) => section.prefix),
            validationHintCount: validationHints.length,
        },
        validationHints,
    };

    if (CONFIG.includeDebugPayload) {
        parsed.questionIndex = questionIndex;
        parsed.raw = {
            payload,
        };
    }

    return parsed;
}

const inputItems = $input.all();

return inputItems.map((item, index) => {
    return {
        json: parseItem(item, index),
    };
});