# n8n Required Document Writeback Contract

This document locks the Pass 6C writeback contract for the public required-document submission flow.

It extends:

- `docs/modules/hr_recruitment_custom/fillout_required_document_submission_contract.md`
- `docs/modules/hr_recruitment_custom/server_action_saas_patterns_wiki.md`
- `docs/resources/current_phase_execution_plan.md`

## 1. Purpose

Pass 6C connects the public Fillout submission back into Odoo.

Target flow:

```text
Odoo required-document submission request
→ Fillout continuation URL
→ candidate submits requested document sections
→ n8n receives webhook
→ n8n validates request/token/routing
→ n8n uploads attachments into Odoo
→ n8n creates required-document submission records
→ HR reviews/accepts/rejects in Odoo
```

n8n must not bypass HR review.

n8n creates `submitted` evidence records only. Acceptance remains inside Odoo.

## **2. Systems and authority**

### **Odoo is authoritative for lifecycle**

Odoo owns:

* applicant;  
* F-0003 checklist;  
* checklist lines;  
* required document types;  
* submission request;  
* request lines;  
* required document submissions;  
* HR accept/reject review;  
* readiness validation;  
* F-0003 PDF/sign lifecycle.

  ### **Fillout is the candidate input surface**

Fillout owns:

* visible form sections;  
* file upload fields;  
* applicant-entered structured values;  
* webhook payload.

  ### **n8n is the writeback worker**

n8n owns:

* payload parsing;  
* request/token validation;  
* attachment download;  
* Odoo attachment creation;  
* Odoo submission creation;  
* request-line update after successful writeback;  
* error logging / retry diagnostics.

n8n does not decide acceptance.

## **3. Source payload**

Expected Fillout webhook shape:

```
body.formId
body.formName
body.submission.submissionId
body.submission.submissionTime
body.submission.lastUpdatedAt
body.submission.questions
body.submission.urlParameters
```

Current Fillout form:

```
Form name: Submit Documents Requested
Form ID: sZFxwo2u1bus
```

## **4. Source-of-truth parsing rule**

Use:

```
urlParameters = authoritative for request/routing metadata
questions = authoritative for applicant-filled values and file uploads
```

Do not rely on hidden body questions for routing if the same value exists in `urlParameters`.

## **5. Required URL parameters**

Top-level request envelope:

```
odoo_request_id
odoo_applicant_id
odoo_checklist_id
request_reference
candidate_name
candidate_email
token_reference
expires_at
form_base_url
state
sent_at
last_response_at
```

Important:

```
generated_url is not an outbound URL parameter.
```

`x_generated_url` is stored in Odoo for HR copy/open/send convenience only.

## **6. Per-document routing parameters**

Every public-request-enabled document type uses:

```
<prefix>_show
<prefix>_request_line_id
<prefix>_checklist_line_id
<prefix>_document_type_id
<prefix>_document_code
```

Example for qualification:

```
qualification_show
qualification_request_line_id
qualification_checklist_line_id
qualification_document_type_id
qualification_document_code
```

Interpretation:

* `<prefix>_show = 1`: section was requested and should be considered for writeback.  
* `<prefix>_show = 0`: section was not requested; skip it.  
* `<prefix>_request_line_id`: Odoo request line ID.  
* `<prefix>_checklist_line_id`: Odoo F-0003 checklist line ID.  
* `<prefix>_document_type_id`: Odoo required document type ID.  
* `<prefix>_document_code`: stable integration code.

  ## **7. Canonical public section prefixes**

Public Fillout/n8n section prefixes:

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

Not public:

```
passport_photos
```

`passport_photos` remains a canonical F-0003 line but is handled manually by HR as hardcopy evidence.

## **8. Validation sequence**

n8n must validate in this order.

### **8.1 Form validation**

Check:

```
body.formId == sZFxwo2u1bus
body.submission.submissionId exists
body.submission.urlParameters exists
```

If `formId` does not match, stop.

### **8.2 Request envelope validation**

Read from `urlParameters`:

```
odoo_request_id
odoo_applicant_id
odoo_checklist_id
token_reference
expires_at
```

Then fetch Odoo request:

```
model: x_hr.applicant_required_document_submission_request
id: odoo_request_id
```

Validate:

```
request exists
request.x_token_reference == token_reference
request.x_applicant_id.id == odoo_applicant_id
request.x_checklist_id.id == odoo_checklist_id
request.x_state in sent/prepared
expires_at has not passed
```

Production posture:

```
sent only
```

Probe/testing posture:

```
sent or prepared
```

### **8.3 Section routing validation**

For each section with `<prefix>_show = 1`, validate:

```
request_line exists
request_line.x_request_id == odoo_request_id
request_line.x_applicant_id == odoo_applicant_id
request_line.x_checklist_id == odoo_checklist_id
request_line.x_checklist_line_id == <prefix>_checklist_line_id
request_line.x_document_type_id == <prefix>_document_type_id
request_line.x_document_code == <prefix>_document_code
request_line.x_state in requested/submitted
request_line.x_public_request_enabled == true
```

