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

<!-- PASS22G_CLOSURE_START -->
## Pass 22G — Closure and Accepted Baseline

### Accepted implementation

Pass 22 is functionally closed as the Marsellia F-0019 Employee Separation Request workflow.

Accepted document identity:

    MCEP-HR-F-0019
    Arabic title: طلب إنهاء خدمة
    English title: Separation Request

Implemented operational model:

    x_hr.employee_separation_request

Pass 22 intentionally uses one operational model only. No helper/type model and no child line model were introduced.

### Accepted model posture

The separation request record owns the full governed-document lifecycle and the artifact/sign metadata.

Core business fields:

- employee;
- request type;
- effective separation date;
- Other reason description;
- employee notes;
- direct manager employee snapshot;
- hidden optional direct manager user snapshot;
- HR user;
- general manager user;
- responsible user;
- manual decision metadata;
- generated/signed/certificate artifact metadata.

Accepted request type values:

| Technical value | Source label | Arabic target |
|---|---|---|
| resignation | Resignation | استقالة |
| non_renewal | Non-Renewal of Contract | عدم الرغبة في تجديد العقد |
| medical_reasons | Medical Reasons | أسباب مرضية |
| other | Other | أخرى |

The physical form's reason area is represented by one long text field:

    x_other_reason_description

This field is used only when request type is `other`. It replaces the physical form's loose free-text reason rows and avoids unnecessary child-row complexity.

### Accepted normalization behavior

Normalization/defaulting is implemented in:

    data/30_employee_separation_request_automation.xml

Accepted create/write behavior:

- state defaults to Draft;
- reference code defaults to `MCEP-HR-F-0019`;
- document reference is generated without `-EMP-`;
- record label is generated from employee + form title + document reference;
- responsible user defaults to the acting user;
- direct manager employee derives from `hr.employee.parent_id`;
- hidden direct manager user snapshot fills only if the manager employee has a linked user;
- HR user derives from `hr.employee.hr_responsible_id` where available;
- Other reason description is cleared when request type is not `other`;
- employee chatter gets one creation note.

No native offboarding, contract, payroll, final-settlement, custody, approval, or GRC behavior is introduced by normalization.

### Accepted lifecycle

Visible lifecycle:

    Draft → Generated → Signature Requested → Signed

Hidden/deferred lifecycle values remain available for later governance posture:

    Cancelled
    Superseded

Pass 22 does not implement employment consequence states. Employee archive, contract closure, payroll settlement, leave settlement, custody clearance, and offboarding are deferred.

### Accepted PDF/QWeb behavior

F-0019 uses dedicated report files:

    report/20_employee_separation_request_templates.xml
    report/21_employee_separation_request_report_actions.xml

Generated action file:

    data/31_employee_separation_request_generate_actions.xml

The generated PDF uses the accepted common employee report assets/header/paperformat and includes:

- MCEP header/reference;
- personal information derived from `hr.employee` where safely available;
- request type checkboxes;
- effective separation date;
- reason area;
- employee signature/date block;
- direct manager signature/date block;
- HR signature/date block;
- general manager signature/date block.

Generation blocks cleanly when:

- employee is missing;
- request type is missing;
- effective separation date is missing;
- request type is Other and Other Reason Description is empty.

The PDF was polished in 22D-2 with a controlled font-size and line-spacing increase. The accepted output remains one page and is readable.

Generated PDFs are stored on the source record, downloadable through `/web/content/<attachment_id>?download=true`, and posted to employee chatter/files.

### Accepted Odoo Sign behavior

Native Odoo Sign lifecycle is implemented in:

    data/32_employee_separation_request_sign_actions.xml

Signer sequence:

1. Employee
2. Direct Manager
3. HR Manager
4. General Manager

The signer pattern is intentionally distinct:

- Employee signer resolves from the employee record work contact / linked user partner / work email.
- Direct Manager signer resolves from the direct-manager employee record work contact / linked user partner / work email.
- HR signer resolves from HR User / employee HR Responsible.
- General Manager signer resolves from manually selected General Manager User.

