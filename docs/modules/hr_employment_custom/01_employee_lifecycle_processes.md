# Employee Lifecycle Processes

## Purpose

This document is the consolidated process-model specification for `hr_employment_custom`.

It defines the post-handover employment lifecycle after a formal `hr.employee` exists.

Pass 13 handover itself is owned by:

```text
docs/modules/hr_recruitment_custom/pass_13_recruitment_to_employment_handover.md
```

Stage 1 pool-to-applicant handover is owned by:

```text
docs/modules/hr_pool/03_pool_to_applicant_handover.md
```

`hr_employment_custom` owns the employee lifecycle after the employee exists and the Pass 13 handover has prepared the native `hr.employee` Payroll tab readiness footprint.

---

## Global implementation doctrine

Use native Odoo models where they are the business source of truth.

Use custom models only where Marsellia has a process object Odoo does not natively model.

### Native anchors

| Lifecycle area | Native source of truth |
|---|---|
| Employee master | `hr.employee` |
| Contract/payroll overview | Native `hr.employee` Payroll tab fields populated by Pass 13 until `hr.contract` is proven safe in the current SaaS database |
| Leave | `hr.leave` |
| Attendance | `hr.attendance` |
| Payroll | Future payroll models/work entries only after Pass 25 preflight; no payroll entries in early lifecycle passes |
| Appraisal | `hr.appraisal` |
| Bank accounts | `res.partner.bank` |

### Custom model families

| Lifecycle area | Custom model family |
|---|---|
| Employee identification documents | `x_hr.employee_identification_document` |
| Employee declarations | `x_hr.employee_declaration` |
| Custody/assets | `x_hr.employee_custody_type`, `x_hr.employee_custody_item` |
| Training/certifications | `x_hr.employee_training_commitment` |
| Administrative permissions | `x_hr.employee_permission_type`, `x_hr.employee_permission_request` |
| Work assignments | `x_hr.employee_work_assignment` |
| Appraisal scoring lines | `x_hr.appraisal_evaluation_line` |
| Separation request | `x_hr.employee_separation_request` |
| Clearance/offboarding | `x_hr.employee_clearance`, `x_hr.employee_clearance_line` |

### Standard document artifact field family

Use this field family on custom process models where the process generates/signs a Marsellia document:

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

For native model extensions such as `hr.leave` and `hr.appraisal`, apply only the subset needed for the official Marsellia form.

---

## Cross-cutting lifecycle states

### Document/signature lifecycle

Default states:

```text
draft
generated
signature_requested
signed
cancelled
superseded
```

### Approval/request lifecycle

Use where business approval comes before generation/signature:

```text
draft
submitted
manager_review
hr_review
gm_approval
approved
rejected
cancelled
closed
```

### Custody lifecycle

```text
planned
issued
active
returned
lost
damaged
charged_to_employee
waived
closed
```

### Clearance lifecycle

```text
draft
in_progress
blocked
ready_for_final_approval
cleared
cancelled
```

---

## 0. Employee identification documents

### Model

```text
x_hr.employee_identification_document
```

### Purpose

Reusable typed employee identification records for employment lifecycle forms.

This is a small master-data extension on `hr.employee`, not a workflow registry and not a custody receipt.

Initial document types:

```text
id_card
passport
driving_license
company_id_card
```

### Core fields

```text
x_employee_id
x_document_type
x_document_number
x_issued_by
x_issue_place
x_issue_date
x_expiry_date
x_attachment_id
x_source_submission_id
x_source_attachment_id
x_notes
```

### Employee UI

Show these records on the employee form in a dedicated tab:

```text
الهوية / Identification
```

The UI may group the same one2many data into four sections:

```text
بطاقة شخصية
جواز سفر
رخصة قيادة
بطاقة الشركة
```

Do not create four separate models for the four document types.

### Handover integration

Pass 13J is owned by `hr_recruitment_custom` because the source action remains `hr.applicant`.

The handover action should soft-detect this model and create/update identification lines only when `x_hr.employee_identification_document` exists. This avoids a hard circular dependency between `hr_recruitment_custom` and `hr_employment_custom`.

### Consumption rule

Employment lifecycle documents should select an employee identification line only where the target form needs a typed ID document number or related issue/expiry metadata.

Common employee values should still be read directly from `hr.employee`:

```text
name
department_id.name
job_title
parent_id.name
identification_id
Payroll tab start-date field where available
```

---

## 1. Employee declarations

### Model

```text
x_hr.employee_declaration
```

### Purpose

Reusable signed employee declarations and undertakings.

Initial declaration types:

```text
exclusive_employment_declaration
occupational_safety_acknowledgment
human_waste_handling_employee_undertaking
human_waste_storage_supervisor_undertaking
```

### Core fields

Keep declaration records thin. Store lifecycle, document, signing, and light governance fields only.

```text
x_employee_id
x_declaration_type
x_selected_identification_document_id
x_reference_code
x_document_reference
x_state
x_required_by_role
x_required_before_assignment
x_grc_function_id
x_grc_functional_area_id
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
x_responsible_user_id
x_notes
```