Then validate checklist line:

```
checklist_line exists
checklist_line.x_checklist_id == odoo_checklist_id
checklist_line.x_document_type_id == <prefix>_document_type_id
checklist_line.x_document_code == <prefix>_document_code
```

If any of these checks fail, do not create a submission for that section.

## **9. Duplicate handling**

n8n must be idempotent.

Before creating a submission, search Odoo:

```
model: x_hr.applicant_required_document_submission
domain:
 x_source_submission_id = body.submission.submissionId
 x_submission_request_line_id = <prefix>_request_line_id
```

If found:

```
do not create duplicate
optionally update request_line.x_latest_submission_id
continue
```

For Pass 6C probe, duplicate strategy is:

```
skip existing submission and log as duplicate_skipped
```

Do not overwrite accepted/rejected submissions from n8n.

## **10. Attachment handling**

For file upload sections, n8n downloads the Fillout file and creates an Odoo attachment.

Target:

```
model: ir.attachment
```

Create values:

```
name = original file name or generated file name
datas = base64 file content
res_model = hr.applicant
res_id = odoo_applicant_id
mimetype = source mimetype if available
description = Required document submission attachment
```

Attachment ownership stays on the applicant to keep the recruitment file coherent.

Documents folder governance is Pass 6D, not 6C.

## **11. Odoo submission write target**

For each valid submitted section, n8n creates:

```
model: x_hr.applicant_required_document_submission
```

Core create values:

```
x_applicant_id = odoo_applicant_id
x_checklist_id = odoo_checklist_id
x_line_id = <prefix>_checklist_line_id
x_document_type_id = <prefix>_document_type_id
x_document_code = <prefix>_document_code
x_submission_request_id = odoo_request_id
x_submission_request_line_id = <prefix>_request_line_id
x_source = fillout_zite
x_source_submission_id = body.submission.submissionId
x_source_reference = <prefix>_request_line_id
x_state = submitted
x_attachment_id = created attachment ID, if any
```

Do not write:

```
accepted
rejected
reviewed_by
reviewed_on
```

Those belong to HR review actions in Odoo.

## **12. Generic metadata mapping**

Use these generic fields when present:

```
x_document_number
x_issuing_authority
x_place_of_issue
x_issue_date
x_expiry_date
x_notes
```

Section mappings:

### **qualification**

```
qualification_document_number → x_document_number
qualification_issuing_authority → x_issuing_authority
qualification_place_of_issue → x_place_of_issue
qualification_date_of_issue → x_issue_date
qualification_date_of_expiry → x_expiry_date
qualification_notes → x_notes
```

### **birth_certificate**

```
birth_certificate_document_number → x_document_number
birth_certificate_issuing_authority → x_issuing_authority
birth_certificate_place_of_issue → x_place_of_issue
birth_certificate_date_of_issue → x_issue_date
birth_certificate_date_of_expiry → x_expiry_date
birth_certificate_notes → x_notes
```

### **family_status**

```
family_status_document_number → x_document_number
family_status_issuing_authority → x_issuing_authority
family_status_place_of_issue → x_place_of_issue
family_status_date_of_issue → x_issue_date
family_status_date_of_expiry → x_expiry_date
family_status_notes → x_notes
```

### **residence_certificate**

```
residence_certificate_document_number → x_document_number
residence_certificate_issuing_authority → x_issuing_authority
residence_certificate_place_of_issue → x_place_of_issue
residence_certificate_date_of_issue → x_issue_date
residence_certificate_date_of_expiry → x_expiry_date
residence_certificate_notes → x_notes
```

### **national_id**

```
national_id_number → x_document_number
national_id_issuing_authority → x_issuing_authority
national_id_place_of_issue → x_place_of_issue
national_id_date_of_issue → x_issue_date
national_id_date_of_expiry → x_expiry_date
national_id_notes → x_notes
```

### **criminal_record**

```
criminal_record_document_number → x_document_number
criminal_record_issuing_authority → x_issuing_authority
criminal_record_place_of_issue → x_place_of_issue
criminal_record_date_of_issue → x_issue_date
criminal_record_date_of_expiry → x_expiry_date
criminal_record_notes → x_notes
```

### **health_certificate**

```
health_certificate_document_number → x_document_number
health_certificate_issuing_authority → x_issuing_authority
health_certificate_place_of_issue → x_place_of_issue
health_certificate_date_of_issue → x_issue_date
health_certificate_date_of_expiry → x_expiry_date
health_certificate_notes → x_notes
```

### **passport**

```
passport_number → x_document_number
passport_issuing_authority → x_issuing_authority
passport_place_of_issue → x_place_of_issue
passport_date_of_issue → x_issue_date
passport_date_of_expiry → x_expiry_date
passport_notes → x_notes
```

### **id_card**

```
id_card_number → x_document_number
id_card_issuing_authority → x_issuing_authority
id_card_place_of_issue → x_place_of_issue
id_card_date_of_issue → x_issue_date
id_card_date_of_expiry → x_expiry_date
id_card_notes → x_notes
```

