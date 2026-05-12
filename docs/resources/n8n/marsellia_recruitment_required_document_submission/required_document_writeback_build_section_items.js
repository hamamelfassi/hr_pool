/**
 * MCEP / Marsellia — Required Document Writeback
 * Workflow: Marsellia | Recruitment | Required Document Submission
 * Node: Build Writeback Items
 * Module: required_document_writeback_build_section_items.js
 *
 * Pass 6C-5B:
 * - Builds compact writeback item(s) from validated envelope output.
 * - Emits all valid requested sections.
 * - No downloads.
 * - No Odoo writes.
 *
 * Input:
 * - Output from Validate Odoo Envelope.
 *
 * Output:
 * - One compact n8n item per valid requested section with payload.
 */

const CONFIG = {
    moduleVersion: "6C-5B",
    workflow: "Marsellia | Recruitment | Required Document Submission",
    probeOnlyPrefix: null,
    sourceSystem: "fillout_zite",
};

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value) {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text || null;
}

function toInt(value) {
    const text = cleanString(value);
    if (!text) return null;
    const parsed = Number.parseInt(text, 10);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOdooDatetime(value) {
    const text = cleanString(value);
    if (!text) return null;

    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return null;

    const pad = (number) => String(number).padStart(2, "0");

    return [
        date.getUTCFullYear(),
        pad(date.getUTCMonth() + 1),
        pad(date.getUTCDate()),
    ].join("-") + " " + [
        pad(date.getUTCHours()),
        pad(date.getUTCMinutes()),
        pad(date.getUTCSeconds()),
    ].join(":");
}

function compactObject(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => {
            if (value === undefined || value === null) return false;
            if (typeof value === "string" && value.trim() === "") return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
        })
    );
}

function firstFile(section) {
    if (!Array.isArray(section.files) || !section.files.length) return null;
    return section.files.find((file) => file && file.url) || section.files[0] || null;
}

function getRequestLine(section) {
    return section && section.odoo && section.odoo.requestLine
        ? section.odoo.requestLine
        : {};
}

function boolFromOdoo(value) {
    if (value === true) return true;
    if (value === false) return false;
    const text = cleanString(value);
    if (!text) return false;
    return ["1", "true", "yes", "y", "on"].includes(text.toLowerCase());
}

function requestLineRequiresAttachment(section) {
    const requestLine = getRequestLine(section);

    if ("x_requires_attachment" in requestLine) {
        return boolFromOdoo(requestLine.x_requires_attachment);
    }

    // Safe fallback.
    // bank_information is structured-only; all other public sections currently require a file.
    return section.prefix !== "bank_information";
}

function mapGenericDocumentFields(section) {
    const prefix = section.prefix;
    const fields = section.scalarFields || {};

    return compactObject({
        x_document_number: fields[`${prefix}_document_number`] || fields[`${prefix}_number`],
        x_issuing_authority: fields[`${prefix}_issuing_authority`],
        x_place_of_issue: fields[`${prefix}_place_of_issue`],
        x_issue_date: fields[`${prefix}_date_of_issue`],
        x_expiry_date: fields[`${prefix}_date_of_expiry`],
        x_notes: fields[`${prefix}_notes`],
    });
}

function mapStructuredFields(section) {
    const fields = section.scalarFields || {};

    if (section.prefix === "qualification") {
        return compactObject({
            x_qualification_type: fields.qualification_type,
            x_qualification_subject: fields.qualification_subject,
        });
    }

    if (section.prefix === "birth_certificate") {
        return compactObject({
            x_date_of_birth: fields.date_of_birth,
            x_place_of_birth: fields.place_of_birth,
            x_country_of_birth_id: toInt(fields.country_of_birth),
        });
    }

    if (section.prefix === "family_status") {
        return compactObject({
            x_family_paper_number: fields.family_paper_number,
            x_family_reference_number: fields.family_reference_number,
            x_next_of_kin_name: fields.next_of_kin_name,
            x_next_of_kin_phone: fields.next_of_kin_phone,
        });
    }

    if (section.prefix === "health_certificate") {
        return compactObject({
            x_blood_type: fields.blood_type,
        });
    }

    if (section.prefix === "bank_information") {
        return compactObject({
            x_bank_name: fields.bank_name,
            x_bank_branch: fields.bank_branch,
            x_account_number: fields.account_number,
            x_iban: fields.iban,
            x_notes: fields.bank_notes,
        });
    }

    return {};
}

