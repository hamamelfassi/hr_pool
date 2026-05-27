
# Reusable Document Artifact Pattern

## Purpose

Employment lifecycle process models should own their own document artifacts instead of writing to a central recruitment-style registry.

## Standard fields for custom process models

Use these fields consistently where the process generates/signs a formal Marsellia artifact:

- `x_reference_code`
- `x_document_reference`
- `x_state`
- `x_pdf_attachment_id`
- `x_signed_attachment_id`
- `x_sign_certificate_attachment_id`
- `x_sign_request_res_id`
- `x_sign_request_state`
- `x_sign_request_reference`
- `x_sign_request_url`
- `x_generated_on`
- `x_sent_on`
- `x_signed_on`
- `x_manual_decision_number`
- `x_manual_decision_date`
- `x_manual_decision_attachment_id`
- `x_responsible_user_id`
- `x_notes`

## Native model extensions

For native models such as `hr.leave` and `hr.appraisal`, apply only the subset needed for the formal Marsellia artifact.

Do not overload native models with unused fields.

## Lifecycle

Default lifecycle:

```text
draft
generated
signature_requested
signed
cancelled
superseded
```

Some operational processes may add:

```text
submitted
manager_review
hr_review
gm_approval
approved
rejected
closed
```

## Artifact storage rule

Each signed artifact must be visible from:

- the source process record;
- `hr.employee` chatter/files;
- linked Odoo Sign request where applicable.

Do not rely only on `/web/content/...` URL buttons.