### **driving_license**

```
driving_license_number → x_document_number
driving_license_issuing_authority → x_issuing_authority
driving_license_place_of_issue → x_place_of_issue
driving_license_date_of_issue → x_issue_date
driving_license_date_of_expiry → x_expiry_date
driving_license_notes → x_notes
```

### **non_duplication_certificate**

```
non_duplication_certificate_document_number → x_document_number
non_duplication_certificate_issuing_authority → x_issuing_authority
non_duplication_certificate_place_of_issue → x_place_of_issue
non_duplication_certificate_date_of_issue → x_issue_date
non_duplication_certificate_date_of_expiry → x_expiry_date
non_duplication_certificate_notes → x_notes
```

## **13. Structured field mapping**

### **qualification**

```
qualification_type → x_qualification_type
qualification_subject → x_qualification_subject
```

### **birth_certificate**

```
date_of_birth → x_date_of_birth
place_of_birth → x_place_of_birth
country_of_birth → x_country_of_birth_id
```

`country_of_birth` must write a native Odoo `res.country` ID.

If Fillout sends a label instead of an Odoo ID, n8n must map it before writing.

### **family_status**

```
family_paper_number → x_family_paper_number
family_reference_number → x_family_reference_number
next_of_kin_name → x_next_of_kin_name
next_of_kin_phone → x_next_of_kin_phone
```

### **health_certificate**

```
blood_type → x_blood_type
```

### **bank_information**

```
bank_name → x_bank_name
bank_branch → x_bank_branch
account_number → x_account_number
iban → x_iban
bank_notes → x_notes
```

Minimum required bank writeback fields:

```
bank_name
bank_branch
account_number
```

IBAN is optional for now.

## **14. File upload field mapping**

Expected file fields:

```
cv_file_upload
qualification_file_upload
birth_certificate_file_upload
family_status_file_upload
residence_certificate_file_upload
national_id_file_upload
criminal_record_file_upload
health_certificate_file_upload
passport_file_upload
id_card_file_upload
driving_license_file_upload
non_duplication_certificate_file_upload
```

No file field is expected for:

```
bank_information
passport_photos
```

## **15. Section processing rule**

For each prefix:

```
if <prefix>_show != 1:
   skip section
elif no uploaded file and no structured data:
   mark section as no_payload
elif request/checklist validation fails:
   mark section as validation_failed
else:
   create attachment if file exists
   create Odoo submission
   update request line
```

For attachment-required sections:

```
if requires_attachment == true and no file:
   do not create submission
   mark section as attachment_missing
```

For bank information:

```
file not required
structured data required
create submission if minimum bank fields exist
```

## **16. Request-line update after successful writeback**

After creating a submission, update:

```
model: x_hr.applicant_required_document_submission_request_line
id: <prefix>_request_line_id
```

Write:

```
x_state = submitted
x_latest_submission_id = created submission ID
```

Do not mark accepted. HR review handles acceptance.

## **17. Request header update after successful writeback**

After any successful section writeback, update:

```
model: x_hr.applicant_required_document_submission_request
id: odoo_request_id
```

Write:

```
x_last_response_at = body.submission.submissionTime or current datetime
```

Do not mark completed in the initial 6C probe.

Completion can be inferred later when all request lines are submitted/accepted.

## **18. Error handling**

n8n should produce a normalized processing summary:

```
{
 "form_id": "sZFxwo2u1bus",
 "submission_id": "...",
 "request_id": 0,
 "status": "partial_success",
 "sections": [
   {
     "prefix": "qualification",
     "status": "created",
     "submission_id": 123,
     "attachment_id": 456
   },
   {
     "prefix": "passport",
     "status": "attachment_missing"
   }
 ]
}
```

Allowed top-level statuses:

```
success
partial_success
validation_failed
duplicate_skipped
error
```

Allowed section statuses:

```
skipped_not_requested
no_payload
validation_failed
attachment_missing
duplicate_skipped
created
error
```

For Pass 6C, errors may be logged in n8n execution logs first.

Odoo-side error/audit model is deferred unless required.

## **19. Chatter**

For the initial probe, n8n may post chatter on the request and applicant after successful writeback:

```
Required document submission received from Fillout: <submissionId>
```

Do not spam one chatter message per field.

Recommended:

* one summary on request;  
* one summary on applicant;  
* no chatter on every checklist line during the probe.

  ## **20. 6C probe acceptance**

6C is accepted when this works end-to-end:

```
Create request in Odoo
Generate request lines
Generate URL
Send/open Fillout
Submit one attachment document
Submit bank information without attachment
n8n creates Odoo submissions
request lines become submitted
HR accepts submissions in Odoo
checklist lines become accepted
Validate readiness reads accepted submissions correctly
```

Out of scope for 6C:

```
final Documents app folder governance
production retry dashboard
candidate portal
automatic HR acceptance
automatic F-0003 PDF generation
automatic Odoo Sign send
```