function buildWritebackItem(validatedPayload, section) {
    const routing = section.routing || {};
    const requestLine = getRequestLine(section);
    const file = firstFile(section);
    const requiresAttachment = requestLineRequiresAttachment(section);

    const applicantId = toInt(validatedPayload.request && validatedPayload.request.odooApplicantId);
    const checklistId = toInt(validatedPayload.request && validatedPayload.request.odooChecklistId);
    const requestId = toInt(validatedPayload.request && validatedPayload.request.odooRequestId);
    const requestLineId = toInt(routing.requestLineId);
    const checklistLineId = toInt(routing.checklistLineId);
    const documentTypeId = toInt(routing.documentTypeId);
    const documentCode = cleanString(routing.documentCode);

    const sourceSubmissionId = cleanString(validatedPayload.submission && validatedPayload.submission.id);
    const submittedOn = normalizeOdooDatetime(
        validatedPayload.submission && validatedPayload.submission.submissionTime
    );

    const genericFields = mapGenericDocumentFields(section);
    const structuredFields = mapStructuredFields(section);

    const fileName = cleanString(file && (file.fileName || file.name)) ||
        `${sourceSubmissionId || "fillout"}_${section.prefix}.bin`;

    const submissionVals = compactObject({
        x_applicant_id: applicantId,
        x_checklist_id: checklistId,
        x_line_id: checklistLineId,
        x_document_type_id: documentTypeId,
        x_document_code: documentCode,
        x_submission_request_id: requestId,
        x_submission_request_line_id: requestLineId,
        x_source: CONFIG.sourceSystem,
        x_source_submission_id: sourceSubmissionId,
        x_source_reference: requestLineId ? String(requestLineId) : null,
        x_state: "submitted",
        x_submitted_on: submittedOn,
        ...genericFields,
        ...structuredFields,
    });

    return {
        builder: {
            module: "required_document_writeback_build_section_items.js",
            version: CONFIG.moduleVersion,
            workflow: CONFIG.workflow,
            builtAt: new Date().toISOString(),
            probeOnlyPrefix: CONFIG.probeOnlyPrefix,
        },
        source: {
            formId: validatedPayload.form && validatedPayload.form.id,
            formName: validatedPayload.form && validatedPayload.form.name,
            filloutSubmissionId: sourceSubmissionId,
            submittedOn,
            formNotes: validatedPayload.formNotes || null,
        },
        request: {
            requestId,
            applicantId,
            checklistId,
            requestReference: validatedPayload.request && validatedPayload.request.requestReference,
            tokenReference: validatedPayload.request && validatedPayload.request.tokenReference,
        },
        section: {
            prefix: section.prefix,
            documentCode,
            requestLineId,
            checklistLineId,
            documentTypeId,
            requiresAttachment,
            hasFile: !!(file && file.url),
            hasStructuredData: !!section.hasStructuredData,
        },
        file: file ? {
            url: cleanString(file.url),
            fileName,
            mimeType: cleanString(file.mimeType) || "application/octet-stream",
            size: file.size || null,
        } : null,
        duplicateCheck: {
            model: "x_hr.applicant_required_document_submission",
            method: "search_count",
            domain: [
                ["x_source_submission_id", "=", sourceSubmissionId],
                ["x_submission_request_line_id", "=", requestLineId],
            ],
        },
        attachmentValsBase: compactObject({
            name: fileName,
            res_model: "hr.applicant",
            res_id: applicantId,
            mimetype: file ? (cleanString(file.mimeType) || "application/octet-stream") : null,
            description: `Required document submission ${section.prefix} from Fillout submission ${sourceSubmissionId}`,
            type: "binary",
        }),
        submissionVals,
        requestLineUpdateBase: {
            ids: requestLineId ? [requestLineId] : [],
            vals: {
                x_state: "submitted",
            },
        },
    };
}

const inputItems = $input.all();
const output = [];

for (const item of inputItems) {
    const payload = item && item.json ? item.json : item;

    if (!payload.validation || payload.validation.canProceed !== true) {
        continue;
    }

    const sections = Array.isArray(payload.sections) ? payload.sections : [];

    for (const section of sections) {
        if (!section || !section.routing || section.routing.show !== true) continue;
        if (!section.validation || section.validation.isValidForWriteback !== true) continue;

        if (CONFIG.probeOnlyPrefix && section.prefix !== CONFIG.probeOnlyPrefix) {
            continue;
        }

        const requiresAttachment = requestLineRequiresAttachment(section);
        const file = firstFile(section);

        if (requiresAttachment && !(file && file.url)) {
            throw new Error(`Section ${section.prefix} requires an attachment but no file URL was found.`);
        }

        if (!requiresAttachment && !section.hasPayload) {
            continue;
        }

        output.push({
            json: buildWritebackItem(payload, section),
        });
    }
}

if (!output.length) {
    throw new Error(`No writeback items were built. Probe prefix: ${CONFIG.probeOnlyPrefix || "all"}.`);
}

return output;