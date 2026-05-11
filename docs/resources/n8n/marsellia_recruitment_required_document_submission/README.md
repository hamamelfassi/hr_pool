# Marsellia | Recruitment | Required Document Submission

This folder stores source-controlled n8n workflow notes and Code node modules for the public required-document submission workflow.

## Workflow Purpose

This workflow receives Fillout submissions from candidates, validates the Odoo request envelope, normalizes requested document sections, and writes submitted files/data back into Odoo as required-document submission records.

Target operational flow:

```text
Odoo submission request
→ Fillout continuation URL
→ candidate submits documents/data
→ n8n webhook receives payload
→ n8n validates request/token/routing
→ n8n creates Odoo attachments and submission records
→ HR reviews submissions in Odoo
```

n8n does not accept or reject evidence. HR review remains in Odoo.

## Primary Contracts

```text
docs/modules/hr_recruitment_custom/n8n_required_document_writeback_contract.md
docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md
```

## Runtime Workflow Name

```text
Marsellia | Recruitment | Required Document Submission
```

## Runtime Design Rule

Odoo is the governed system of record. n8n must treat Odoo Online as a rate-limited SaaS endpoint.

For this workflow:

- use HTTP Request nodes against Odoo JSON-2 endpoints;
- do not use parallel Odoo calls;
- place Wait/throttle nodes between Odoo calls;
- keep Odoo bearer credentials in n8n credentials only;
- never hardcode bearer tokens, API keys, webhook URLs, or production secrets in source-controlled files;
- prefer request-line validation over extra checklist-line reads where the request-line payload already contains the needed evidence.

The Pass 6C-3A validation path intentionally removed the separate checklist-line lookup. The request-line lookup already returns the request, applicant, checklist, checklist line, document type, document code, request-line state, and public-request-enabled values needed for validation.

## Source-of-Truth Rule

```text
urlParameters = authoritative for request/routing metadata
questions = authoritative for applicant-filled values and file uploads
```

## Public Section Prefixes

Public Fillout/n8n prefixes:

