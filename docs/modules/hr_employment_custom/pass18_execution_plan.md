# Pass 18 Execution Plan — Administrative Permissions F-0014/F-0015

## Purpose

Pass 18 implements Marsellia administrative permission forms for employees using one typed permission process.

Forms in scope:

```text
MCEP-HR-F-0014 — Exit Permission
MCEP-HR-F-0015 — Lateness Permission
```

This pass intentionally supersedes the older roadmap ordering where Pass 18 was leave and Pass 19 was administrative permissions. Leave remains deferred until explicitly rescheduled.

## Environment and method

```text
Odoo.com SaaS 19.2
Module: hr_employment_custom
Manual surgical pypatches only
No Odoo.sh-only Python addon code
No rebuilt module zip from assistant side unless explicitly requested
```

The user builds locally with:

```text
./scripts/build_module_zip.sh hr_employment_custom
```

## Architecture lock

Pass 18 uses exactly one helper/type model and one operational model:

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

Do not create separate operational models for F-0014 and F-0015 unless a later Odoo technical constraint proves it necessary.

## Permission type records

Seed exactly two active helper records:

| Type | Code | Form Code |
|---|---|---|
| Exit Permission | `exit_permission` | `MCEP-HR-F-0014` |
| Lateness Permission | `lateness_permission` | `MCEP-HR-F-0015` |

The type record drives:

```text
form title
form code
PDF report text/title routing
future optional behavior flags
```

## Initial operational model fields

The operational record should own lifecycle, business inputs, artifacts, Sign linkage, manual decision metadata, and notes.

Core fields:

```text
x_name
x_employee_id
x_permission_type_id
x_reference_code
x_document_reference
x_state
x_permission_date
x_time_from
x_time_to
x_reason
x_employee_notes
x_direct_manager_user_id
x_hr_user_id
x_responsible_user_id
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
x_notes
```

## Lifecycle boundary

Use the standard document/signature lifecycle only:

```text
draft
generated
signature_requested
signed
cancelled
superseded
```

The visible statusbar for the first implementation should focus on:

```text
draft → generated → signature_requested → signed
```

Do not add attendance, timesheet, leave, payroll, work-entry, disciplinary, or deduction consequences in Pass 18.

## Approval boundary

F-0014 and F-0015 include employee signature, direct manager approval, and HR approval blocks. In Pass 18 these approval semantics are represented as printed/manual form fields and metadata only.

Do not introduce a full multi-step approval workflow or `approval.request` dependency in the first implementation.

## UI scope

Add a new `Permissions` tab on `hr.employee` following the accepted process-record pattern:

```text
short info alert
New Permission button
embedded list
controlled modal create/edit form
standalone list/form action
statusbar at top of process form
artifact download icons in header
workflow buttons below the statusbar
chatter/files artifact posting
```

XML source labels must remain English. Arabic labels are handled later through the exported-anchor PO workflow.

## PDF scope

Use one QWeb report template routed by `x_permission_type_id`.

Both uploaded forms share the same structure:

```text
personal information
permission date
from/to time period
reason
employee signature
direct manager approval
HR approval
```

The first PDF slice should be clean, A4, printable, and reuse common employee report assets.

## Sign scope

Native Odoo Sign is implemented only after the generated PDF is accepted.

Accepted Sign implementation:

```text
three-role native Odoo Sign flow
1. Employee
2. Direct Manager
3. HR Responsible
```

The three roles are routed through dynamic Odoo Sign template/document/items generated from the accepted F-0014/F-0015 PDF geometry. Manager and HR approval blocks are no longer merely printed placeholders in the implemented Pass 18 baseline; they are active Sign roles for the official document.

## Slice plan

### 18A — Scope/preflight lock

Documentation-only slice. Lock the revised Pass 18 scope and confirm that permissions move before leave.

### 18B — Models, access, and employee tab

Add:

```text
models/05_employee_permission.xml
views/05_employee_permission_views.xml
security/ir.model.access.csv rows
manifest load entries
```

No PDF and no Sign yet.

### 18C — Type seeding and normalization/defaulting

