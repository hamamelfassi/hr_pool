# Fillout Required Document Submission Contract

This document locks the Fillout/Zite/n8n payload contract for Pass 6B and 6C of `hr_recruitment_custom`.

It governs the public continuation form used for required document submissions connected to the F-0003 required-document checklist.

## 1. Role of each system

### Odoo

Odoo remains the lifecycle authority.

Odoo owns:

- applicant record;
- F-0003 checklist;
- F-0003 checklist lines;
- required document type library;
- submission request;
- submission request lines;
- submitted evidence records;
- HR accept/reject review;
- readiness validation;
- F-0003 PDF/sign lifecycle;
- recruitment document registry.

### Fillout

Fillout is the candidate-facing public form.

Fillout owns:

- user-facing public form sections;
- upload questions;
- applicant-entered structured values;
- hidden fields / URL parameter passthrough;
- webhook payload to n8n.

### Zite

Zite is a lightweight form-support/data surface.

Zite may mirror:

- request/form header metadata;
- request/form line metadata;
- document codes;
- Fillout field IDs;
- routing parameters.

Zite is not the authoritative lifecycle store.

### n8n

n8n is the integration writer.

n8n validates request/token context, downloads uploaded files, creates Odoo attachments, and creates Odoo required document submission records.

## 2. Current Fillout form

Current Fillout form:

- Form name: `Submit Documents Requested`
- Form ID: `sZFxwo2u1bus`

The webhook payload contains:

- `body.formId`
- `body.formName`
- `body.submission.submissionId`
- `body.submission.submissionTime`
- `body.submission.lastUpdatedAt`
- `body.submission.questions`
- `body.submission.urlParameters`

## 3. Routing source of truth

For n8n routing, use this rule:

`urlParameters = authoritative for request/routing metadata`
`questions = authoritative for applicant-filled values and file uploads`

Reason:

* URL parameters are sent independently in body.submission.urlParameters.  
* Hidden question fields may also exist in body.submission.questions, but may be null depending on form/default behavior.  
* Applicant-entered Arabic fields and file uploads are only available through questions.

## **4 Odoo request envelope parameters**

The generated Fillout URL must include these top-level request parameters:

`odoo_request_id`
`odoo_applicant_id`
`odoo_checklist_id`
`request_reference`
`candidate_name`
`candidate_email`
`token_reference`
`expires_at`
`form_base_url`
`generated_url`
`state`
`sent_at`
`last_response_at`

n8n must validate at least:

`odoo_request_id`
`odoo_applicant_id`
`odoo_checklist_id`
`token_reference`
`expires_at`

## **5 Document routing parameter pattern**

Each public-request-enabled document type uses this parameter pattern:

`<prefix>_show`
`<prefix>_request_line_id`
`<prefix>_checklist_line_id`
`<prefix>_document_type_id`
`<prefix>_document_code`

Example:

`cv_show`
`cv_request_line_id`
`cv_checklist_line_id`
`cv_document_type_id`
`cv_document_code`

Meaning:

* \<prefix\>_show controls Fillout conditional visibility.  
* \<prefix\>_request_line_id identifies the Odoo request line.  
* \<prefix\>_checklist_line_id identifies the F-0003 checklist line.  
* \<prefix\>_document_type_id identifies the Odoo required document type.  
* \<prefix\>_document_code provides a stable integration/debugging code.

## 6 Canonical F-0003 document codes

The canonical required document set is:

| Sequence | Code                        | Fillout Prefix              | Public Request | requires_attachment | Notes                                   |
| -------- | --------------------------- | --------------------------- | -------------- | ------------------- | --------------------------------------- |
| 10       | cv                          | cv                          | yes            | yes                 | Curriculum Vitae                        |
| 20       | qualification               | qualification               | yes            | yes                 | Academic qualification                  |
| 30       | birth_certificate           | birth_certificate           | yes            | yes                 | Birth certificate                       |
| 40       | family_status               | family_status               | yes            | yes                 | Family status / family paper            |
| 50       | residence_certificate       | residence_certificate       | yes            | yes                 | Residence certificate                   |
| 60       | national_id                 | national_id                 | yes            | yes                 | National ID number copy                 |
| 70       | criminal_record             | criminal_record             | yes            | yes                 | Criminal record certificate             |
| 80       | health_certificate          | health_certificate          | yes            | yes                 | Health certificate                      |
| 90       | passport                    | passport                    | yes            | yes                 | Passport copy                           |
| 100      | id_card                     | id_card                     | yes            | yes                 | Personal ID card copy                   |
| 110      | driving_license             | driving_license             | yes            | yes                 | Driving license copy                    |
| 120      | passport_photos             | passport_photos             | no             | no                  | Eight hardcopy photos; manual HR review |
| 130      | non_duplication_certificate | non_duplication_certificate | yes            | yes                 | Non-duplication certificate             |
| 140      | bank_information            | bank_information            | yes            | no                  | Structured bank data only               |

