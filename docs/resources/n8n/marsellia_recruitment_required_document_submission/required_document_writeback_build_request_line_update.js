/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Build Request Line Update
 * Module: required_document_writeback_build_request_line_update.js
 *
 * Pass 6C-4H:
 * - Reads created required-document submission ID from Create Odoo Submission.
 * - Reattaches compact writeback item from Build Submission Payload.
 * - Builds Odoo request-line write payload.
 */

const CONFIG = {
    moduleVersion: "6C-5D",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    sourceNodeName: "Build Submission Payload",
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extractCreatedId(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        return Number.parseInt(value.trim(), 10);
    }

    if (Array.isArray(value)) {
        for (const entry of value) {
            const id = extractCreatedId(entry);
            if (id) return id;
        }
    }

    if (isObject(value)) {
        for (const key of ["id", "result", "data", "value", "body"]) {
            if (key in value) {
                const id = extractCreatedId(value[key]);
                if (id) return id;
            }
        }
    }

    return null;
}

function getSourceItem() {
    // Best path inside Loop Over Items: linked item from the previous node.
    try {
        const linked = $(CONFIG.sourceNodeName).item;
        if (linked && linked.json) {
            return linked.json;
        }
    } catch (error) {
        // Fall through to fallback path.
    }

    // Fallback for non-loop/manual testing.
    try {
        const sourceItems = $items(CONFIG.sourceNodeName);
        if (sourceItems && sourceItems.length) {
            return sourceItems[0].json || sourceItems[0];
        }
    } catch (error) {
        // Fall through.
    }

    throw new Error(`Could not read linked source item from node: ${CONFIG.sourceNodeName}`);
}


const source = getSourceItem();
const submissionResponse = $json;
const submissionId = extractCreatedId(submissionResponse);

if (!submissionId) {
    throw new Error(`Could not extract created submission ID from response: ${JSON.stringify(submissionResponse)}`);
}

if (!source.section || !source.section.requestLineId) {
    throw new Error("Missing requestLineId from source writeback item.");
}

const requestLineId = source.section.requestLineId;

const requestLineWrite = {
    ids: [requestLineId],
    vals: {
        x_state: "submitted",
        x_latest_submission_id: submissionId,
    },
};

return {
    json: {
        ...source,
        submissionId,
        requestLinePayload: {
            module: "required_document_writeback_build_request_line_update.js",
            version: CONFIG.moduleVersion,
            builtAt: new Date().toISOString(),
            model: "x_hr.applicant_required_document_submission_request_line",
            method: "write",
            requestLineId,
            submissionId,
        },
        requestLineWrite,
        result: {
            status: "submission_created_pending_request_line_update",
            prefix: source.section.prefix,
            attachmentId: source.attachmentId,
            submissionId,
            requestLineId,
        },
    },
};