Do not add broad declaration snapshot fields for employee name, department, job title, manager, national ID, or passport number during Pass 15. The QWeb reports should read those values from `hr.employee` and the selected `x_hr.employee_identification_document` record.

### Source value doctrine for Pass 15 declaration PDFs

Recommended report object mapping:

```text
o      = x_hr.employee_declaration
e      = o.x_employee_id
id_doc = o.x_selected_identification_document_id
```

Use native employee fields first:

| PDF value | Source |
|---|---|
| Employee name / full name | `e.name` |
| Department/division | `e.department_id.name` |
| Job title | `e.job_title` or safe native fallback |
| Direct supervisor | `e.parent_id.name` |
| National ID | `e.identification_id` |
| Personal ID / ID Passport No. | `id_doc.x_document_number` |
| Passport number | selected passport identity line, else native `e.passport_id` where available |
| Starting date | native employee Payroll tab start-date field populated by Pass 13 where available |

The generated QWeb PDF attachment is the locked evidence snapshot for the declaration lifecycle.

### Workflow

```text
draft
→ generated
→ signature_requested
→ signed
```

### Documents

User-facing normalized names:

| Declaration type | User-facing name |
|---|---|
| `exclusive_employment_declaration` | إقرار العمل الحصري وعدم الازدواج |
| `occupational_safety_acknowledgment` | إقرار السلامة المهنية |
| `human_waste_handling_employee_undertaking` | تعهد التعامل مع المخلفات البشرية |
| `human_waste_storage_supervisor_undertaking` | تعهد استلام وتخزين المخلفات البشرية |

Reference numbers remain technical metadata only.

### GRC hooks

Declarations can be required by:

```text
job
department
governed function
functional area
HSE role/risk category
```

Do not implement decision-instance linkage in the first declaration pass.

---

## 2. Custody and assets

### Models

```text
x_hr.employee_custody_type
x_hr.employee_custody_item
```

### Purpose

Track employee custody items and signed acknowledgements.

Start with ID card receipt. Later support PPE, uniforms, access cards, vehicles, laptops, radios, tools, and other assets.

### Custody type fields

```text
x_name
x_code
x_category
x_requires_serial_number
x_requires_expiry_date
x_requires_issue_date
x_requires_return
x_requires_condition
x_requires_replacement_fee
x_requires_signature
x_notes
```

### Custody item fields

```text
x_employee_id
x_custody_type_id
x_state
x_item_name
x_item_code
x_serial_number
x_issue_date
x_expiry_date
x_return_date
x_issue_condition
x_return_condition
x_replacement_fee
x_responsible_user_id
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_notes
```

### Structured property examples

| Custody type | Structured properties |
|---|---|
| ID card | card number, issue date, expiry date, replacement fee |
| PPE | PPE type, size, quantity, issue date, condition |
| Access card | card number, access scope, expiry, return state |
| Vehicle | vehicle reference, mileage, fuel card, authorization |
| Laptop/radio | serial number, assigned user, return condition |

### Offboarding integration

Clearance cannot close while custody lines remain unresolved unless an authorized override/manual decision attachment exists.

---

## 3. Training and certifications

### Model

```text
x_hr.employee_training_commitment
```

### Purpose

Track training undertakings, certification obligations, service commitment, and potential recovery/deduction hooks.

### Core fields

```text
x_employee_id
x_course_name
x_training_provider
x_training_location
x_training_start_date
x_training_end_date
x_cost_amount
x_cost_amount_words
x_currency_id
x_certificate_required
x_certificate_attachment_id
x_certificate_received_on
x_service_commitment_months
x_commitment_end_date
x_recovery_required_if_breached
x_recovery_amount
x_resume_line_id
x_skill_id
x_skill_level_id
x_state
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

### Workflow

```text
draft
→ approved/funded if approval is used
→ generated
→ signature_requested
→ signed
→ certificate_pending
→ certificate_received
→ closed
```

### Native integration

After completion, create or update:

```text
hr.resume.line
employee skill/certification records
```

No payroll deduction/accounting entry is created in the first training pass.

---

## 4. Leave requests

### Anchor

```text
hr.leave
```

### Purpose

Native Odoo remains the leave source of truth. Marsellia fields and QWeb/signing overlays are added only where needed.

### Extension fields

```text
x_address_during_leave
x_contact_during_leave
x_acting_employee_id
x_hr_balance_allowed
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_generated_on
x_sent_on
x_signed_on
x_notes
```

### Workflow

Use native `hr.leave` states and approvals as primary.

Marsellia official form generation/signing is secondary evidence.

### Activity hooks

Possible activities:

```text
HR balance verification
acting employee confirmation
direct manager approval
GM approval where required
```

---

## 5. Administrative permissions

### Models

```text
x_hr.employee_permission_type
x_hr.employee_permission_request
```

### Purpose

Typed employee authorizations/permissions such as temporary exit, late arrival, early departure, external errand, or other administrative permission.

### Permission type fields

```text
x_name
x_code
x_requires_date
x_requires_from_to_time
x_requires_location
x_requires_reason
x_requires_attachment
x_requires_direct_manager_approval
x_requires_hr_approval
x_requires_general_manager_approval
x_affects_attendance
x_deducts_leave_balance
x_creates_approval_request
x_notes
```

### Permission request fields

```text
x_employee_id
x_permission_type_id
x_request_date
x_from_datetime
x_to_datetime
x_duration_hours
x_location
x_reason
x_attachment_id
x_state
x_approval_request_id
x_manager_user_id
x_hr_user_id
x_general_manager_user_id
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

