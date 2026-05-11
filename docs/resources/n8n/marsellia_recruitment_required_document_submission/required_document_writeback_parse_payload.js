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
        if ("value" in value) return normalizeScalar(value.value);
        if ("answer" in value) return normalizeScalar(value.answer);
        if ("text" in value) return normalizeScalar(value.text);
        if ("label" in value) return normalizeScalar(value.label);
        if ("id" in value) return normalizeScalar(value.id);
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
            result[key] = normalizeScalar(value);
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
            if (typeof entry === "string") {
                return {
                    url: entry,
                    fileName: null,
                    mimeType: null,
                    size: null,
                    raw: entry,
                };
            }

            if (isObject(entry)) {
                return {
                    url: firstNonEmpty(entry.url, entry.downloadUrl, entry.href, entry.link),
                    fileName: firstNonEmpty(entry.filename, entry.fileName, entry.name),
                    mimeType: firstNonEmpty(entry.mimeType, entry.mimetype, entry.type),
                    size: firstNonEmpty(entry.size, entry.sizeBytes, entry.fileSize),
                    raw: entry,
                };
            }

            return {
                url: null,
                fileName: null,
                mimeType: null,
                size: null,
                raw: entry,
            };
        });
}

function normalizeQuestions(rawQuestions) {
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];

    const byId = {};
    const byName = {};
    const byLabel = {};
    const filesByName = {};

    for (const question of questions) {
        if (!isObject(question)) continue;

        const id = firstNonEmpty(question.id, question.questionId, question.fieldId);
        const name = firstNonEmpty(question.name, question.key, question.slug);
        const label = firstNonEmpty(question.label, question.question, question.title);
        const value = getQuestionValue(question);
        const normalizedValue = normalizeScalar(value);
        const isFile = questionLooksLikeFile(question);

        const normalizedQuestion = {
            id,
            name,
            label,
            type: firstNonEmpty(question.type, question.fieldType),
            value,
            normalizedValue,
            isFile,
            files: isFile ? normalizeFileEntries(value) : [],
            raw: question,
        };

        if (id) byId[String(id)] = normalizedQuestion;
        if (name) byName[String(name)] = normalizedQuestion;
        if (label) byLabel[String(label)] = normalizedQuestion;

        if (name && normalizedQuestion.isFile) {
            filesByName[String(name)] = normalizedQuestion.files;
        }
    }

    return {
        raw: questions,
        byId,
        byName,
        byLabel,
        filesByName,
    };
}

function getQuestionByName(questionIndex, name) {
    if (!questionIndex || !questionIndex.byName) return null;
    return questionIndex.byName[name] || null;
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

    const sections = PUBLIC_SECTION_PREFIXES.map((prefix) => {
        return buildSection(prefix, urlParameters, questionIndex);
    });

    const requestedSections = sections.filter((section) => section.routing.show);
    const sectionsWithPayload = sections.filter((section) => section.hasPayload);
    const validationHints = buildValidationHints(payload, submission, request);

    return {
        parser: {
            module: "required_document_writeback_parse_payload.js",
            version: "6C-2",
            workflow: "Marsellia | Recruitment | Required Document Submission",
            itemIndex,
            parsedAt: new Date().toISOString(),
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
        urlParameters,
        questionIndex,
        sections,
        constants: {
            publicSectionPrefixes: PUBLIC_SECTION_PREFIXES,
            nonPublicSectionPrefixes: NON_PUBLIC_SECTION_PREFIXES,
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
        raw: {
            payload,
        },
    };
}

const inputItems = $input.all();

return inputItems.map((item, index) => {
    return {
        json: parseItem(item, index),
    };
});