```text
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

Not public:

```text
passport_photos
```

`passport_photos` remains a canonical F-0003 checklist line but is handled manually as hardcopy evidence by HR.

## Source-Controlled Files in This Workflow Folder

```text
README.md
required_document_writeback_field_id_map.md
required_document_writeback_parse_payload.js
required_document_writeback_validate_envelope.js
```

Planned future modules:

```text
required_document_writeback_normalize_sections.js
required_document_writeback_build_odoo_payloads.js
required_document_writeback_summarize_result.js
```

## Current Node Sequence — Pass 6C-3A

```text
Receive Fillout Submission
→ Parse Fillout Payload
→ Wait Before Odoo Request Lookup
→ Lookup Odoo Request
→ Wait Before Request Lines Lookup
→ Lookup Odoo Request Lines
→ Validate Odoo Envelope
```

### 1. Receive Fillout Submission

Type:

```text
Webhook
```

Purpose:

```text
Receives POST payload from Fillout.
```

Expected payload root:

```text
body.formId
body.formName
body.submission.submissionId
body.submission.submissionTime
body.submission.lastUpdatedAt
body.submission.questions
body.submission.urlParameters
```

Status:

```text
Implemented before Pass 6C-2.
```

### 2. Parse Fillout Payload

Type:

```text
Code
```

Node name:

```text
Parse Fillout Payload
```

Source file:

```text
required_document_writeback_parse_payload.js
```

Field ID map:

```text
required_document_writeback_field_id_map.md
```

Purpose:

```text
Normalizes Fillout webhook data into request envelope, URL parameters, question indexes, requested section objects, file references, structured data, and validation hints.
```

Important parser rules:

- stable Fillout question IDs are mapped to canonical integration field names;
- Arabic visible labels are not used as integration keys;
- document identifiers remain text;
- `form_notes` is captured separately from `bank_notes`;
- `country_of_birth` resolves to the Odoo country ID from RecordPicker `odoo_id`;
- stale `generated_url` values are ignored from normalized URL parameters.

Status:

```text
Implemented in Pass 6C-2 and hardened in Pass 6C-2A.
```

### 3. Wait Before Odoo Request Lookup

Type:

```text
Wait
```

Node name:

```text
Wait Before Odoo Request Lookup
```

Purpose:

```text
Throttles the first Odoo JSON-2 HTTP call.
```

Recommended setting:

```text
Resume: After Time Interval
Wait Amount: 2
Wait Unit: Seconds
```

Status:

```text
Implemented in Pass 6C-3A.
```

### 4. Lookup Odoo Request

Type:

```text
HTTP Request
```

Node name:

```text
Lookup Odoo Request
```

Purpose:

```text
Fetches the Odoo submission request using parsed request.odooRequestId.
```

Endpoint pattern:

```text
POST /json/2/x_hr.applicant_required_document_submission_request/search_read
```

Required request body fields:

```text
domain = [["id", "=", request.odooRequestId]]
fields = [
  "id",
  "x_token_reference",
  "x_applicant_id",
  "x_checklist_id",
  "x_state",
  "x_expires_at"
]
limit = 1
```

Required headers:

```text
Content-Type: application/json
X-Odoo-Database: marsellia
```

Authentication:

```text
Use n8n HTTP Bearer Auth credentials. Do not hardcode Authorization headers in exported JSON or docs.
```

Status:

```text
Implemented and tested in Pass 6C-3A.
```

### 5. Wait Before Request Lines Lookup

Type:

```text
Wait
```

Node name:

```text
Wait Before Request Lines Lookup
```

Purpose:

```text
Throttles the second Odoo JSON-2 HTTP call.
```

Recommended setting:

```text
Resume: After Time Interval
Wait Amount: 2
Wait Unit: Seconds
```

Status:

```text
Implemented in Pass 6C-3A.
```

### 6. Lookup Odoo Request Lines

Type:

```text
HTTP Request
```

Node name:

```text
Lookup Odoo Request Lines
```

Purpose:

```text
Fetches all request lines belonging to the parsed Odoo submission request.
```

Endpoint pattern:

```text
POST /json/2/x_hr.applicant_required_document_submission_request_line/search_read
```

Required request body fields:

```text
domain = [["x_request_id", "=", request.odooRequestId]]
fields = [
  "id",
  "x_request_id",
  "x_applicant_id",
  "x_checklist_id",
  "x_checklist_line_id",
  "x_document_type_id",
  "x_document_code",
  "x_state",
  "x_public_request_enabled"
]
limit = 100
```

Required headers:

```text
Content-Type: application/json
X-Odoo-Database: marsellia
```

Authentication:

```text
Use n8n HTTP Bearer Auth credentials. Do not hardcode Authorization headers in exported JSON or docs.
```

Status:

```text
Implemented and tested in Pass 6C-3A.
```

### 7. Validate Odoo Envelope

Type:

```text
Code
```

Node name:

```text
Validate Odoo Envelope
```

Source file:

```text
required_document_writeback_validate_envelope.js
```

Purpose:

```text
Validates parsed Fillout request metadata against live Odoo request and request-line records before any attachment/submission writeback.
```

Validation scope:

```text
request exists
token reference matches
applicant matches
checklist matches
request state is allowed
request is not expired
requested sections have matching request lines
request lines belong to the same request/applicant/checklist
request lines match checklist line, document type, and document code
request lines are public-request-enabled
request lines are in requested/submitted state
```

Pass 6C-3A validation result accepted:

```text
validation.status = valid
validation.canProceed = true
validation.envelope.status = valid
requestedSectionCount = 11
validRequestedSectionCount = 11
invalidRequestedSectionCount = 0
```

Status:

```text
Implemented and tested in Pass 6C-3A.
```

## Current Accepted 6C-3A Validation Output

The latest successful validation confirmed:

```text
requestRecordFound = true
requestRecordCount = 1
requestLineRecordCount = 12
requestState = sent
validation.status = valid
validation.canProceed = true
validPrefixes = qualification, birth_certificate, family_status, residence_certificate, national_id, criminal_record, health_certificate, passport, id_card, driving_license, non_duplication_certificate
```

`cv` and `bank_information` were skipped for the current test because their `_show` flags were false.

## Output Size / Debug Payload Rule

The parser and validator currently preserve rich debug data, including raw Fillout payloads, raw question objects, question indexes, and file URL metadata.

This is useful during Pass 6C testing but too large for production handoff.

Before or during Pass 6C-4, add a compact handoff step or adjust the validator output so downstream writeback nodes receive only:

```text
form
submission
request
formNotes
sections filtered to requested sections
section routing
section scalarFields
section files
section validation
odooLookup request summary
validation summary
```

Do not pass full `raw.payload` or full `questionIndex` into every downstream HTTP/writeback node unless debugging is explicitly needed.

## Attachment Download and Writeback Strategy — 6C-4 / 6C-5

Attachment download and Odoo writeback must also be rate-limit aware.

Recommended design:

```text
Validate Odoo Envelope
→ Build Compact Valid Sections
→ Split / Loop Over Valid Sections
→ Wait Before File Download
→ Download Section File, if any
→ Wait Before Odoo Attachment Create
→ Create Odoo Attachment, if file exists
→ Wait Before Odoo Submission Create
→ Create Odoo Required Document Submission
→ Wait Before Request Line Update
→ Update Request Line to submitted/latest_submission
→ Summarize Result
```

Rules:

1. Process valid requested sections sequentially.
2. Do not download all files in parallel.
3. Do not create Odoo attachments in parallel.
4. Do not create Odoo submission records in parallel.
5. Add Wait/throttle nodes before Odoo writes.
6. For Pass 6C-4, start with one section only, preferably `qualification`.
7. For Pass 6C-5, expand to all valid requested sections through a loop/batch pattern.
8. Bank information has no file download and should create a structured-only submission when requested and populated.
9. HR review remains in Odoo; n8n creates `submitted` evidence only.

Odoo write sequence per section:

```text
ir.attachment/create              if file exists
x_hr.applicant_required_document_submission/create
x_hr.applicant_required_document_submission_request_line/write
x_hr.applicant_required_document_submission_request/write last_response_at, once per run or after sections complete
```

For the first writeback probe, keep the process deliberately slow and observable.

## Current Test Checklist

### Pass 6C-2 / 6C-2A Parser

- Webhook receives Fillout payload.
- Parse Fillout Payload node runs without error.
- `form.isExpectedForm = true`.
- `request.odooRequestId` is populated.
- `request.odooApplicantId` is populated.
- `request.odooChecklistId` is populated.
- `request.tokenReference` is populated.
- `summary.requestedSectionCount > 0` for a generated URL.
- `summary.validationHintCount = 0` for a valid request URL.
- Sections include all public prefixes.
- `bank_information` is parsed as structured-only.
- `passport_photos` is not treated as public.
- Question IDs map to canonical names.
- Arabic labels do not affect writeback parsing.
- Document identifiers remain text.
- `form_notes` is captured separately from `bank_notes`.
- `country_of_birth` resolves to Odoo country ID from RecordPicker `odoo_id`.

### Pass 6C-3A Validation

- `Lookup Odoo Request` returns exactly one request.
- `Lookup Odoo Request Lines` returns request lines for the request.
- No separate checklist-line lookup is used.
- No parallel Odoo HTTP calls are used.
- Wait/throttle nodes are placed between Odoo calls.
- `Validate Odoo Envelope` returns `validation.canProceed = true`.
- `validation.status = valid`.
- `validation.envelope.status = valid`.
- `validation.sectionSummary.validRequestedSectionCount = 11` for the current test payload.
- `validation.sectionSummary.invalidRequestedSectionCount = 0`.

### Pass 6C-4 Next Probe

- Compact the validator output or add a compact handoff node.
- Select one valid section, preferably `qualification`.
- Download one Fillout file.
- Create one Odoo attachment.
- Create one Odoo required-document submission in `submitted` state.
- Update the matching request line to `submitted` and link the latest submission.
- Do not accept/reject evidence from n8n.
- HR accepts/rejects inside Odoo after writeback.
