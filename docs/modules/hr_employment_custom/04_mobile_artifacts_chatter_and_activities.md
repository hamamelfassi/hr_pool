# Mobile Artifacts, Chatter, Activities, Notifications, and Approvals Doctrine

## Purpose

This document defines the operational coordination layer for `hr_employment_custom`.

It covers:

```text
mobile artifact access
employee chatter/files
source process chatter
activities
notifications
Odoo Approvals app
Sign Requests visibility
cross-module integration posture
```

---

## Core rule

```text
Native Odoo state/workflow = operational truth
Custom HR process record = Marsellia business context
QWeb + Odoo Sign = official documentary evidence
Chatter + activities = coordination and audit
```

Do not turn HR into a pure paperwork simulator.

---

## Chatter doctrine

Chatter is the durable audit stream.

Every important process event should post a message on the source record and, where relevant, on `hr.employee`.

### Standard chatter events

```text
record created
submitted for review
PDF generated
sent for signature
signature synced
signed artifact linked
certificate linked
manual decision attachment uploaded
approved/rejected
state changed
handover/clearance completed
```

### Employee chatter/files rule

For every final signed artifact:

```text
copy/post signed PDF to hr.employee chatter/files
copy/post certificate to hr.employee chatter/files where available
name the artifact type in the chatter message
```

This is the mobile-safe access path.

---

## Mobile artifact doctrine

Direct `/web/content/<attachment_id>?download=true` actions can work on desktop but fail or behave inconsistently in the Odoo mobile app.

Therefore:

```text
URL/icon download buttons are convenience controls.
Employee chatter/files is the required mobile-safe access path.
```

A workflow is not mobile-safe unless the signed artifact can be opened from the employee record's chatter/files in the native mobile app.

---

## Activity doctrine

Activities drive next human action. They are not the workflow truth.

Good uses:

```text
HR must review employee profile
manager must approve permission
HR must verify leave balance
employee must submit training certificate
IT must clear systems access
stores must verify custody returns
finance must verify final settlement
GM must approve separation/clearance
```

Bad uses:

```text
activity as permanent state
activity as signed evidence
activity as only approval record
activity as legal document
```

The model state remains the source of truth.

---

## Standard activity pattern

At each workflow transition:

```text
submit → create activity for next reviewer
approve → close prior activity and create next activity
reject → close activity and post rejection reason
final approval → close all pending workflow activities
```

Where practical, activity types should be seeded for:

```text
HR Review
Manager Approval
GM Approval
Certificate Follow-up
Custody Return
Clearance Review
```

---

## Toast notification doctrine

Use toast notifications only for immediate feedback.

Examples:

```text
PDF generated
sent for signature
sync successful
blocked due to missing data
duplicate send prevented
certificate not found
```

Do not rely on toast messages as durable audit.

Every important event should also produce chatter.

---

## Odoo Approvals app doctrine

The native Odoo Approvals app can be used selectively.

It is not the main HR workflow spine.

### Use native HR engines first

| Process | Primary engine |
|---|---|
| Leave | `hr.leave` |
| Appraisal | `hr.appraisal` |
| Employee profile | `hr.employee` |
| Contract/payroll | Native `hr.employee` Payroll tab readiness fields until `hr.contract` is proven safe; payroll models later |
| Attendance | `hr.attendance` / work entries later |

### Where `approval.request` may help

```text
administrative permissions
training funding
special work assignment
equipment/custody issuance exception
exceptional overtime authorization
```

Canonical rule:

```text
approval.request may be linked as an auxiliary approval surface
```

The custom process record remains the source of truth.

---

## Approval vs Sign vs Activity

Use each layer correctly:

| Layer | Purpose |
|---|---|
| Model state | workflow truth |
| Approval/request/action | authorization |
| Native Sign | legal/documentary evidence |
| Chatter | durable audit trail |
| Activity | next human task |
| Toast | immediate UI feedback |

Do not force all layers onto every workflow.

---

## Sign Requests visibility

For every Sign workflow, attempt native anchoring so employee Sign Requests remain useful.

Send actions should anchor to:

