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
| Permission request | `x_hr.employee_permission` |
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

## Deferred Sign sync hardening note from Pass 16

Pass 16 exposed an important lifecycle guard issue:

- if a custody item is marked `lost` or `damaged`, its clearance status can become `blocked`;
- if the linked Odoo Sign request is already signed, pressing `Sync` can restore the custody state to `signed`;
- this can unintentionally reopen the path to `Mark Returned`.

Future Sign sync actions should distinguish between:

1. artifact/metadata synchronization; and
2. lifecycle state transitions.

The safe rule is:

```text
Sync may refresh artifacts and Sign metadata, but it must not silently reopen terminal or exception states.
```

Protected states should include at minimum:

```text
returned
lost
damaged
cancelled
superseded
```

Any reopening of those states should be explicit, governed, and chatter/audit visible.

## Translation doctrine for artifact process models

Operational rule:

```text
XML source labels stay English.
Arabic labels live in `i18n/ar_001.po`.
```

Do not make source labels bilingual unless an urgent operational workaround is explicitly accepted.

### Field, view, and action labels

Use the normal exported-anchor workflow:

1. install/upgrade the module;
2. export Arabic translations from Odoo;
3. rebase `modules/hr_employment_custom/i18n/ar_001.po` from the exported file;
4. patch `msgstr` values against the exported anchors;
5. rebuild and upgrade.

### Selection field values

Selection values require stricter handling.

Do not:

- invent PO references;
- create duplicate `ir.model.fields.selection` rows;
- manually change the selection source `name` to Arabic through Studio as the primary fix.

Correct sequence:

1. keep the selection source labels in English;
2. install/upgrade the module;
3. export Arabic translations;
4. if selection anchors are present, patch the PO against those anchors;
5. if selection anchors are missing, export records from `ir.model.fields.selection`;
6. use the exported `__export__.ir_model_fields_selection_...` IDs as PO references for the current SaaS database.

Known tradeoff:

- `__export__` selection IDs are database-local, not portable seeds.
- They are acceptable for controlled SaaS production translation repair when the source rows already exist and Odoo does not export stable module selection anchors.

## Pass 17 closure note — F-0008 training commitment lifecycle

Pass 17 implemented the training commitment foundation around F-0008.

Implemented:
- `x_hr.training` training type/framework model.
- `x_hr.training_course` training course/session model.
- `x_hr.employee_training_commitment` employee participation and undertaking model.
- Employee `Training` tab.
- F-0008 one-page A4 QWeb/PDF generation.
- Generated PDF storage, download icon, employee chatter/files posting.
- Native Odoo Sign send/sync for one employee signer and one signature item.
- Signed PDF and Sign certificate linkage/posting.
- Three-layer training state doctrine:
  - form lifecycle;
  - commitment lifecycle;
  - participation lifecycle.
- Manual commitment controls:
  - breached;
  - fulfilled;
  - cancelled.
- Manual participation controls:
  - in training;
  - complete;
  - incomplete.

Accepted residual deferral:
- Arabic translation for training selection-state values remains incomplete in the live UI and will be fixed later using exact exported `ir.model.fields.selection` anchors.
- Dynamic record-value Arabic PDF hardening remains deferred. Future official Arabic-first PDF generation should force Arabic render context and block generation with a specific toast when required Arabic record translations are missing.
- F-0008 thumbprint remains outside system workflow. No thumbprint fields, uploads, Sign items, or lifecycle states were introduced.

<!-- PASS18G_ARTIFACT_PATTERN_START -->
## Accepted Pass 18 permission artifact and Sign pattern

Pass 18 locked the administrative permission artifact/signature pattern for:

```text
MCEP-HR-F-0014 — Exit Permission
MCEP-HR-F-0015 — Lateness Permission
```

Source process record:

```text
x_hr.employee_permission
```

Helper/type model:

```text
x_hr.employee_permission_type
```

Accepted report approach:

```text
one dynamic QWeb template
type-routed form code and title
same structure for F-0014 and F-0015
generated PDF stored on x_pdf_attachment_id
generated PDF posted to employee chatter/files
```

Accepted document reference format:

```text
MCEP-HR-F-0014-00004-00002
MCEP-HR-F-0015-00004-00001
```

Accepted Sign sequence:

```text
1. Employee
2. Direct Manager
3. HR Responsible
```

Accepted coordinate baseline:

