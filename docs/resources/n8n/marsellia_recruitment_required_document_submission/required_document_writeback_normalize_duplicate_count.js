/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Normalize Duplicate Count
 * Module: required_document_writeback_normalize_duplicate_count.js
 *
 * Pass 6C-4B:
 * - Reads the Odoo search_count response from Check Existing Submission Count.
 * - Reattaches the compact writeback item from Build Writeback Items.
 * - Adds duplicateCheckResult.
 *
 * Input:
 * - Current item: Odoo search_count response.
 * - Source item: Build Writeback Items output.
 *
 * Output:
 * - Original compact writeback item plus duplicateCheckResult.
 */

const CONFIG = {
    moduleVersion: "6C-4B",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    sourceNodeName: "Build Writeback Items",
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extractCount(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number.parseInt(value.trim(), 10);
        if (Number.isFinite(parsed)) return parsed;
    }

    if (Array.isArray(value)) {
        if (!value.length) return 0;

        for (const entry of value) {
            const count = extractCount(entry);
            if (count !== null) return count;
        }

        return 0;
    }

    if (isObject(value)) {
        for (const key of ["count", "result", "data", "value"]) {
            if (key in value) {
                const count = extractCount(value[key]);
                if (count !== null) return count;
            }
        }

        // Some n8n HTTP wrappers keep the parsed response under body.
        if ("body" in value) {
            const count = extractCount(value.body);
            if (count !== null) return count;
        }
    }

    return null;
}

function getSourceItem() {
    const sourceItems = $items(CONFIG.sourceNodeName);

    if (!sourceItems || !sourceItems.length) {
        throw new Error(`Could not read source item from node: ${CONFIG.sourceNodeName}`);
    }

    // Pass 6C-4B is qualification-only, so one source item is expected.
    return sourceItems[0].json || sourceItems[0];
}

const source = getSourceItem();
const count = extractCount($json);

if (count === null) {
    throw new Error(`Could not extract duplicate count from response: ${JSON.stringify($json)}`);
}

return {
    json: {
        ...source,
        duplicateCheckResult: {
            module: "required_document_writeback_normalize_duplicate_count.js",
            version: CONFIG.moduleVersion,
            checkedAt: new Date().toISOString(),
            count,
            isDuplicate: count > 0,
            decision: count > 0 ? "skip_duplicate_retry" : "continue_writeback",
        },
    },
};