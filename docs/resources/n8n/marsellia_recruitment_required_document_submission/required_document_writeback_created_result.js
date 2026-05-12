/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Writeback Created Result
 * Module: required_document_writeback_created_result.js
 *
 * Pass 6C-5F:
 * - Reads Odoo request-line update response.
 * - Reattaches linked context from Build Request Line Update.
 * - Emits a compact per-section result for loop return / later summary.
 */

const CONFIG = {
    moduleVersion: "6C-5F",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    sourceNodeName: "Build Request Line Update",
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
const requestLineUpdateSuccess = extractSuccess($json);

if (requestLineUpdateSuccess !== true) {
    throw new Error(`Request line update did not return success=true: ${JSON.stringify($json)}`);
}

return {
    json: {
        ...source,
        loopBranchResult: {
            module: "required_document_writeback_created_result.js",
            version: CONFIG.moduleVersion,
            workflow: CONFIG.workflow,
            decidedAt: new Date().toISOString(),
            action: "writeback_created",
            prefix: source.section && source.section.prefix,
            requestLineId: source.section && source.section.requestLineId,
            attachmentId: source.attachmentId,
            submissionId: source.submissionId,
            requestLineUpdated: true,
            performedWriteback: true,
        },
    },
};