# Document Artifact and Signing Pattern

## Purpose

This document defines the reusable Marsellia employment lifecycle pattern for generated PDFs, signed PDFs, Odoo Sign requests, certificates, chatter/files, and source-record lifecycle closure.

Employment lifecycle processes should not use a recruitment-style central registry.

Each process record owns its own artifacts and state.

---

## Source-record ownership rule

The source process record is the lifecycle authority.

Examples:

| Process | Lifecycle source |
|---|---|
| Employee declaration | `x_hr.employee_declaration` |
| Custody receipt | `x_hr.employee_custody_item` |
| Training undertaking | `x_hr.employee_training_commitment` |
| Permission request | `x_hr.employee_permission_request` |
| Work assignment | `x_hr.employee_work_assignment` |
| Appraisal form | `hr.appraisal` plus extension fields/lines |
| Separation request | `x_hr.employee_separation_request` |
| Clearance | `x_hr.employee_clearance` |

Do not close a process only because an attachment exists. The source record state and artifact fields must be updated explicitly.

---

## Standard artifact field manifest

Use these fields on custom process models where the process creates a formal Marsellia document:

```text
x_reference_code
x_document_reference
x_state
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_sign_request_res_id
x_sign_request_state
x_sign_request_reference
x_sign_request_url
x_generated_on
x_sent_on
x_signed_on
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
x_responsible_user_id
x_notes
```

For native models such as `hr.leave` and `hr.appraisal`, apply only the subset needed for the official Marsellia form.

---

## Canonical document lifecycle

Default document lifecycle:

```text
draft
→ generated
→ signature_requested
→ signed
```

Additional terminal/exception states:

```text
cancelled
superseded
rejected
blocked
```

### State meaning

| State | Meaning |
|---|---|
| `draft` | Business data is being prepared. No official PDF is locked. |
| `generated` | QWeb PDF was generated and attached to the source record. |
| `signature_requested` | Native Odoo Sign request was created/sent. |
| `signed` | Signed business PDF was synced back and the source record was closed as signed. |
| `cancelled` | Process intentionally cancelled before completion. |
| `superseded` | A newer controlled version replaces this artifact. |
| `blocked` | Process cannot proceed until missing prerequisites are resolved. |

---

## QWeb generation rule

The generation action must:

1. snapshot or freeze values that must not change after signing;
2. render the correct QWeb report;
3. create an `ir.attachment` linked to the source process record;
4. write `x_pdf_attachment_id`;
5. write `x_generated_on`;
6. set state to `generated`;
7. post a chatter message on the source record and, where useful, on `hr.employee`.

Do not silently overwrite a signed document. If regeneration is required after signing, use controlled supersession/versioning.

---

## Odoo Sign send rule

The Sign send action must:

1. validate that the generated PDF exists;
2. prevent duplicate active requests;
3. create a dynamic `sign.template`;
4. create a `sign.document` from the generated PDF attachment;
5. create `sign.item` signature/date fields with calibrated coordinates;
6. create `sign.send.request` and signer rows;
7. execute `send_request()`;
8. locate the resulting `sign.request`;
9. write Sign linkage fields to the source record;
10. set state to `signature_requested`;
11. post a chatter message;
12. create activities if another user must follow up.

Minimum linkage fields:

```text
x_sign_request_res_id
x_sign_request_state
x_sign_request_reference
x_sign_request_url
x_sent_on
```

---

## Odoo Sign sync rule

The sync action must:

1. read the linked `sign.request`;
2. update `x_sign_request_state`;
3. if not signed, show a warning and keep the process open;
4. if signed, discover the signed business PDF and certificate;
5. distinguish the signed business PDF from certificate/history/audit PDFs;
6. copy signed and certificate artifacts to the source record where needed;
7. copy/post signed and certificate artifacts to `hr.employee` chatter/files;
8. write `x_signed_attachment_id`;
9. write `x_sign_certificate_attachment_id` where found;
10. write `x_signed_on`;
11. set source state to `signed`;
12. post source and employee chatter messages.

