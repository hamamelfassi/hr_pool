/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Normalize Duplicate Count
 * Module: required_document_writeback_normalize_duplicate_count.js
 *
 * Pass 6C-5C:
 * - Reads the Odoo search_count response from the current HTTP item.
 * - Reattaches the paired compact writeback item from Loop Over Writeback Items.
 * - Adds duplicateCheckResult.
 *
 * Input:
 * - Current item: Odoo search_count response from Check Existing Submission Count.
 * - Linked source item: current Loop Over Writeback Items item.
 *
 * Output:
 * - Original compact writeback item plus duplicateCheckResult.
 */

const CONFIG = {
    moduleVersion: "6C-5C",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    sourceNodeName: "Loop Over Writeback Items",
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
        for (const key of ["count", "result", "data", "value", "body", "duplicateCountRaw"]) {
            if (key in value) {
                const count = extractCount(value[key]);
                if (count !== null) return count;
            }
        }
    }

    return null;
}

function getSourceItem() {
    // Best path in n8n loop context:
    // use item-linking from the current HTTP response back to the current loop item.
    try {
        const linked = $(CONFIG.sourceNodeName).item;
        if (linked && linked.json) {
            return linked.json;
        }
    } catch (error) {
        // Fall through to fallback paths.
    }

    // Fallback if the HTTP node is configured to preserve input JSON.
    if ($json && $json.section && $json.duplicateCheck) {
        return $json;
    }

    throw new Error(`Could not read linked source item from node: ${CONFIG.sourceNodeName}`);
}

const source = getSourceItem();
const count = extractCount($json);

if (count === null) {
    throw new Error(`Could not extract duplicate count from HTTP response: ${JSON.stringify($json)}`);
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