| Role | Signature posX | posY | width | height | Date posX | Date posY |
|---|---:|---:|---:|---:|---:|---:|
| Employee | `0.525` | `0.724` | `0.235` | `0.032` | `0.575` | `0.765` |
| Direct Manager | `0.080` | `0.724` | `0.235` | `0.032` | `0.125` | `0.765` |
| HR Responsible | `0.245` | `0.858` | `0.340` | `0.032` | `0.285` | `0.906` |

Accepted Sync behavior:

```text
read linked sign.request
refresh Sign state
if signed, find signed business PDF
separate signed PDF from certificate/audit artifacts
copy signed PDF to employee
copy certificate to employee where exposed
write x_signed_attachment_id
write x_sign_certificate_attachment_id where found
write x_signed_on
set x_state = signed
post employee chatter/files message
```

Protected boundary:

```text
Sync closes the permission as signed only from the active document/signature lifecycle.
It must not create attendance, leave, payroll, work-entry, disciplinary, deduction, approval.request, or GRC decision-instance effects.
```
<!-- PASS18G_ARTIFACT_PATTERN_END -->

## Pass 19 leave artifact posture

Pass 19 leave requests follow the same source-record artifact pattern as declarations, custody, training, and permissions.

The lifecycle source record is:

```text
x_hr.employee_leave_request
```

Native `hr.leave` is not the first-pass artifact lifecycle source. It is a later operational bridge target after the custom leave request is signed.

The generated/signed/certificate fields live on `x_hr.employee_leave_request`, and final signed artifacts must be posted to employee chatter/files.

Bridge fields such as `x_native_leave_id` may exist on the custom source record, but the source record remains the documentary approval authority for the official Marsellia form.

<!-- PASS19_LEAVE_ARTIFACT_SIGN_START -->
## Pass 19 F-0016 artifact and Sign pattern

F-0016 Leave Request follows the accepted custom process artifact doctrine:

1. Generate QWeb PDF from the source request record.
2. Store the generated PDF on `x_pdf_attachment_id`.
3. Post the generated PDF to employee chatter/files.
4. Create a dynamic Odoo Sign template/document/items from the generated PDF.
5. Send the Sign request to four sequential roles.
6. Sync the completed signed PDF and certificate back to the employee record.

Signer sequence:

    1. Employee
    2. Direct Manager
    3. HR Responsible
    4. General Manager

Locked F-0016 Sign coordinates:

| Role | Signature posX | Signature posY | Width | Height | Date posX | Date posY |
|---|---:|---:|---:|---:|---:|---:|
| Employee | `0.515` | `0.790` | `0.220` | `0.028` | `0.555` | `0.817` |
| Direct Manager | `0.080` | `0.790` | `0.220` | `0.028` | `0.115` | `0.817` |
| HR Responsible | `0.515` | `0.888` | `0.220` | `0.028` | `0.555` | `0.914` |
| General Manager | `0.080` | `0.888` | `0.220` | `0.028` | `0.115` | `0.914` |

Duplicate active Sign requests are blocked. Sync remains the explicit recovery/control action for in-flight and completed requests.

No native `hr.leave` bridge action is included in the Sign slice.
<!-- PASS19_LEAVE_ARTIFACT_SIGN_END -->

<!-- PASS20_WORK_ASSIGNMENT_ARTIFACT_SIGN_START -->
## Pass 20 planned F-0017 artifact and Sign pattern

F-0017 Employee Work Assignment will follow the accepted custom process artifact doctrine:

1. Generate QWeb PDF from the assignment record.
2. Store generated PDF on `x_pdf_attachment_id`.
3. Post generated PDF to employee chatter/files.
4. Create dynamic native Odoo Sign template/document/items from the generated PDF.
5. Send in ordered four-role sequence.
6. Sync Odoo Sign state.
7. Copy signed PDF and certificate, when available, to employee chatter/files.

Planned signer sequence:

    1. Employee
    2. Direct Manager
    3. HR Responsible
    4. General Manager

Sign coordinates are not locked in 20A. They must be calibrated after the first accepted generated F-0017 PDF.

Pass 20 must keep artifact download behavior through:

    /web/content/<attachment_id>?download=true

No direct navigation to `ir.attachment` machine views should be used.
<!-- PASS20_WORK_ASSIGNMENT_ARTIFACT_SIGN_END -->

<!-- PASS20_ACCEPTED_ARTIFACT_SIGN_START -->
## Pass 20 accepted F-0017 artifact and Sign pattern

