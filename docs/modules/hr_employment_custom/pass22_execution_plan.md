# Pass 22 Execution Plan — F-0019 Employee Separation Request

Status: 22A scope/spec lock  
Module: `hr_employment_custom`  
Target model: `x_hr.employee_separation_request`  
Source form: `MCEP-HR-F-0019` — Employee Separation Request

## 1. Locked posture

Pass 22 implements the official Marsellia employee separation-request form as a governed HR document workflow.

The pass is intentionally limited to:

1. one custom operational process record;
2. manual/request data needed to render the form;
3. derived employee snapshot data where safe;
4. generated QWeb/PDF artifact;
5. native Odoo Sign lifecycle;
6. signed artifact/certificate sync;
7. employee chatter/files posting;
8. Arabic UI translation via exported-anchor PO workflow.

Pass 22 does **not** implement native offboarding, contract closure, payroll settlement, final indemnity computation, leave-balance settlement, custody clearance, employee archiving, or GRC decision instances.

The same doctrine from Passes 19–21 applies:

```text
custom Marsellia process record
→ governed QWeb/PDF
→ Odoo Sign lifecycle
→ signed artifacts copied to employee chatter/files
→ native operational bridges deferred
```

## 2. Form source summary

F-0019 contains:

- personal information;
- request type;
- effective separation date;
- reason/description area;
- employee signature;
- direct manager approval;
- HR approval;
- general manager approval.

The request type choices are:

1. Resignation;
2. Non-Renewal of Contract;
3. Medical Reasons;
4. Other.

The historical structured reason rows on the form are not implemented as separate child records in this pass. They are replaced by one long text field used when the request type is `Other`.

## 3. Model architecture

### 3.1 Operational model

Use one operational model only:

```text
x_hr.employee_separation_request
```

No helper/type model is required in Pass 22.

### 3.2 Core fields

Expected fields:

```text
x_name
x_employee_id
x_reference_code
x_document_reference
x_state

x_request_type
x_effective_date
x_other_reason_description
x_employee_notes
```

### 3.3 Request type selection

```text
resignation
non_renewal
medical_reasons
other
```

Source labels:

```text
Resignation
Non-Renewal of Contract
Medical Reasons
Other
```

The UI should expose `x_other_reason_description` only when `x_request_type == 'other'`.

Generation should block if `x_request_type == 'other'` and `x_other_reason_description` is empty.

### 3.4 Derived/user snapshot fields

```text
x_direct_manager_employee_id
x_direct_manager_user_id
x_hr_user_id
x_general_manager_user_id
x_responsible_user_id
```

Rules:

- `x_direct_manager_employee_id` is derived from `x_employee_id.parent_id`.
- The direct manager signer must resolve from the direct manager employee’s work contact / user partner / work email.
- The flow must **not** require `employee.parent_id.user_id`.
- `x_direct_manager_user_id` may remain as a hidden legacy/optional snapshot only if useful for compatibility.
- `x_hr_user_id` is derived from `employee.hr_responsible_id` where available.
- `x_general_manager_user_id` is selected manually unless a reliable company-level source is explicitly introduced later.
- `x_responsible_user_id` defaults to the acting user.

### 3.5 Artifact and Sign metadata fields

Use the standard field family:

```text
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
```

### 3.6 Manual governance fields

```text
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
x_notes
```

These are metadata only in this pass. They do not create GRC decisions.

## 4. Lifecycle

Use the standard document lifecycle:

```text
draft
generated
signature_requested
signed
cancelled
superseded
```

Visible statusbar:

```text
Draft → Generated → Signature Requested → Signed
```

Do not add employment/offboarding consequence states in Pass 22.

## 5. Employee UI

Add a new `hr.employee` tab:

```text
Separation
```

Arabic target:

```text
إنهاء الخدمة
```

The tab follows the accepted pattern:

- info alert;
- `New Separation Request` button;
- embedded list;
- modal create/edit form;
- standalone list/form action;
- statusbar;
- header download icons;
- workflow/artifact strip;
- generated/signed/certificate fields hidden but operational;
- employee chatter/files artifact posting.

## 6. QWeb / PDF

Use one F-0019 QWeb template.