### Approvals app doctrine

`approval.request` may be linked as an auxiliary approval surface, but the custom permission request remains the business source of truth.

### Attendance integration

Do not write attendance/work entries in the first permission pass. Add explicit hooks/fields only.

---

## 6. Work assignments

### Model

```text
x_hr.employee_work_assignment
```

### Purpose

Controlled HR assignment approval and official signed assignment document.

### Fields

```text
x_employee_id
x_assignment_type
x_assignment_location
x_start_date
x_end_date
x_purpose
x_description
x_direct_manager_user_id
x_hr_user_id
x_general_manager_user_id
x_grc_function_id
x_requires_overtime_review
x_future_project_id
x_future_planning_slot_id
x_state
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

### Future integrations

```text
planning.slot
project.task
timesheet
work entries
overtime
payroll
fleet/site assignment
```

The first implementation must not create payroll effects automatically.

---

## 7. Performance evaluation

### Anchor

```text
hr.appraisal
```

### Extension model

```text
x_hr.appraisal_evaluation_line
```

### Purpose

Marsellia official performance evaluation with structured criteria scoring.

### Evaluation line fields

```text
x_appraisal_id
x_sequence
x_criterion_code
x_criterion_name_ar
x_criterion_name_en
x_score
x_weight
x_notes
```

### Appraisal extension fields

```text
x_total_score
x_score_max
x_grade
x_direct_manager_recommendation
x_hr_recommendation
x_general_manager_approval_notes
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

### Default scoring doctrine

```text
12 criteria
score range 1–5
maximum score 60
computed total
computed grade
```

### Skills integration

Do not automatically mutate employee skill levels in the first appraisal pass. Define a later controlled action to propose/update skills.

---

## 8. Separation request

### Model

```text
x_hr.employee_separation_request
```

### Purpose

Controlled request for resignation, non-renewal, medical termination, or other separation reason.

### Fields

```text
x_employee_id
x_request_type
x_requested_effective_date
x_reason
x_employee_notes
x_direct_manager_user_id
x_hr_user_id
x_general_manager_user_id
x_state
x_clearance_id
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

### Workflow

```text
draft
→ submitted
→ manager_review
→ hr_review
→ gm_approval
→ approved
→ clearance_started
→ closed
```

### Boundary

Do not archive the employee directly from the separation request. Approved separation starts clearance.

---

## 9. Clearance / offboarding

### Models

```text
x_hr.employee_clearance
x_hr.employee_clearance_line
```

### Purpose

Final offboarding clearance before native departure/archive.

### Clearance fields

```text
x_employee_id
x_separation_request_id
x_effective_date
x_state
x_department_clearance_complete
x_it_clearance_complete
x_stores_transport_clearance_complete
x_finance_clearance_complete
x_hr_clearance_complete
x_final_approval_user_id
x_final_approval_date
x_pdf_attachment_id
x_signed_attachment_id
x_sign_certificate_attachment_id
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

### Clearance line fields

```text
x_clearance_id
x_area
x_responsible_user_id
x_description
x_required
x_state
x_related_custody_item_id
x_attachment_id
x_notes
```

### Line areas

```text
department
it
stores_transport
finance
hr
final_approval
```

### Generation doctrine

Clearance lines should be generated from:

```text
employee department
open custody items
IT/system access checklist
finance/final settlement checklist
HR document checklist
role-specific obligations
```

### Custody enforcement

Clearance cannot become `cleared` while required custody lines are unresolved.

Allowed custody outcomes:

```text
returned
lost
damaged
charged_to_employee
waived
```

### Final native action

Only after clearance is complete should a later action trigger native departure/archive behavior.

---

## GRC hooks across processes

Use light GRC linkage now:

```text
x_grc_function_id
x_grc_functional_area_id
x_required_by_role
x_required_before_assignment
x_governance_notes
```

Keep decision-instance integration as a future Pass 26 upgrade.

Manual decision metadata remains the bridge:

```text
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
```

---

## First implementation order

```text
Pass 15A — Documentation/dependency correction
Pass 15B — Scaffold hr_employment_custom and employee Identification tab/model
Pass 13J — Recruitment handover update to populate employee identification lines if the model exists
Pass 15C+ — Employee declarations using thin declaration records and employee/identity source values
Pass 16 — Custody and assets
Pass 17 — Training and certifications
Pass 18 — Leave requests
Pass 19 — Administrative permissions
Pass 20 — Work assignments
Pass 21 — Performance evaluation
Pass 22 — Separation request
Pass 23 — Clearance/offboarding
```