Add exactly two type records and safe record defaulting/normalization automation.

### 18D — F-0014/F-0015 QWeb PDF generation

Add type-routed report and PDF generation actions. Store generated PDF on the source record and post/copy it to employee chatter/files.

### 18E — Native Odoo Sign send/sync

Add duplicate-send guard, dynamic Sign template/document/items, explicit Sync button, signed PDF/certificate discovery, and employee chatter/files posting.

### 18F — Arabic PO/UI polish and deferred backlog notes

Patch exported Arabic PO anchors only after the module upgrades cleanly and Odoo exports the relevant anchors.

### 18G — Documentation closure

Update docs to mark Pass 18 accepted and record deferrals.

## Deferred backlog

```text
full manager/HR approval workflow
approval.request integration
attendance/work-entry effects
leave/payroll deduction effects
Arabic dynamic record-value hardening for official PDFs
GRC decision-instance integration
mobile Documents app folder/tag governance
```

<!-- PASS18G_CLOSURE_START -->
## Pass 18G closure — accepted implementation baseline

Pass 18 is closed and accepted.

Implemented:

```text
18A — documentation/scope lock
18B — permission helper and operational models, access rows, employee Permissions tab, modal/full form surfaces
18C — two seeded permission types and record normalization/defaulting
18D — one dynamic F-0014/F-0015 QWeb report, generated PDF lifecycle, employee chatter/files posting, visual layout acceptance
18E — native three-role Odoo Sign send/sync lifecycle
18F — UI/modal polish, Arabic UI labels, exact exported selection-state translations for Permissions and Training, Custody tab translation
18G — documentation closure and Pass 19 rebaseline
```

Accepted operational models:

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

Seeded permission types:

```text
exit_permission     → MCEP-HR-F-0014 — Exit Permission
lateness_permission → MCEP-HR-F-0015 — Lateness Permission
```

Accepted lifecycle:

```text
draft → generated → signature_requested → signed
```

Accepted document reference pattern:

```text
MCEP-HR-F-0014-00004-00002
MCEP-HR-F-0015-00004-00001
```

The earlier computed `-EMP-` segment was removed from permission document references.

Accepted QWeb/PDF pattern:

```text
one dynamic QWeb template
type-routed title and form code
common structure for F-0014 and F-0015
no custom bottom footer
header carries form code, document reference, state, and page number
A4 one-page printable layout
```

Accepted Sign pattern:

```text
three sequential Sign roles:
1. Employee
2. Direct Manager
3. HR Responsible
```

Accepted signer coordinate baseline for the locked PDF geometry:

| Role | Signature posX | posY | width | height | Date posX | Date posY |
|---|---:|---:|---:|---:|---:|---:|
| Employee | `0.525` | `0.724` | `0.235` | `0.032` | `0.575` | `0.765` |
| Direct Manager | `0.080` | `0.724` | `0.235` | `0.032` | `0.125` | `0.765` |
| HR Responsible | `0.245` | `0.858` | `0.340` | `0.032` | `0.285` | `0.906` |

Accepted UI behavior:

```text
employee Permissions tab
New Permission button
embedded list
controlled modal create/edit form
standalone full form
statusbar
header artifact icons where clean
full-width in-sheet Workflow and Artifacts strip for modal parity
download actions for generated/signed/certificate artifacts
```

Accepted translation behavior:

```text
source XML labels remain English
Arabic UI delivered through exported PO anchors
permission selection states translated through exact exported ir.model.fields.selection IDs
training selection states translated through exact exported ir.model.fields.selection IDs
Custody tab label translated as العهود
```

Accepted side-effect boundary:

```text
No attendance writes
No leave writes
No payroll/work-entry writes
No approval.request integration
No disciplinary/deduction automation
No GRC decision-instance integration
```

## Pass 19 rebaseline

Pass 19 is expected to cover Leave Requests unless explicitly rescheduled.

Do not start Pass 19 implementation from the old generic roadmap alone. The next thread/slice should begin with user-supplied leave-specific instructions, form guidance, and surgical boundaries before any model/view/report patching.
<!-- PASS18G_CLOSURE_END -->