No “additional document” placeholder rows are seeded in the canonical checklist.

## 7 F-0003 PDF rule

F-0003 is a checklist/control sheet, not the evidence data store.

The PDF must not print evidence metadata such as:

* document number;  
* issuing authority;  
* place of issue;  
* issue/expiry dates;  
* bank account;  
* IBAN;  
* birth data;  
* family data;  
* qualification data;  
* health data.

The signed F-0003 checklist should render all canonical lines with minimal columns:

- No.
- Required Document
- Required
- Accepted
- Optional HR Notes

The only line-level dynamic checkboxes are:

* required;  
* accepted.

## 8. Attachment exception rules

Most public document submissions require an attachment.

Exceptions:

### passport_photos

* Not shown in Fillout.  
* Required as hardcopy.  
* HR/recruitment may create or accept a manual internal submission without attachment.  
* The line remains canonical to keep the checklist layout stable.

### bank_information

* Shown in Fillout.  
* Does not require attachment.  
* Requires structured bank fields.  
* HR may accept the submission without attachment after reviewing the bank data.

## 9 Applicant-filled fields by document section

### CV

Routing:

- `cv_show`
- `cv_request_line_id`
- `cv_checklist_line_id`
- `cv_document_type_id`
- `cv_document_code`

Applicant fields:

- `cv_file_upload`
- `cv_notes`

### Qualification

Routing:

- `qualification_show`
- `qualification_request_line_id`
- `qualification_checklist_line_id`
- `qualification_document_type_id`
- `qualification_document_code`

Applicant fields:

- `qualification_subject`
- `qualification_type`
- `qualification_issuing_authority`
- `qualification_document_number`
- `qualification_place_of_issue`
- `qualification_date_of_issue`
- `qualification_date_of_expiry`
- `qualification_file_upload`
- `qualification_notes`

### Birth Certificate

Routing:

- `birth_certificate_show`
- `birth_certificate_request_line_id`
- `birth_certificate_checklist_line_id`
- `birth_certificate_document_type_id`
- `birth_certificate_document_code`

Applicant fields:

- `birth_certificate_file_upload`
- `date_of_birth`
- `place_of_birth`
- `country_of_birth`
- `birth_certificate_document_number`
- `birth_certificate_issuing_authority`
- `birth_certificate_place_of_issue`
- `birth_certificate_date_of_issue`
- `birth_certificate_date_of_expiry`
- `birth_certificate_notes`

### Family Status

Routing:

- `family_status_show`
- `family_status_request_line_id`
- `family_status_checklist_line_id`
- `family_status_document_type_id`
- `family_status_document_code`

Applicant fields:

- `family_status_file_upload`
- `family_reference_number`
- `family_paper_number`
- `next_of_kin_phone`
- `next_of_kin_name`
- `family_status_document_number`
- `family_status_issuing_authority`
- `family_status_place_of_issue`
- `family_status_date_of_issue`
- `family_status_date_of_expiry`
- `family_status_notes`

### Residence Certificate

Routing:

- `residence_certificate_show`
- `residence_certificate_request_line_id`
- `residence_certificate_checklist_line_id`
- `residence_certificate_document_type_id`
- `residence_certificate_document_code`

Applicant fields:

- `residence_certificate_file_upload`
- `residence_certificate_document_number`
- `residence_certificate_issuing_authority`
- `residence_certificate_place_of_issue`
- `residence_certificate_date_of_issue`
- `residence_certificate_date_of_expiry`
- `residence_certificate_notes`

### National ID

Routing:

- `national_id_show`
- `national_id_request_line_id`
- `national_id_checklist_line_id`
- `national_id_document_type_id`
- `national_id_document_code`

Applicant fields:

- `national_id_file_upload`
- `national_id_number`
- `national_id_issuing_authority`
- `national_id_place_of_issue`
- `national_id_date_of_issue`
- `national_id_date_of_expiry`
- `national_id_notes`

### Criminal Record

Routing:

- `criminal_record_show`
- `criminal_record_request_line_id`
- `criminal_record_checklist_line_id`
- `criminal_record_document_type_id`
- `criminal_record_document_code`

Applicant fields:

- `criminal_record_file_upload`
- `criminal_record_document_number`
- `criminal_record_issuing_authority`
- `criminal_record_place_of_issue`
- `criminal_record_date_of_issue`
- `criminal_record_date_of_expiry`
- `criminal_record_notes`

