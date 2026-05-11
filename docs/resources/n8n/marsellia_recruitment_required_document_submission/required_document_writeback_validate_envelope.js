/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Validate Odoo Envelope
 * Module: required_document_writeback_validate_envelope.js
 *
 * Pass 6C-3A rate-limit-safe variant:
 * - Uses only two Odoo HTTP lookups:
 *   1) Lookup Odoo Request
 *   2) Lookup Odoo Request Lines
 * - Does not call checklist lines separately.
 *
 * Related contract:
 * docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md
 */

const CONFIG = {
    moduleVersion: "6C-3A",
    probeModeAllowPrepared: true,
    nodeNames: {
        parsePayload: "Parse Fillout Payload",
        lookupRequest: "Lookup Odoo Request",
        lookupRequestLines: "Lookup Odoo Request Lines",
    },
    allowedRequestStatesForProbe: ["sent", "prepared"],
    allowedRequestStatesProduction: ["sent"],
    allowedRequestLineStates: ["requested", "submitted"],
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeScalar(value) {
    if (Array.isArray(value)) {
        return value.length ? normalizeScalar(value[0]) : null;
    }

    if (isObject(value)) {
        if ("id" in value) return normalizeScalar(value.id);
        if ("value" in value) return normalizeScalar(value.value);
        if ("odoo_id" in value) return normalizeScalar(value.odoo_id);
    }

    if (value === undefined || value === null || value === "") return null;

    return String(value);
}

function extractOdooId(value) {
    return normalizeScalar(value);
}

function sameId(left, right) {
    const a = extractOdooId(left);
    const b = extractOdooId(right);
    return a !== null && b !== null && String(a) === String(b);
}

function normalizeBoolean(value) {
    if (value === true) return true;
    if (value === false) return false;

    const scalar = normalizeScalar(value);
    if (scalar === null) return false;

    return ["1", "true", "yes", "y", "on"].includes(
        String(scalar).trim().toLowerCase()
    );
}

function getNodeItems(nodeName) {
    try {
        if (typeof $items === "function") {
            return $items(nodeName) || [];
        }
    } catch (error) {
        return [];
    }

    return [];
}

function normalizeRecord(record) {
    if (!isObject(record)) return null;

    if (record.json && isObject(record.json)) return normalizeRecord(record.json);
    if (record.record && isObject(record.record)) return normalizeRecord(record.record);

    return record;
}

function flattenRecordsFromItems(items) {
    const records = [];

    for (const item of items || []) {
        const json = item && item.json ? item.json : item;

        if (Array.isArray(json)) {
            for (const entry of json) {
                const normalized = normalizeRecord(entry);
                if (normalized) records.push(normalized);
            }
            continue;
        }

        if (isObject(json) && Array.isArray(json.records)) {
            for (const entry of json.records) {
                const normalized = normalizeRecord(entry);
                if (normalized) records.push(normalized);
            }
            continue;
        }

        if (isObject(json) && Array.isArray(json.data)) {
            for (const entry of json.data) {
                const normalized = normalizeRecord(entry);
                if (normalized) records.push(normalized);
            }
            continue;
        }

        if (isObject(json) && Array.isArray(json.result)) {
            for (const entry of json.result) {
                const normalized = normalizeRecord(entry);
                if (normalized) records.push(normalized);
            }
            continue;
        }

        const normalized = normalizeRecord(json);
        if (normalized) records.push(normalized);
    }

    return records;
}

function getRecordsFromNode(nodeName) {
    return flattenRecordsFromItems(getNodeItems(nodeName));
}

function getParsedPayload() {
    const parsedItems = getNodeItems(CONFIG.nodeNames.parsePayload);

    if (parsedItems.length) {
        const first = parsedItems[0];
        return first && first.json ? first.json : first;
    }

    const inputItems = $input.all();
    if (inputItems.length) {
        const first = inputItems[0];
        return first && first.json ? first.json : first;
    }

    return {};
}

function byId(records) {
    const result = {};

    for (const record of records || []) {
        const id = extractOdooId(record.id);
        if (id !== null) {
            result[String(id)] = record;
        }
    }

    return result;
}

function parseDateTime(value) {
    const scalar = normalizeScalar(value);
    if (!scalar) return null;

    let text = String(scalar).trim();

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(text)) {
        text = text.replace(" ", "T");
    }

    text = text.replace(/(\.\d{3})\d+/, "$1");

    if (/^\d{4}-\d{2}-\d{2}T/.test(text) && !/(Z|[+-]\d{2}:?\d{2})$/.test(text)) {
        text += "Z";
    }

    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return null;

    return date;
}

