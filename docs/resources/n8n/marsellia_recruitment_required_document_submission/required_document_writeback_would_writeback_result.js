/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Would Writeback Result
 * Module: required_document_writeback_would_writeback_result.js
 *
 * Pass 6C-5E:
 * - Dry-run loop branch.
 * - Records that a section is eligible for writeback.
 * - Performs no downloads and no Odoo writes.
 */

const CONFIG = {
    moduleVersion: "6C-5E",
    workflow: "Marsellia | Recruitment | Required Document Submission",
};

if (!$json.duplicateCheckResult || $json.duplicateCheckResult.isDuplicate !== false) {
    throw new Error("Would Writeback Result received a duplicate item.");
}

return {
    json: {
        ...$json,
        loopBranchResult: {
            module: "required_document_writeback_would_writeback_result.js",
            version: CONFIG.moduleVersion,
            workflow: CONFIG.workflow,
            decidedAt: new Date().toISOString(),
            action: "would_writeback",
            prefix: $json.section && $json.section.prefix,
            requestLineId: $json.section && $json.section.requestLineId,
            requiresAttachment: $json.section && $json.section.requiresAttachment,
            hasFile: $json.section && $json.section.hasFile,
            performedWriteback: false,
        },
    },
};