### Health Certificate

Routing:

- `health_certificate_show`
- `health_certificate_request_line_id`
- `health_certificate_checklist_line_id`
- `health_certificate_document_type_id`
- `health_certificate_document_code`

Applicant fields:

`health_certificate_file_upload`
`blood_type`
`health_certificate_document_number`
`health_certificate_issuing_authority`
`health_certificate_place_of_issue`
`health_certificate_date_of_issue`
`health_certificate_date_of_expiry`
`health_certificate_notes

### Passport

Routing:

- `passport_show`
- `passport_request_line_id`
- `passport_checklist_line_id`
- `passport_document_type_id`
- `passport_document_code`

Applicant fields:

- `passport_file_upload`
- `passport_number`
- `passport_issuing_authority`
- `passport_place_of_issue`
- `passport_date_of_issue`
- `passport_date_of_expiry`
- `passport_notes`

### ID Card

Routing:

- `id_card_show`
- `id_card_request_line_id`
- `id_card_checklist_line_id`
- `id_card_document_type_id`
- `id_card_document_code`

Applicant fields:

- `id_card_file_upload`
- `id_card_number`
- `id_card_issuing_authority`
- `id_card_place_of_issue`
- `id_card_date_of_issue`
- `id_card_date_of_expiry`
- `id_card_notes`

### Driving License

Routing:

- `driving_license_show`
- `driving_license_request_line_id`
- `driving_license_checklist_line_id`
- `driving_license_document_type_id`
- `driving_license_document_code`

Applicant fields:

- `driving_license_file_upload`
- `driving_license_number`
- `driving_license_issuing_authority`
- `driving_license_place_of_issue`
- `driving_license_date_of_issue`
- `driving_license_date_of_expiry`
- `driving_license_notes`

### Non-Duplication Certificate

Routing:

- `non_duplication_certificate_show`
- `non_duplication_certificate_request_line_id`
- `non_duplication_certificate_checklist_line_id`
- `non_duplication_certificate_document_type_id`
- `non_duplication_certificate_document_code`

Applicant fields:

- `non_duplication_certificate_file_upload`
- `non_duplication_certificate_document_number`
- `non_duplication_certificate_issuing_authority`
- `non_duplication_certificate_place_of_issue`
- `non_duplication_certificate_date_of_issue`
- `non_duplication_certificate_date_of_expiry`
- `non_duplication_certificate_notes`

### Bank Information

Routing:

- `bank_information_show`
- `bank_information_request_line_id`
- `bank_information_checklist_line_id`
- `bank_information_document_type_id`
- `bank_information_document_code`

Applicant fields:

- `bank_name`
- `bank_branch`
- `account_number`
- `iban`
- `bank_notes`

## **10 n8n writeback target**

For each submitted document section, n8n creates one Odoo record:

`x_hr.applicant_required_document_submission`

Core write values:

```
x_applicant_id = odoo_applicant_id
x_checklist_id = odoo_checklist_id
x_line_id = <prefix>_checklist_line_id
x_document_type_id = <prefix>_document_type_id
x_source = fillout_zite
x_state = submitted
x_source_submission_id = Fillout submission ID
x_source_reference = <prefix>_request_line_id
```

If the section has an uploaded file:

`x_attachment_id = created ir.attachment id`

If the section is structured-only:

`x_attachment_id = empty`

## **11 Zite table shape**

Use two Zite tables if mirroring is needed.

### **Required document submission requests**

One row per generated request/form session.

Suggested fields:

`odoo_request_id`
`odoo_applicant_id`
`odoo_checklist_id`
`request_reference`
`candidate_name`
`candidate_email`
`token_reference`
`expires_at`
`form_base_url`
`generated_url`
`state`
`sent_at`
`last_response_at`

### **Required document submission request lines**

One row per requested document line.

Suggested fields:

`odoo_request_id`
`odoo_request_line_id`
`odoo_applicant_id`
`odoo_checklist_id`
`odoo_checklist_line_id`
`odoo_document_type_id`
`document_code`
`document_name_ar`
`document_name_en`
`show_section`
`line_state`
`upload_received`
`created_odoo_submission_id`
`last_fillout_submission_id`
`last_error`

Do not add separate Zite response and response-line tables yet.

## **12 Pass 6C writeback rule**

Pass 6C should create 6A submission records directly from Fillout/n8n payloads.

HR review remains in Odoo:

```
Submissions tab
→ Accept / Reject
→ checklist line writeback
→ readiness validation
→ F-0003 PDF/sign
```