Do not retarget existing Sign attachments in place. Copy artifacts to the employee/source record when needed.

---

## Business PDF vs certificate

The signed business PDF is the authoritative signed form.

The certificate is supporting evidence.

Do not treat certificate/history/audit PDFs as the signed business document.

Certificate discovery should check:

```text
name contains certificate/completion/history/audit/trail/شهادة/إكمال
linked sign.request attachments
source process record attachments
employee chatter/files attachments
```

---

## Attachment visibility rule

Each final signed artifact must be visible through:

```text
source process record attachment fields
source process record chatter/files
hr.employee chatter/files
linked sign.request where applicable
```

Direct `/web/content/...` URL actions are convenience controls only. They are not the only access path.

---

## Mobile-safe rule

Odoo mobile may fail or behave inconsistently with direct URL download actions.

A workflow is not mobile-safe unless the final signed artifact can be opened from the employee record chatter/files in the native mobile app.

---

## Manual decision metadata rule

Where a process has manual approvals/decisions before future GRC decision-instance integration, use:

```text
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

Examples:

```text
leave approval
training funding
permission approval
work assignment
separation
clearance override
```

Do not implement GRC `decision_instance` in the first employment lifecycle build.

---

## Generated/signed/certificate icon rule

Artifact icons may remain in the form header or artifact section if cleanly grouped.

They must never split or interrupt business workflow buttons.

Recommended split:

```text
Header/statusbar:
- state/statusbar
- small artifact icon controls only, if visually safe

Below statusbar / inside sheet:
- workflow action row
- generate / send / sync / approve / reject buttons
```

---

## Supersession/versioning rule

Do not silently regenerate over a signed document.

Allowed patterns:

```text
block regeneration if signed
or
mark old record superseded and generate a new version
```

The first implementation of each process should prefer blocking unless a versioning flow is explicitly scoped.

---

## Acceptance checklist for a signed artifact workflow

A process artifact workflow is acceptable only when:

- generated PDF is attached to the source record;
- generated PDF opens from desktop;
- generated PDF is visible enough from the source record;
- Sign request is created with correct signer(s);
- Sign request is anchored to the source process record;
- employee Sign Requests visibility is attempted where safe;
- signed PDF is discovered and copied back;
- certificate is discovered and copied back where available;
- signed PDF and certificate are posted to employee chatter/files;
- source state becomes `signed`;
- state fields are readonly/action-written;
- duplicate sends are blocked;
- mobile-safe access path exists through chatter/files.

## Accepted Pass 15 declaration artifact and Sign pattern

Pass 15 locked the following practical pattern for employee declaration forms.

### Source process record

Each employee declaration is represented by:

```text
x_hr.employee_declaration
```

The process record owns:

- lifecycle state;
- generated PDF;
- Sign request linkage;
- signed PDF;
- Sign certificate;
- sent/signed timestamps;
- responsible user and notes.

### User-facing artifact access

Do not expose raw `ir.attachment` many2one links as the main user surface.

Raw attachment many2one fields can remain hidden as lifecycle truth:

```text
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
```

User-facing access should use download actions:

```text
/web/content/<attachment_id>?download=true
```

This prevents users landing on the technical `ir.attachment` metadata form.

### Employee chatter/files copy

Generated PDFs, signed PDFs, and certificates must be posted/copied to the linked `hr.employee` chatter/files. This is the mobile-safe access layer.

### Sign anchoring

Sign requests should remain anchored to the declaration process record through stored fields:

```text
x_sign_request_res_id
x_sign_request_state
x_sign_request_reference
x_sign_request_url
```

Sign smart-button visibility is useful but is not lifecycle truth.

### Geometry calibration

Generate and accept the PDF first. Then add Sign items. Then calibrate only:

```text
posX
posY
width
height
```

Do not rework lifecycle code when only Sign item placement is wrong.
