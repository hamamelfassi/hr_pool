/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Build Attachment Payload
 * Module: required_document_writeback_build_attachment_payload.js
 *
 * Pass 6C-4D:
 * - Reads the downloaded Fillout/S3 binary file.
 * - Builds Odoo ir.attachment create values.
 * - Does not write to Odoo yet.
 *
 * Input:
 * - Current item JSON from Build Writeback Items / Normalize Duplicate Count.
 * - Current item binary.submitted_file from Download Submitted File.
 *
 * Output:
 * - Same compact writeback item plus attachmentVals.
 */

const CONFIG = {
    moduleVersion: "6C-4D",
    workflow: "Marsellia | Recruitment | Required Document Submission",
};

function cleanString(value) {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text || null;
}

function safeString(value) {
    return cleanString(value)
        ? cleanString(value).replace(/[^A-Za-z0-9_.-]+/g, "_").replace(/_+/g, "_")
        : null;
}

function extensionFromMimeType(mimeType) {
    const mime = cleanString(mimeType);
    if (!mime) return null;

    const map = {
        "application/pdf": "pdf",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    };

    return map[mime] || null;
}

function extensionFromName(fileName) {
    const name = cleanString(fileName);
    if (!name || !name.includes(".")) return null;
    const ext = name.split(".").pop().toLowerCase();
    return ext && ext.length <= 8 ? ext : null;
}

function getInputItem() {
    try {
        if ($input && $input.item) return $input.item;
    } catch (error) {
        // ignored
    }

    return {};
}

function getBinaryFile(item) {
    const binary = item && item.binary ? item.binary : {};

    if (binary.submitted_file) return binary.submitted_file;

    const keys = Object.keys(binary || {});
    if (!keys.length) return null;

    return binary[keys[0]];
}

function binaryToBase64(binaryFile) {
    if (!binaryFile) return null;

    if (typeof binaryFile.data === "string" && binaryFile.data.trim()) {
        return binaryFile.data;
    }

    if (typeof binaryFile.fileData === "string" && binaryFile.fileData.trim()) {
        return binaryFile.fileData;
    }

    if (Buffer.isBuffer(binaryFile)) {
        return binaryFile.toString("base64");
    }

    return null;
}

function buildSafeFileName(json, binaryFile) {
    const requestReference = safeString(json.request && json.request.requestReference) || "MCEP-F0003-REQ";
    const prefix = safeString(json.section && json.section.prefix) || "document";
    const sourceSubmissionId = safeString(json.source && json.source.filloutSubmissionId) || "fillout";

    const ext =
        extensionFromName(binaryFile && (binaryFile.fileName || binaryFile.filename)) ||
        extensionFromName(json.file && json.file.fileName) ||
        extensionFromMimeType(binaryFile && binaryFile.mimeType) ||
        extensionFromMimeType(json.file && json.file.mimeType) ||
        "bin";

    return `${requestReference}_${prefix}_${sourceSubmissionId}.${ext}`;
}

const item = getInputItem();
const json = item && item.json ? item.json : $json;
const binaryFile = getBinaryFile(item);
const base64 = binaryToBase64(binaryFile);

if (!json || !json.section) {
    throw new Error("Missing compact writeback item JSON.");
}

if (!binaryFile) {
    throw new Error("Missing binary file. Expected binary.submitted_file from Download Submitted File.");
}

if (!base64) {
    throw new Error("Downloaded binary file does not contain base64 data.");
}

const detectedMimeType =
    cleanString(binaryFile.mimeType) ||
    cleanString(binaryFile.mimetype) ||
    cleanString(json.file && json.file.mimeType) ||
    "application/octet-stream";

const safeFileName = buildSafeFileName(json, binaryFile);

const originalFileName =
    cleanString(binaryFile.fileName) ||
    cleanString(binaryFile.filename) ||
    cleanString(json.file && json.file.fileName);

const attachmentVals = {
    ...(json.attachmentValsBase || {}),
    name: safeFileName,
    res_model: "hr.applicant",
    res_id: json.request.applicantId,
    mimetype: detectedMimeType,
    type: "binary",
    datas: base64,
    description: [
        `Required document submission: ${json.section.prefix}`,
        `Fillout submission: ${json.source.filloutSubmissionId}`,
        originalFileName ? `Original filename: ${originalFileName}` : null,
    ].filter(Boolean).join("\n"),
};

return {
    json: {
        ...json,
        attachmentPayload: {
            module: "required_document_writeback_build_attachment_payload.js",
            version: CONFIG.moduleVersion,
            builtAt: new Date().toISOString(),
            binaryPropertyFound: "submitted_file",
            originalFileName,
            safeFileName,
            mimeType: detectedMimeType,
            base64Length: base64.length,
        },
        attachmentVals,
    },
};