function makeIssue(level, code, message, context = {}) {
    return { level, code, message, context };
}

function getAllowedRequestStates() {
    return CONFIG.probeModeAllowPrepared
        ? CONFIG.allowedRequestStatesForProbe
        : CONFIG.allowedRequestStatesProduction;
}

function validateEnvelope(parsed, requestRecord, now) {
    const errors = [];
    const warnings = [];
    const request = parsed.request || {};

    for (const hint of parsed.validationHints || []) {
        if (hint.level === "error") {
            errors.push(makeIssue("error", hint.code, hint.message));
        } else {
            warnings.push(makeIssue("warning", hint.code, hint.message));
        }
    }

    if (!requestRecord) {
        errors.push(makeIssue(
            "error",
            "odoo_request_not_found",
            "Odoo submission request was not found from odoo_request_id.",
            { odooRequestId: request.odooRequestId }
        ));

        return {
            status: "invalid",
            errors,
            warnings,
            requestRecordFound: false,
        };
    }

    if (!sameId(requestRecord.id, request.odooRequestId)) {
        errors.push(makeIssue(
            "error",
            "request_id_mismatch",
            "Odoo request ID does not match parsed request ID."
        ));
    }

    if (normalizeScalar(requestRecord.x_token_reference) !== normalizeScalar(request.tokenReference)) {
        errors.push(makeIssue(
            "error",
            "token_reference_mismatch",
            "Token reference does not match the Odoo request."
        ));
    }

    if (!sameId(requestRecord.x_applicant_id, request.odooApplicantId)) {
        errors.push(makeIssue(
            "error",
            "applicant_id_mismatch",
            "Applicant ID does not match the Odoo request."
        ));
    }

    if (!sameId(requestRecord.x_checklist_id, request.odooChecklistId)) {
        errors.push(makeIssue(
            "error",
            "checklist_id_mismatch",
            "Checklist ID does not match the Odoo request."
        ));
    }

    const requestState = normalizeScalar(requestRecord.x_state);
    const allowedStates = getAllowedRequestStates();

    if (!allowedStates.includes(requestState)) {
        errors.push(makeIssue(
            "error",
            "invalid_request_state",
            "Odoo request is not in an allowed state for writeback.",
            { state: requestState, allowedStates }
        ));
    }

    if (requestState === "prepared" && CONFIG.probeModeAllowPrepared) {
        warnings.push(makeIssue(
            "warning",
            "prepared_state_allowed_for_probe",
            "Prepared request state is allowed during the Pass 6C probe. Production should require sent."
        ));
    }

    const expiry = parseDateTime(requestRecord.x_expires_at || request.expiresAt);

    if (!expiry) {
        errors.push(makeIssue(
            "error",
            "missing_or_invalid_expiry",
            "Request expiry is missing or invalid."
        ));
    } else if (expiry.getTime() < now.getTime()) {
        errors.push(makeIssue(
            "error",
            "request_expired",
            "Submission request has expired.",
            { expiresAt: expiry.toISOString() }
        ));
    }

    return {
        status: errors.length ? "invalid" : (warnings.length ? "valid_with_warnings" : "valid"),
        errors,
        warnings,
        requestRecordFound: true,
        requestState,
        allowedStates,
        expiresAt: expiry ? expiry.toISOString() : null,
    };
}

