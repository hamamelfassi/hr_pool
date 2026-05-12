/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Summarize Loop Result
 * Module: required_document_writeback_summarize_loop_result.js
 *
 * Pass 6C-6A:
 * - Aggregates the loop return items after all requested sections are processed.
 * - Produces a compact request-level summary.
 * - Performs no Odoo writes.
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

function unique(values) {
    return [...new Set(values.filter((value) => value !== undefined && value !== null && value !== ""))];
}

const inputItems = $input.all();
const rows = inputItems.map((item) => item.json || item);

if (!rows.length) {
    throw new Error("Summarize Loop Result received no loop result items.");
}

const first = rows[0];

if (!first.request || !first.request.requestId) {
    throw new Error("Loop result item is missing request.requestId.");
}

const createdRows = rows.filter((row) => row.loopBranchResult && row.loopBranchResult.action === "writeback_created");
const skippedRows = rows.filter((row) => row.loopBranchResult && row.loopBranchResult.action === "skip_duplicate_retry");
const failedRows = rows.filter((row) => !row.loopBranchResult);

const prefixes = rows.map((row) => row.section && row.section.prefix);
const createdPrefixes = createdRows.map((row) => row.section && row.section.prefix);
const skippedPrefixes = skippedRows.map((row) => row.section && row.section.prefix);
const failedPrefixes = failedRows.map((row) => row.section && row.section.prefix);

const attachmentIds = createdRows.map((row) => row.loopBranchResult.attachmentId);
const submissionIds = createdRows.map((row) => row.loopBranchResult.submissionId);
const requestLineIds = rows.map((row) => row.section && row.section.requestLineId);

const submittedOn =
    cleanString(first.source && first.source.submittedOn) ||
    new Date().toISOString().slice(0, 19).replace("T", " ");

const canCompleteRequest = rows.length > 0 && failedRows.length === 0;

return [
    {
        json: {
            finalSummary: {
                module: "required_document_writeback_summarize_loop_result.js",
                version: CONFIG.moduleVersion,
                workflow: CONFIG.workflow,
                summarizedAt: new Date().toISOString(),
                status: canCompleteRequest ? "completed" : "partial",
                canCompleteRequest,
                processedCount: rows.length,
                createdCount: createdRows.length,
                skippedDuplicateCount: skippedRows.length,
                failedCount: failedRows.length,
                prefixes: unique(prefixes),
                createdPrefixes: unique(createdPrefixes),
                skippedDuplicatePrefixes: unique(skippedPrefixes),
                failedPrefixes: unique(failedPrefixes),
                requestLineIds: unique(requestLineIds),
                attachmentIds: unique(attachmentIds),
                submissionIds: unique(submissionIds),
            },
            request: first.request,
            source: first.source,
            responseSubmittedOn: submittedOn,
            loopResults: rows.map((row) => ({
                prefix: row.section && row.section.prefix,
                requestLineId: row.section && row.section.requestLineId,
                action: row.loopBranchResult && row.loopBranchResult.action,
                attachmentId: row.loopBranchResult && row.loopBranchResult.attachmentId,
                submissionId: row.loopBranchResult && row.loopBranchResult.submissionId,
                performedWriteback: row.loopBranchResult && row.loopBranchResult.performedWriteback,
            })),
        },
    },
];