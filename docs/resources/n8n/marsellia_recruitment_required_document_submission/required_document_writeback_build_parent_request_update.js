/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Build Parent Request Update
 * Module: required_document_writeback_build_parent_request_update.js
 *
 * Pass 6C-6A:
 * - Builds the Odoo write payload for the parent submission request.
 * - Marks the request completed only when the loop completed without failed items.
 */

const CONFIG = {
    moduleVersion: "6C-6A",
    workflow: "Marsellia | Recruitment | Required Document Submission",
};

function cleanString(value) {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text === "" ? null : text;
}

if (!$json.finalSummary) {
    throw new Error("Missing finalSummary.");
}

if (!$json.request || !$json.request.requestId) {
    throw new Error("Missing request.requestId.");
}

const vals = {
    x_last_response_at:
        cleanString($json.responseSubmittedOn) ||
        new Date().toISOString().slice(0, 19).replace("T", " "),
};

if ($json.finalSummary.canCompleteRequest) {
    vals.x_state = "completed";
}

return {
    json: {
        ...$json,
        parentRequestUpdate: {
            module: "required_document_writeback_build_parent_request_update.js",
            version: CONFIG.moduleVersion,
            workflow: CONFIG.workflow,
            builtAt: new Date().toISOString(),
            model: "x_hr.applicant_required_document_submission_request",
            method: "write",
            ids: [$json.request.requestId],
            vals,
        },
    },
};