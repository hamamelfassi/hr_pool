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

Initial Sign recommendation:

```text
one employee signer
manager/HR blocks printed as manual approval metadata
```

Multi-signer manager/HR Sign routing is deferred unless explicitly scoped after PDF acceptance.

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
multi-signer manager/HR Odoo Sign routing
approval.request integration
attendance/work-entry effects
leave/payroll deduction effects
Arabic dynamic record-value hardening for official PDFs
GRC decision-instance integration
mobile Documents app folder/tag governance
```