The PDF should render:

1. personal information;
2. request type checkbox area;
3. effective separation date;
4. reason description area;
5. employee signature block;
6. direct manager approval block;
7. HR approval block;
8. general manager approval block.

For request type:

- selected type should render as checked;
- non-selected types render unchecked;
- if `Other`, the long description renders in the reason area.

The template should use current shared report assets and one-page A4 styling, following the successful Pass 20/21 style.

## 7. Sign lifecycle

Use native Odoo Sign with four roles:

```text
1. Employee
2. Direct Manager
3. HR Manager
4. General Manager
```

Role derivation:

- Employee signer: from employee work contact / user partner / work email.
- Direct Manager signer: from `x_direct_manager_employee_id`, not from a required user account.
- HR signer: from `x_hr_user_id`.
- General Manager signer: from `x_general_manager_user_id`.

Sign geometry will be locked after the accepted generated F-0019 PDF.

The Sign lifecycle must include:

- dynamic Sign template;
- dynamic Sign items;
- duplicate active request protection;
- Send to Sign;
- Sync;
- signed PDF copy to employee record;
- certificate copy when exposed by Odoo;
- employee chatter/files posting.

## 8. Deferred integrations

Pass 22 explicitly defers:

```text
employee archiving
contract closing
resignation acceptance automation
final settlement
leave balance settlement
custody clearance
offboarding checklist
attendance/work-entry effects
payroll/final payslip effects
Odoo Appraisals bridge
Odoo Approvals
GRC decision instances
disciplinary/legal consequence automation
```

These may be implemented later as a separation/offboarding bridge pass after the governed document workflow is proven.

## 9. Slice plan

### 22A — Documentation / execution plan lock

This slice.

Deliverables:

- `pass22_execution_plan.md`;
- roadmap/readme/lifecycle/signing/UI doctrine updates where relevant.

No Odoo build required.

### 22B — Model + access + employee tab scaffold

Deliver:

- `models/09_employee_separation_request.xml`;
- `views/09_employee_separation_request_views.xml`;
- access CSV row;
- manifest entries;
- employee Separation tab;
- modal and standalone forms.

No normalization, PDF, or Sign.

### 22C — Normalization/defaulting + request-type validation

Deliver:

- create/write normalization;
- `MCEP-HR-F-0019` reference defaults;
- document reference generation without `-EMP-`;
- name generation;
- direct manager employee derivation from `employee.parent_id`;
- HR user derivation from `employee.hr_responsible_id`;
- responsible user default;
- employee chatter creation note;
- validation guard for Other reason.

No PDF or Sign.

### 22D — F-0019 QWeb/PDF generation

Deliver:

- QWeb template;
- report action;
- Generate PDF action;
- generated PDF attachment lifecycle;
- employee chatter/files posting;
- download generated/signed/certificate actions;
- workflow/artifact controls in modal and standalone forms.

No Sign yet.

### 22E — Four-role Odoo Sign lifecycle

Deliver:

- dynamic Sign template;
- four-role Sign items;
- signing order: employee → direct manager → HR → general manager;
- Send to Sign;
- Sync;
- signed PDF and certificate copy;
- duplicate active request guard;
- employee chatter/files posting.

### 22F — Arabic UI/selection translation and polish

Deliver:

- exported-anchor PO patch;
- tab label: `إنهاء الخدمة`;
- field labels;
- section labels;
- action/button labels;
- request-type selection values;
- modal/standalone parity fixes if needed.

### 22G — Documentation closure

Deliver:

- accepted implementation summary;
- locked Sign geometry;
- lessons learned;
- direct-manager-as-employee doctrine carried forward;
- deferred bridge/offboarding actions;
- roadmap/readme rebaseline.

## 10. Acceptance principles

A Pass 22 implementation slice is accepted only if:

- module upgrades cleanly;
- employee tab works in Arabic and English;
- request record can be created from the employee tab;
- no native offboarding/payroll/contract side effects occur;
- generated PDF matches F-0019 structure;
- Sign uses the intended four-role sequence;
- signed artifacts are copied to employee chatter/files;
- translations use exported anchors and do not pollute source XML labels.