F-0017 Work Assignment Authorization is now an accepted custom-process document/sign workflow.

Source record:

    x_hr.employee_work_assignment

Report files:

    report/16_employee_work_assignment_templates.xml
    report/17_employee_work_assignment_report_actions.xml

Server-action files:

    data/24_employee_work_assignment_generate_actions.xml
    data/25_employee_work_assignment_sign_actions.xml

Artifact behavior:

- generated PDF is stored in `x_pdf_attachment_id`;
- signed PDF is stored in `x_signed_attachment_id`;
- Sign certificate, where exposed by Odoo, is stored in `x_sign_certificate_attachment_id`;
- all business artifacts are downloadable through `/web/content/<attachment_id>?download=true`;
- generated and signed artifacts are posted to employee chatter/files.

Sign behavior:

- native Odoo Sign template and items are generated dynamically from the accepted PDF;
- duplicate active Sign requests are blocked;
- Sync remains the authoritative action for updating the source record after Odoo Sign progresses;
- completed Sign artifacts are copied to the employee record/files.

Locked F-0017 Sign geometry:

| Role | Signature posX | Signature posY | Width | Height | Date posX | Date posY |
|---|---:|---:|---:|---:|---:|---:|
| Employee | 0.515 | 0.697 | 0.220 | 0.030 | 0.555 | 0.733 |
| Direct Manager | 0.080 | 0.697 | 0.220 | 0.030 | 0.115 | 0.733 |
| HR Responsible | 0.515 | 0.819 | 0.220 | 0.030 | 0.555 | 0.854 |
| General Manager | 0.080 | 0.819 | 0.220 | 0.030 | 0.115 | 0.854 |

Signer order:

    Employee → Direct Manager → HR Responsible → General Manager
<!-- PASS20_ACCEPTED_ARTIFACT_SIGN_END -->

<!-- PASS21_PERFORMANCE_EVALUATION_ARTIFACT_START -->
## Pass 21 — F-0018 Artifact and Sign Pattern

F-0018 follows the modern governed artifact pattern established in Passes 18–20:

    custom process record
    → generated QWeb/PDF
    → stored generated PDF attachment
    → employee chatter/files posting
    → native Odoo Sign request
    → signed PDF/certificate sync
    → employee chatter/files posting

Distinct Pass 21 behavior:

- The QWeb report renders a 12-row score matrix with 5/4/3/2/1 checkbox cells.
- The final score is computed out of 60.
- Grade is rendered as checkbox output, not hand-entered text.
- Star rating is rendered from the computed score.
- The Sign sequence is two-role only:

      1. Direct Manager
      2. HR Manager

- The physical form may show a general manager approval area, but Pass 21 does not add a general manager Sign role unless explicitly re-scoped.

The older F-0002 interview evaluation files are valid reference material for scoring/checklist behavior only. Pass 21 must use the current shared QWeb assets/header/paperformat and current Sign send/sync lifecycle patterns.
<!-- PASS21_PERFORMANCE_EVALUATION_ARTIFACT_END -->

<!-- PASS21_ACCEPTED_ARTIFACT_SIGN_START -->
## Pass 21 accepted F-0018 artifact and Sign pattern

F-0018 Employee Performance Evaluation is an accepted custom parent/line document/sign workflow.

Source records:

    x_hr.employee_performance_evaluation
    x_hr.employee_performance_evaluation_line

Report files:

    report/18_employee_performance_evaluation_templates.xml
    report/19_employee_performance_evaluation_report_actions.xml

Server-action files:

    data/26_employee_performance_evaluation_automation.xml
    data/27_employee_performance_evaluation_create_actions.xml
    data/28_employee_performance_evaluation_generate_actions.xml
    data/29_employee_performance_evaluation_sign_actions.xml

Artifact behavior:

- generated PDF is stored in `x_pdf_attachment_id`;
- signed PDF is stored in `x_signed_attachment_id`;
- Sign certificate, where exposed by Odoo, is stored in `x_sign_certificate_attachment_id`;
- all business artifacts are downloadable through `/web/content/<attachment_id>?download=true`;
- generated and signed artifacts are posted to employee chatter/files.

QWeb behavior:

- the 12 scoring lines render as a 5/4/3/2/1 checkbox matrix;
- final result renders as total score out of 60;
- percentage, visual stars, and grade checkbox row are rendered in the PDF;
- direct manager and HR manager recommendation boxes render from source record fields;
- general manager approval remains a compact approval row.