```text
source process model
source process record ID
```

Where Odoo schema permits, also maintain visible employee linkage through:

```text
employee chatter/files
employee source fields
best-effort Sign request model/res_ids anchor
```

Lifecycle closure must always use source model fields, not only Sign Requests smart-button visibility.

---

## Cross-module integration posture

### Documents

Do not make Documents app integration a blocker for Pass 13 or first lifecycle passes.

Use attachments/chatter first.

Later Documents integration can add:

```text
folder policy
tag policy
retention policy
confidentiality classes
access groups
```


### Contract/payroll SaaS posture

Do not assume `hr.contract` is available as an importable target in the current Odoo.com SaaS 19.2 database.

Pass 13 writes payroll/contract overview readiness directly to native `hr.employee` Payroll tab fields and does not create `hr.contract`, payslips, pay runs, or work entries.

Early employment lifecycle workflows must not introduce payroll/accounting side effects unless a later pass explicitly scopes and preflights them.

### Payroll/accounting

Do not generate payroll/accounting entries from early lifecycle forms unless explicitly scoped.

Design fields now for later integration:

```text
training cost
training recovery amount
salary deduction authorization
custody replacement fee
final settlement status
```

### Inventory/fleet

Custody models should later integrate with inventory/fleet, but first they must structurally track custody items and status.

### Planning/projects/timesheets

Work assignments should later integrate with planning, project, timesheets, work entries, and overtime.

First implementation captures the assignment and approval artifact only.

### IT / Microsoft 365

Clearance should begin with IT checklist activities.

System automation can come later.

---

## Manual decision metadata

Use manual decision metadata until GRC decision-instance integration is explicitly implemented:

```text
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

Use this on:

```text
leave
permission
training funding
work assignment
appraisal outcome
separation
clearance override
```

---

## Acceptance checklist

A workflow has acceptable operational coordination when:

- source record state is authoritative;
- chatter records all major lifecycle events;
- employee chatter/files contains final signed artifacts;
- activities are created for next human owners;
- activities close when transitions complete;
- toast messages are used only for immediate UI feedback;
- Odoo Approvals is auxiliary where used;
- mobile access works through employee files/chatter;
- native smart buttons remain useful and unbroken.

## Accepted Pass 15 mobile-safe artifact behavior

Pass 15 confirmed the mobile-safe artifact rule:

- generated declaration PDFs are posted to the linked employee chatter/files;
- signed PDFs are copied/posted to the linked employee chatter/files after Sign sync;
- Sign certificates are copied/posted to the linked employee chatter/files when Odoo exposes them;
- source declaration process fields keep lifecycle truth, but employee chatter/files is the operational mobile access layer.

Avoid making users open technical `ir.attachment` forms.

User-facing declaration forms should expose explicit download buttons for available artifacts:

```text
Download Generated PDF
Download Signed PDF
Download Sign Certificate
```

These buttons should resolve to `/web/content/<attachment_id>?download=true`.

This pattern should be reused in later custody, training, assignment, separation, and clearance forms.

## Pass 17 mobile/chatter note — Training artifacts

Training commitment artifacts should follow the accepted employment artifact behavior:

- generated undertaking PDF posts to employee chatter/files;
- signed undertaking PDF posts to employee chatter/files;
- Sign certificate posts to employee chatter/files when Odoo exposes it;
- certificate submitted by the employee/HR should be stored on the training commitment and posted/copied to employee chatter/files;
- user-facing download must use `/web/content/<attachment_id>?download=true`;
- raw `ir.attachment` metadata forms should not be the normal operational click path.

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
- Arabic translation for training selection-state values was closed in Pass 18F-2 using exact exported `ir.model.fields.selection` anchors.
- Dynamic record-value Arabic PDF hardening remains deferred. Future official Arabic-first PDF generation should force Arabic render context and block generation with a specific toast when required Arabic record translations are missing.
- F-0008 thumbprint remains outside system workflow. No thumbprint fields, uploads, Sign items, or lifecycle states were introduced.

<!-- PASS18G_MOBILE_DOCTRINE_START -->
## Pass 18 mobile/chatter note — Permission artifacts

Pass 18 follows the accepted mobile-safe artifact rule for administrative permissions:

```text
generated permission PDF posts to employee chatter/files
signed permission PDF posts to employee chatter/files after Sign sync
Sign certificate posts to employee chatter/files when Odoo exposes it
download buttons remain convenience controls only
employee chatter/files is the required mobile-safe access path
```

The source lifecycle remains on:

```text
x_hr.employee_permission
```

Employee chatter/files is the operational access layer for mobile users.
<!-- PASS18G_MOBILE_DOCTRINE_END -->

## Pass 19 mobile/chatter note — Leave request artifacts

Leave request artifacts must follow the same mobile-safe pattern as Passes 15-18:

- generated leave request PDF posts to employee chatter/files;
- signed leave request PDF posts to employee chatter/files;
- Sign certificate posts to employee chatter/files when Odoo exposes it;
- desktop download buttons remain convenience controls only;
- lifecycle truth remains on `x_hr.employee_leave_request`.

Native `hr.leave` records created in a later bridge slice should link back to the custom leave request and should not become the only place where the official signed form is accessible.

<!-- PASS19_LEAVE_MOBILE_ARTIFACTS_START -->
## Pass 19 leave mobile/artifact/chatter behavior

Leave request artifacts follow the mobile-safe employee record pattern:

- generated PDF is posted to employee chatter/files;
- signed PDF is copied to employee chatter/files after Sign completion sync;
- Sign certificate is copied to employee chatter/files when exposed by Odoo Sign;
- download controls use `/web/content/<attachment_id>?download=true`;
- the employee record remains the durable place for HR users to find signed leave evidence.

This pass does not create native `hr.leave` records, so native Time Off dashboards/reports are not treated as the artifact source of truth yet.
<!-- PASS19_LEAVE_MOBILE_ARTIFACTS_END -->

<!-- PASS20_WORK_ASSIGNMENT_CHATTER_START -->
## Pass 20 planned chatter/files posture

F-0017 Employee Work Assignment must post governed artifacts to employee chatter/files:

- creation note, if included in normalization;
- generated PDF note and attachment;
- Sign request sent note;
- Sign sync note;
- signed PDF and certificate note/attachments.

Chatter posts should be concise and Arabic-friendly, following the accepted Permissions and Leave patterns.

No activities, approval.request records, Planning tasks, Project tasks, Timesheets, Attendance records, Work Entries, Payroll records, or GRC decision records are created in Pass 20.
<!-- PASS20_WORK_ASSIGNMENT_CHATTER_END -->

<!-- PASS20_ACCEPTED_CHATTER_START -->
## Pass 20 accepted chatter/files posture

F-0017 Work Assignment Authorization posts lifecycle evidence to employee chatter/files.

Accepted chatter events:

- assignment record creation note;
- generated PDF note with generated F-0017 PDF attached;
- Sign request sent note with generated PDF attached;
- Sign sync/status note;
- signed completion note with signed PDF and certificate, where available.

No activity chain, `approval.request`, Planning task, Project task, Timesheet line, Attendance record, Work Entry, Payroll record, Fleet record, or GRC decision record is created in Pass 20.

The source process record remains the documentary lifecycle authority. Employee chatter/files is the operational evidence stream for HR users and mobile access.
<!-- PASS20_ACCEPTED_CHATTER_END -->

<!-- PASS21_PERFORMANCE_EVALUATION_CHATTER_START -->
## Pass 21 — Performance Evaluation Chatter and Files

Pass 21 must post employee chatter notes at the following moments:

- evaluation record creation;
- generated F-0018 PDF creation;
- Odoo Sign request send;
- Sign sync before completion where useful;
- Sign completion, with signed PDF and certificate where available.

Generated and signed artifacts must be copied/linked to employee chatter/files in the same accepted way as Leave and Work Assignment.

No generated PDFs, signed PDFs, certificates, screenshots, or temporary exports should be committed to Git.
<!-- PASS21_PERFORMANCE_EVALUATION_CHATTER_END -->
