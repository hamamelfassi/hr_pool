/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Build Final Webhook Response
 * Module: required_document_writeback_final_response.js
 *
 * Pass 6C-6A:
 * - Reads the parent request update response.
 * - Reattaches summary context from Build Parent Request Update.
 * - Emits a compact final response for webhook/logging.
 */

const CONFIG = {
    moduleVersion: "6C-6A",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    sourceNodeName: "Build Parent Request Update",
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extractSuccess(value) {
    if (value === true) return true;
    if (value === false) return false;

    if (typeof value === "string") {
        const text = value.trim().toLowerCase();
        if (["true", "1", "yes"].includes(text)) return true;
        if (["false", "0", "no"].includes(text)) return false;
    }

    if (Array.isArray(value)) {
        for (const entry of value) {
            const success = extractSuccess(entry);
            if (success !== null) return success;
        }
    }

    if (isObject(value)) {
        for (const key of ["result", "data", "value", "body", "success"]) {
            if (key in value) {
                const success = extractSuccess(value[key]);
                if (success !== null) return success;
            }
        }
    }

    return null;
}

function getSourceItem() {
    try {
        const linked = $(CONFIG.sourceNodeName).item;
        if (linked && linked.json) {
            return linked.json;
        }
    } catch (error) {
        // Fall through.
    }

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
const parentRequestUpdated = extractSuccess($json);

if (parentRequestUpdated !== true) {
    throw new Error(`Parent request update did not return success=true: ${JSON.stringify($json)}`);
}

const response = {
    ok: true,
    workflow: CONFIG.workflow,
    module: "required_document_writeback_final_response.js",
    version: CONFIG.moduleVersion,
    completedAt: new Date().toISOString(),
    requestId: source.request.requestId,
    requestReference: source.request.requestReference,
    applicantId: source.request.applicantId,
    checklistId: source.request.checklistId,
    filloutSubmissionId: source.source && source.source.filloutSubmissionId,
    parentRequestUpdated,
    summary: source.finalSummary,
};

return {
    json: {
        ...source,
        parentRequestUpdated,
        webhookResponse: response,
    },
};