Sign behavior:

- native Odoo Sign template and items are generated dynamically from the accepted PDF;
- duplicate active Sign requests are blocked;
- Sync remains the authoritative action for updating the source record after Odoo Sign progresses;
- completed Sign artifacts are copied to the employee record/files.

Locked F-0018 Sign geometry:

| Role | Signature posX | Signature posY | Width | Height | Date posX | Date posY |
|---|---:|---:|---:|---:|---:|---:|
| Direct Manager | 0.570 | 0.842 | 0.250 | 0.030 | 0.650 | 0.883 |
| HR Manager | 0.130 | 0.842 | 0.250 | 0.030 | 0.210 | 0.883 |
| General Manager | 0.570 | 0.905 | 0.300 | 0.024 | — | — |

Signer order:

    Direct Manager → HR Manager → General Manager

Direct Manager signer resolution is employee-based:

    x_direct_manager_employee_id → partner/contact/email

It must not require `parent_id.user_id` to exist.
<!-- PASS21_ACCEPTED_ARTIFACT_SIGN_END -->

<!-- PASS22_SEPARATION_SIGNING:BEGIN -->

## Pass 22 F-0019 signing pattern

F-0019 follows the standard generated-artifact and Sign lifecycle.

Expected Sign order:

```text
1. Employee
2. Direct Manager
3. HR Manager
4. General Manager
```

The direct manager signer must resolve from the direct manager employee record (`x_direct_manager_employee_id`) using work contact, user partner, or work email. The flow must not require the manager employee to have a linked `res.users` account.

Generated PDF, signed PDF, and certificate follow the existing attachment/chatter/files behavior used by Passes 19–21.

<!-- PASS22_SEPARATION_SIGNING:END -->

<!-- PASS22_ACCEPTED_ARTIFACT_SIGN_START -->
## Pass 22 accepted F-0019 artifact and Sign pattern

F-0019 Employee Separation Request is an accepted custom document/sign workflow.

Source record:

    x_hr.employee_separation_request

Report files:

    report/20_employee_separation_request_templates.xml
    report/21_employee_separation_request_report_actions.xml

Server-action files:

    data/30_employee_separation_request_automation.xml
    data/31_employee_separation_request_generate_actions.xml
    data/32_employee_separation_request_sign_actions.xml

Artifact behavior:

- generated PDF is stored in `x_pdf_attachment_id`;
- signed PDF is stored in `x_signed_attachment_id`;
- Sign certificate, where exposed by Odoo, is stored in `x_sign_certificate_attachment_id`;
- all business artifacts are downloadable through `/web/content/<attachment_id>?download=true`;
- generated and signed artifacts are posted to employee chatter/files.

QWeb behavior:

- personal information renders from `hr.employee` where safely available;
- request type renders as selected checkbox;
- effective separation date renders on the form;
- reason area renders fixed request-type text for the three fixed types;
- reason area renders `x_other_reason_description` for Other;
- employee/direct-manager/HR/general-manager signature and date blocks render on page 1;
- final accepted PDF remains one page after readability polish.

Sign behavior:

- native Odoo Sign template and items are generated dynamically from the accepted PDF;
- duplicate active Sign requests are blocked;
- Sync remains the authoritative action for source-record update after Odoo Sign progresses;
- completed Sign artifacts are copied to employee chatter/files.

Locked F-0019 Sign geometry:

| Role | Signature posX | Signature posY | Width | Height | Date posX | Date posY | Date width |
|---|---:|---:|---:|---:|---:|---:|---:|
| Employee | 0.540 | 0.686 | 0.255 | 0.030 | 0.560 | 0.722 | 0.165 |
| Direct Manager | 0.105 | 0.686 | 0.255 | 0.030 | 0.130 | 0.722 | 0.165 |
| HR Manager | 0.540 | 0.800 | 0.255 | 0.030 | 0.560 | 0.834 | 0.165 |
| General Manager | 0.105 | 0.800 | 0.255 | 0.030 | 0.130 | 0.834 | 0.165 |

Signer order:

    Employee → Direct Manager → HR Manager → General Manager

Employee and Direct Manager signer resolution is employee/contact based. HR and General Manager signer resolution remains user/partner based.
<!-- PASS22_ACCEPTED_ARTIFACT_SIGN_END -->
