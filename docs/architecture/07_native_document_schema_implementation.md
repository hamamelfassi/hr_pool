# Native Document Schema Implementation

This document records the concrete schema changes that implement the native-first document posture:

- `Documents` as the default DMS
- `Sign` as the external signature engine
- `QWeb` as the PDF renderer for dynamic / multi-line forms
- `Chatter` and `Activities` as the operational traceability layer

It complements:

- `05_hr_native_first_decision_matrix.md`
- `06_hr_native_first_workflow_playbook.md`

## 1. Implemented runtime models

### 1.1 `x_hr.pool`

Current role:

- frozen intake and prescreening record
- keeps the live Fillout/Zite/n8n contract intact
- now carries document hooks and chatter/activity support

Implemented hooks:

- `x_documents_folder_id` -> `documents.folder`
- `x_intake_pdf_attachment_id` -> `ir.attachment`
- `x_signed_pdf_attachment_id` -> `ir.attachment`

Workflow support:

- `is_mail_thread = True`
- `is_mail_activity = True`

### 1.2 `x_grc.hr_interview_evaluation`

Current role:

- governed runtime record for candidate interview evaluations
- owns scoring lines, state, attachments, and chatter/activity tracking

Implemented hooks:

- `x_code`
- `x_name`
- `x_state`
- `x_applicant_id` -> `hr.applicant`
- `x_job_id` -> `hr.job`
- `x_interviewer_user_id` -> `res.users`
- `x_documents_folder_id` -> `documents.folder`
- `x_signature_profile_id` -> `x_grc.hr_signature_profile`
- `x_pdf_attachment_id` -> `ir.attachment`
- `x_signed_pdf_attachment_id` -> `ir.attachment`
- `x_notes`
- `x_line_ids` -> `x_grc.hr_interview_evaluation_line`

Workflow support:

- `is_mail_thread = True`
- `is_mail_activity = True`

### 1.3 `x_grc.hr_interview_evaluation_line`

Current role:

- scoring line for the interview evaluation runtime record

Implemented hooks:

- `x_evaluation_id` -> `x_grc.hr_interview_evaluation`
- `x_sequence`
- `x_template_line_id` -> `x_grc.hr_interview_template_line`
- `x_question`
- `x_score`
- `x_max_score`
- `x_weight`
- `x_notes`

## 2. Implemented bridge model hooks

### 2.1 `hr.job`

Implemented hooks:

- `x_grc_functional_area_id` -> `x_grc.functional_area`
- `x_grc_function_id` -> `x_grc.function`
- `x_grc_role_template_id` -> `x_grc.hr_role_template`
- `x_grc_signature_profile_id` -> `x_grc.hr_signature_profile`
- `x_grc_interview_template_id` -> `x_grc.hr_interview_template`
- `x_grc_document_checklist_template_id` -> `x_grc.hr_document_checklist_template`
- `x_grc_onboarding_pack_id` -> `x_grc.hr_onboarding_pack`
- `x_grc_declaration_pack_id` -> `x_grc.hr_declaration_pack`
- `x_documents_folder_id` -> `documents.folder`
- `x_tor_pdf_attachment_id` -> `ir.attachment`

### 2.2 `hr.applicant`

Implemented hooks:

- `x_documents_folder_id` -> `documents.folder`
- `x_signature_profile_id` -> `x_grc.hr_signature_profile`
- `x_interview_evaluation_id` -> `x_grc.hr_interview_evaluation`
- `x_pdf_attachment_id` -> `ir.attachment`
- `x_signed_pdf_attachment_id` -> `ir.attachment`

### 2.3 Bridge template roots

Implemented hooks:

- `x_documents_folder_id` on:
  - `x_grc.hr_role_template`
  - `x_grc.hr_interview_template`
  - `x_grc.hr_document_checklist_template`
  - `x_grc.hr_onboarding_pack`
  - `x_grc.hr_declaration_pack`
  - `x_grc.hr_signature_profile`
- `x_sign_template_id` on:
  - `x_grc.hr_signature_profile`
  - `x_grc.hr_declaration_pack`
  - `x_grc.hr_onboarding_pack`

## 3. Implemented report actions

### 3.1 `x_hr.pool` intake snapshot

Action:

- `action_report_hr_pool_intake_snapshot`

Report:

- template: `hr_pool.report_hr_pool_intake_snapshot_document`
- type: `qweb-pdf`
- paperformat: `paperformat_hr_pool_native`

Storage posture:

- attachment reuse is enabled
- the intake PDF snapshot becomes a durable artifact on the runtime record

### 3.2 `hr.job` TOR / job description

Action:

- `action_report_hr_job_tor`

Report:

- template: `grc_recruitment_bridge.report_hr_job_tor_document`
- type: `qweb-pdf`
- paperformat: `paperformat_hr_recruitment_native`

Purpose:

- render a paper-like, multi-line TOR / job description from the governed bridge fields and role template lines

### 3.3 `x_grc.hr_interview_evaluation`

Action:

- `action_report_hr_interview_evaluation`

Report:

- template: `grc_recruitment_bridge.report_hr_interview_evaluation_document`
- type: `qweb-pdf`
- paperformat: `paperformat_hr_recruitment_native`

Purpose:

- render the governed interview evaluation record as a signed or signable PDF

## 4. Storage rules

The storage rules are:

1. The runtime record owns the workflow state.
2. `Documents` owns the file lifecycle and searchable DMS storage.
3. The runtime record keeps attachment pointers to the current PDF and signed PDF.
4. Sign completion must leave a signed artifact back on the runtime record.
5. Template source stays separate from generated evidence.

## 5. Operational sequence

### 5.1 Intake

1. Fillout/Zite/n8n creates or updates `x_hr.pool`.
2. The intake snapshot report can be generated from the record.
3. The PDF is stored in Documents and attached to `x_hr.pool`.

### 5.2 Recruitment evaluation

1. The candidate is converted into the recruitment runtime.
2. `x_grc.hr_interview_evaluation` is created.
3. QWeb renders the evaluation PDF.
4. The PDF is stored in Documents and attached to the evaluation record.
5. Sign is triggered if a signature profile requires it.

### 5.3 Job TOR

1. `hr.job` carries the governed template links.
2. QWeb renders the TOR / job description PDF.
3. The PDF is attached to the job record and filed in Documents.
4. The same artifact can then be routed to Sign if the workflow requires approval or countersignature.

## 6. Current boundary rule

- `grc_backbone` owns canonical governance primitives
- `grc_recruitment_bridge` owns recruitment-domain templates, runtime evaluation, and sign/report routing
- `hr_pool` stays frozen for intake and prescreening
- `hr_recruitment` remains the downstream applicant layer

