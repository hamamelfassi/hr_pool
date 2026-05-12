/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Build Submission Payload
 * Module: required_document_writeback_build_submission_payload.js
 *
 * Pass 6C-4F:
 * - Reads created ir.attachment ID from Create Odoo Attachment.
 * - Reattaches compact writeback item from Build Attachment Payload.
 * - Adds x_attachment_id to x_hr.applicant_required_document_submission create values.
 * - Does not write the submission yet.
 */

const CONFIG = {
    moduleVersion: "6C-5D",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    sourceNodeName: "Build Attachment Payload",
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
const attachmentResponse = $json;
const attachmentId = extractCreatedId(attachmentResponse);

if (!attachmentId) {
    throw new Error(`Could not extract created attachment ID from response: ${JSON.stringify(attachmentResponse)}`);
}

if (!source.submissionVals) {
    throw new Error("Missing submissionVals from source writeback item.");
}

const submissionVals = {
    ...source.submissionVals,
    x_attachment_id: attachmentId,
};

return {
    json: {
        ...source,
        submissionPayload: {
            module: "required_document_writeback_build_submission_payload.js",
            version: CONFIG.moduleVersion,
            builtAt: new Date().toISOString(),
            attachmentId,
            model: "x_hr.applicant_required_document_submission",
            method: "create",
        },
        attachmentId,
        submissionVals,
    },
};