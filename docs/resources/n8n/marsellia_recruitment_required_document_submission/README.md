# Marsellia | Recruitment | Required Document Submission

This folder stores source-controlled n8n Code node modules for the public required-document submission workflow.

## Workflow Purpose

This workflow receives Fillout submissions from candidates, validates the request envelope, normalizes requested document sections, and writes submitted files/data back into Odoo as required-document submission records.

The workflow supports the Odoo recruitment flow:

```text
Odoo submission request
→ Fillout continuation URL
→ candidate submits documents/data
→ n8n webhook receives payload
→ n8n validates request/token/routing
→ n8n creates Odoo attachments and submission records
→ HR reviews submissions in Odoo
```

* n8n does not accept or reject evidence. HR review remains in Odoo.

* ## **Primary Contract**

```
docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md
```

* Supporting contract:

```
docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md
```

* ## **Runtime Workflow Name**

```
Marsellia | Recruitment | Required Document Submission
```

* ## **Planned Node Sequence**

* ### **1\. Receive Fillout Submission**

* Type:

```
Webhook
```

* Purpose:

```
Receives POST payload from Fillout.
```

* Expected payload root:

```
body.formId
body.formName
body.submission.submissionId
body.submission.submissionTime
body.submission.lastUpdatedAt
body.submission.questions
body.submission.urlParameters
```

* ### **2\. Parse Fillout Payload**

* Type:

```
Code
```

* Source file:

```
required_document_writeback_parse_payload.js
```

* Purpose:

```
Normalizes Fillout webhook data into request envelope, URL parameters, question indexes, requested section objects, file references, structured data, and validation hints.
```

* Status:

```
Implemented in Pass 6C-2.
```

* ### **3\. Validate Odoo Envelope**

* Type:

```
Code / Odoo nodes
```

* Planned source file:

```
required_document_writeback_validate_envelope.js
```

* Purpose:

```
Validates request ID, applicant ID, checklist ID, token reference, expiry, request state, request line IDs, checklist line IDs, and document type/code consistency.
```

* Status:

```
Planned for Pass 6C-3.
```

* ### **4\. Normalize Sections**

* Type:

```
Code
```

* Planned source file:

```
required_document_writeback_normalize_sections.js
```

* Purpose:

```
Filters requested sections, skips non-requested sections, identifies no-payload sections, detects attachment-required sections without files, and prepares section-level writeback instructions.
```

* Status:

```
Planned.
```

* ### **5\. Build Odoo Payloads**

* Type:

```
Code
```

* Planned source file:

```
required_document_writeback_build_odoo_payloads.js
```

* Purpose:

```
Builds Odoo ir.attachment and x_hr.applicant_required_document_submission create payloads.
```

* Status:

```
Planned.
```

* ### **6\. Summarize Result**

* Type:

```
Code
```

* Planned source file:

```
required_document_writeback_summarize_result.js
```

* Purpose:

```
Builds a normalized execution summary for logs, retries, and later Odoo chatter posting.
```

* Status:

```
Planned.
```

* ## **Public Section Prefixes**

* The public Fillout/n8n prefixes are:

```
cv
qualification
birth_certificate
family_status
residence_certificate
national_id
criminal_record
health_certificate
passport
id_card
driving_license
non_duplication_certificate
bank_information
```

* Not public:

```
passport_photos
```

* `passport_photos` remains a canonical F-0003 checklist line but is handled manually as hardcopy evidence by HR.

* ## **Source-of-Truth Rule**

```
urlParameters = authoritative for request/routing metadata
questions = authoritative for applicant-filled values and file uploads
```

* ## **Current Test Checklist**

* For Pass 6C-2:

```
Webhook receives Fillout payload.
Parse Fillout Payload node runs without error.
form.isExpectedForm = true.
request.odooRequestId is populated.
request.odooApplicantId is populated.
request.odooChecklistId is populated.
request.tokenReference is populated.
summary.requestedSectionCount > 0 for a generated URL.
summary.validationHintCount = 0 for a valid request URL.
sections include all public prefixes.
bank_information is parsed as structured-only.
passport_photos is not treated as public.
```
