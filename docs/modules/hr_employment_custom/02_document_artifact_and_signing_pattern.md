# Document Artifact and Signing Pattern

## Purpose

Employment process models should own their own document artifacts.

Do not create a recruitment-style central registry for employment unless a later governance pass proves a need.

## Standard fields

Use these fields consistently where a process generates or signs a formal Marsellia artifact:

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

For native models such as `hr.leave` and `hr.appraisal`, apply only the subset needed for the formal Marsellia artifact.

## Default lifecycle

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

## Signing workflow

Use the proven QWeb and native Odoo Sign pattern:

1. generate QWeb PDF;
2. store generated PDF attachment on the source process record;
3. create dynamic Sign template/document/items;
4. create `sign.send.request`;
5. store linked `sign.request` fields on the source process record;
6. explicitly sync the signed result;
7. copy signed PDF and certificate to the source record and `hr.employee` chatter/files;
8. mark source process state as signed/complete.

## Artifact storage rule

Each signed artifact must be visible from:

- the source process record;
- `hr.employee` chatter/files;
- linked Odoo Sign request where applicable.

Do not rely only on `/web/content/...` URL buttons.

## Manual decision metadata

Where a workflow still depends on a manual management decision, store:

- manual decision number;
- manual decision date;
- decision attachment.

Do not implement GRC `decision_instance` until the relevant process is stable.
