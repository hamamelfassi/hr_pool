/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Duplicate Skipped Result
 * Module: required_document_writeback_duplicate_skipped_result.js
 *
 * Pass 6C-5E:
 * - Dry-run loop branch.
 * - Records that a section was skipped because the same Fillout submission/request-line pair already exists.
 * - Performs no downloads and no Odoo writes.
 */

const CONFIG = {
    moduleVersion: "6C-5E",
    workflow: "Marsellia | Recruitment | Required Document Submission",
};

if (!$json.duplicateCheckResult || $json.duplicateCheckResult.isDuplicate !== true) {
    throw new Error("Duplicate Skipped Result received a non-duplicate item.");
}

return {
    json: {
        ...$json,
        loopBranchResult: {
            module: "required_document_writeback_duplicate_skipped_result.js",
            version: CONFIG.moduleVersion,
            workflow: CONFIG.workflow,
            decidedAt: new Date().toISOString(),
            action: "skip_duplicate_retry",
            prefix: $json.section && $json.section.prefix,
            requestLineId: $json.section && $json.section.requestLineId,
            duplicateCount: $json.duplicateCheckResult.count,
            performedWriteback: false,
        },
    },
};