function validateSection(section, parsed, requestLineById) {
    const errors = [];
    const warnings = [];

    if (!section.routing || !section.routing.show) {
        return {
            ...section,
            validation: {
                status: "skipped_not_requested",
                isValidForWriteback: false,
                errors,
                warnings,
            },
        };
    }

    const request = parsed.request || {};
    const routing = section.routing;

    const requestLineId = normalizeScalar(routing.requestLineId);
    const checklistLineId = normalizeScalar(routing.checklistLineId);
    const documentTypeId = normalizeScalar(routing.documentTypeId);
    const documentCode = normalizeScalar(routing.documentCode);

    if (!requestLineId) {
        errors.push(makeIssue("error", "missing_request_line_id", "Requested section is missing request line ID."));
    }

    if (!checklistLineId) {
        errors.push(makeIssue("error", "missing_checklist_line_id", "Requested section is missing checklist line ID."));
    }

    if (!documentTypeId) {
        errors.push(makeIssue("error", "missing_document_type_id", "Requested section is missing document type ID."));
    }

    if (!documentCode) {
        errors.push(makeIssue("error", "missing_document_code", "Requested section is missing document code."));
    }

    const requestLine = requestLineId ? requestLineById[String(requestLineId)] : null;

    if (!requestLine) {
        errors.push(makeIssue(
            "error",
            "request_line_not_found",
            "Odoo request line was not found.",
            { requestLineId }
        ));
    }

    if (requestLine) {
        if (!sameId(requestLine.x_request_id, request.odooRequestId)) {
            errors.push(makeIssue(
                "error",
                "request_line_request_mismatch",
                "Request line does not belong to the Odoo request."
            ));
        }

        if (!sameId(requestLine.x_applicant_id, request.odooApplicantId)) {
            errors.push(makeIssue(
                "error",
                "request_line_applicant_mismatch",
                "Request line applicant does not match request envelope."
            ));
        }

        if (!sameId(requestLine.x_checklist_id, request.odooChecklistId)) {
            errors.push(makeIssue(
                "error",
                "request_line_checklist_mismatch",
                "Request line checklist does not match request envelope."
            ));
        }

        if (!sameId(requestLine.x_checklist_line_id, checklistLineId)) {
            errors.push(makeIssue(
                "error",
                "request_line_checklist_line_mismatch",
                "Request line checklist line does not match section routing."
            ));
        }

        if (!sameId(requestLine.x_document_type_id, documentTypeId)) {
            errors.push(makeIssue(
                "error",
                "request_line_document_type_mismatch",
                "Request line document type does not match section routing."
            ));
        }

        if (normalizeScalar(requestLine.x_document_code) !== documentCode) {
            errors.push(makeIssue(
                "error",
                "request_line_document_code_mismatch",
                "Request line document code does not match section routing."
            ));
        }

        const requestLineState = normalizeScalar(requestLine.x_state);

        if (!CONFIG.allowedRequestLineStates.includes(requestLineState)) {
            errors.push(makeIssue(
                "error",
                "invalid_request_line_state",
                "Request line is not in an allowed state for writeback.",
                { state: requestLineState, allowedStates: CONFIG.allowedRequestLineStates }
            ));
        }

        if (!normalizeBoolean(requestLine.x_public_request_enabled)) {
            errors.push(makeIssue(
                "error",
                "request_line_not_public",
                "Request line is not public request enabled."
            ));
        }
    }

    const status = errors.length ? "invalid" : (warnings.length ? "valid_with_warnings" : "valid");

    return {
        ...section,
        odoo: {
            requestLine,
        },
        validation: {
            status,
            isValidForWriteback: !errors.length,
            errors,
            warnings,
        },
    };
}

const parsed = getParsedPayload();

const requestRecords = getRecordsFromNode(CONFIG.nodeNames.lookupRequest);
const requestLineRecords = getRecordsFromNode(CONFIG.nodeNames.lookupRequestLines);

const requestById = byId(requestRecords);
const requestLineById = byId(requestLineRecords);

const requestId = parsed.request ? parsed.request.odooRequestId : null;
const requestRecord = requestId ? requestById[String(requestId)] : null;

const now = new Date();

const envelope = validateEnvelope(parsed, requestRecord, now);

const validatedSections = (parsed.sections || []).map((section) => {
    return validateSection(section, parsed, requestLineById);
});

const requestedSections = validatedSections.filter((section) => section.routing && section.routing.show);
const validRequestedSections = requestedSections.filter((section) => section.validation && section.validation.isValidForWriteback);
const invalidRequestedSections = requestedSections.filter((section) => section.validation && section.validation.status === "invalid");

const envelopeValid = envelope.status === "valid" || envelope.status === "valid_with_warnings";
const canProceed = envelopeValid && validRequestedSections.length > 0;

let status = "invalid";
if (canProceed && invalidRequestedSections.length) {
    status = "partial_valid";
} else if (canProceed) {
    status = "valid";
}

return [
    {
        json: {
            ...parsed,
            sections: validatedSections,
            odooLookup: {
                requestRecordFound: !!requestRecord,
                requestRecord,
                requestRecordCount: requestRecords.length,
                requestLineRecordCount: requestLineRecords.length,
            },
            validation: {
                module: "required_document_writeback_validate_envelope.js",
                version: CONFIG.moduleVersion,
                workflow: "Marsellia | Recruitment | Required Document Submission",
                checkedAt: now.toISOString(),
                probeModeAllowPrepared: CONFIG.probeModeAllowPrepared,
                status,
                canProceed,
                envelope,
                sectionSummary: {
                    requestedSectionCount: requestedSections.length,
                    validRequestedSectionCount: validRequestedSections.length,
                    invalidRequestedSectionCount: invalidRequestedSections.length,
                    validPrefixes: validRequestedSections.map((section) => section.prefix),
                    invalidPrefixes: invalidRequestedSections.map((section) => section.prefix),
                },
            },
        },
    },
];