The flow must not require `employee.parent_id.user_id` for direct manager signing.

Locked F-0019 page-1 Sign geometry after the accepted 22D-2 PDF:

| Role | Signature posX | Signature posY | Width | Height | Date posX | Date posY | Date width |
|---|---:|---:|---:|---:|---:|---:|---:|
| Employee | 0.540 | 0.686 | 0.255 | 0.030 | 0.560 | 0.722 | 0.165 |
| Direct Manager | 0.105 | 0.686 | 0.255 | 0.030 | 0.130 | 0.722 | 0.165 |
| HR Manager | 0.540 | 0.800 | 0.255 | 0.030 | 0.560 | 0.834 | 0.165 |
| General Manager | 0.105 | 0.800 | 0.255 | 0.030 | 0.130 | 0.834 | 0.165 |

The Sign lifecycle includes:

- dynamic Sign template creation;
- dynamic sign item placement;
- ordered signer mapping;
- duplicate active Sign request blocking;
- Sync button;
- signed PDF copy to employee chatter/files;
- certificate copy where Odoo exposes it;
- source record transition to Signed after successful sync.

No offboarding, contract, payroll, final-settlement, custody, approval, project, planning, fleet, or GRC bridge action is performed after signature.

### Accepted UI/UX behavior

The employee tab is:

    Separation / إنهاء الخدمة

Accepted UI pattern:

- info alert;
- New Separation Request button;
- embedded list;
- controlled modal form;
- standalone list/form action;
- statusbar;
- workflow/artifact controls;
- header download icons;
- request details section;
- approval metadata section;
- lifecycle artifacts hidden section;
- manual decision section;
- notes section;
- Other reason field visible only for request type Other;
- Arabic UI labels and selection values through exported-anchor PO workflow.

### Translation closure

Pass 22F locked Arabic UI translations for:

- employee tab label `إنهاء الخدمة`;
- New Separation Request button;
- model/action/report names;
- field labels;
- section labels;
- workflow/artifact buttons;
- alert text;
- state selection values;
- request type selection values.

Selection translations used exact exported `ir.model.fields.selection` anchors.

### Deferred actions

The following remain explicitly deferred beyond Pass 22:

- native employee offboarding;
- employee archive/deactivation;
- contract closing or non-renewal effects;
- payroll final settlement;
- indemnity/end-of-service computation;
- leave balance settlement;
- custody clearance;
- final handover checklist;
- attendance/timesheet/work-entry effects;
- recruitment/onboarding reverse flows;
- `approval.request` integration;
- GRC decision instances;
- automated legal/employment consequence workflow;
- configurable separation-reason helper model;
- multi-document separation package;
- amendment/cancellation governance beyond current document lifecycle/manual metadata.

### Lessons learned

- F-0019 did not need a helper/type model. A single selection field was enough.
- The physical reason rows should not automatically become child records. A single Other reason text field is cleaner and more maintainable.
- Direct-manager signing should continue using employee-based signer resolution, not a required user account.
- Employee signing should also use employee-contact resolution, not assume the employee has a user.
- QWeb readability should be calibrated after inspecting the actual rendered page, not from static CSS assumptions alone.
- Sign coordinates must be locked after final PDF readability changes, not before.
- The four-role Sign pattern is now proven for employee-facing workflows.
- PO translations must use exact model/action/view/field/selection anchors; exported `ir.model.fields.selection` IDs are mandatory for robust SaaS selection translation.
- Deferred native bridge boundaries should be written into each pass to prevent silent scope creep.

### Final acceptance

Pass 22 is closed after 22F acceptance:

- module upgraded cleanly;
- F-0019 request record creation/defaulting worked;
- Other reason behavior worked;
- QWeb/PDF output was accepted after readability polish;
- four-role Sign lifecycle was implemented and accepted for send/sync behavior;
- generated/signed/certificate download controls were present;
- employee chatter/files artifact behavior was preserved;
- all Arabic UI/field/section/selection translations applied cleanly;
- no deferred native integration side effects occurred.
<!-- PASS22G_CLOSURE_END -->
