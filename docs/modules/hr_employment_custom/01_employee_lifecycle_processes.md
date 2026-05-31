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
| Leave native bridge | `hr.leave` after signed custom Marsellia leave request; not the primary Pass 19 form/process record |
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
| Administrative permissions | `x_hr.employee_permission_type`, `x_hr.employee_permission` |
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

### Revised Pass 19 anchor

Pass 19 uses a custom Marsellia leave process family:

```text
x_hr.employee_leave_type_policy
x_hr.employee_leave_request
```

This supersedes the earlier thin-overlay assumption where Pass 19 would primarily extend native `hr.leave`.

Native `hr.leave` remains the future operational Time Off bridge target after the Marsellia leave request is signed and approved.

### Purpose

Capture the official Marsellia leave request form, manual HR balance verification, generated PDF, Sign lifecycle, and employee chatter/files artifacts without forcing early integration into Odoo allocations, accruals, public holidays, work entries, or payroll.

### Leave policy helper

Model:

```text
x_hr.employee_leave_type_policy
```

Recommended fields:

```text
x_name
x_code
x_form_code
x_form_title
x_work_entry_type_id
x_leave_category
x_requires_balance_check
x_requires_acting_employee
x_requires_address_during_leave
x_requires_contact_during_leave
x_requires_hr_approval
x_requires_direct_manager_approval
x_requires_general_manager_approval
x_default_entitlement_days
x_default_emergency_limit_days
x_active
x_notes
```

The native bridge target is:

```text
x_work_entry_type_id -> hr.work.entry.type
```

Use existing native work-entry/time-off types as mapping targets where safe. Do not mutate or create payroll-facing work-entry types during the first Pass 19 model scaffold unless explicitly scoped.

### Initial policy records

Seed only minimal policies needed for the first form workflow:

```text
annual_leave
emergency_leave
sick_leave, only if required by the official form scope
unpaid_leave, only if required by the official form scope
```

Initial native mapping posture:

```text
annual_leave -> Paid Time Off where available
sick_leave -> Sick Time Off where available
unpaid_leave -> Unpaid where available
emergency_leave -> unmapped or explicitly mapped later after native policy review
```

### Operational request model

Model:

```text
x_hr.employee_leave_request
```

Recommended fields:

```text
x_name
x_employee_id
x_leave_type_policy_id
x_work_entry_type_id
x_reference_code
x_document_reference
x_state
x_request_date
x_leave_date_from
x_leave_date_to
x_requested_days
x_requested_calendar_days
x_excluded_weekend_days
x_excluded_public_holiday_days
x_current_balance_days
x_used_balance_days
x_remaining_balance_days
x_hr_balance_allowed
x_balance_verified_by_user_id
x_balance_verified_on
x_balance_notes
x_address_during_leave
x_contact_during_leave
x_acting_employee_id
x_reason
x_employee_notes
x_direct_manager_user_id
x_hr_user_id
x_general_manager_user_id
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
x_native_leave_id
x_native_leave_sync_state
x_native_leave_created_on
x_native_leave_notes
x_manual_decision_number
x_manual_decision_date
x_manual_decision_attachment_id
x_notes
```

### Lifecycle

Use the standard document lifecycle first:

```text
draft
-> generated
-> signature_requested
-> signed
```

Keep native bridge status separate:

```text
x_native_leave_sync_state = not_created / ready / created / error
```

This avoids polluting document/signature lifecycle with future integration state.

### Manual balance posture

The first production pass accepts manual HR balance verification.

Do not implement automatic entitlement, accrual, weekend, holiday, payroll, or allocation calculations in the first pass.

The form should capture:

```text
current balance
used balance
requested days
remaining balance
HR balance allowed
balance verified by
balance verified on
balance notes/source
```

### Native `hr.leave` bridge

The future bridge action should be explicit and guarded:

```text
Create Native Time Off
```

Initial bridge preconditions:

```text
x_state == signed
x_native_leave_id is empty
x_work_entry_type_id exists
x_employee_id exists
x_leave_date_from and x_leave_date_to exist
x_hr_balance_allowed is true, unless the policy does not require balance
```

The bridge must not auto-validate native leave in its first implementation.

### Out of first Pass 19 scope

```text
automatic balance calculation
Friday/Saturday exclusion engine
public-holiday exclusion engine
automatic accrual allocation
automatic native leave validation
payroll/work-entry/accounting effects
approval.request integration
GRC decision-instance integration
```

## 5. Administrative permissions

### Models

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

The older planning name `x_hr.employee_permission_request` was superseded for Pass 18 by the shorter operational model name `x_hr.employee_permission`.

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

### Permission record fields

Pass 18 starts with the fields required by F-0014 and F-0015, plus the standard artifact/sign/manual-decision family:

```text
x_employee_id
x_permission_type_id
x_permission_date
x_time_from
x_time_to
x_reason
x_employee_notes
x_state
x_reference_code
x_document_reference
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

Do not add `x_approval_request_id`, attendance-effect fields, payroll-effect fields, or leave-deduction fields in the first Pass 18 implementation unless explicitly rescoped.

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
Pass 18 — Administrative permissions F-0014/F-0015
Pass 19 — Leave requests
Pass 20 — Work assignments
Pass 21 — Performance evaluation
Pass 22 — Separation request
Pass 23 — Clearance/offboarding
```

## Pass 17 implementation boundary addendum — Training and Certifications

Pass 17 implements the training/certification foundation around:

```text
x_hr.employee_training_commitment
```

Pass 17 should prove the same lifecycle pattern already accepted for declarations and custody:

```text
draft
→ generated
→ signature_requested
→ signed
→ certificate_pending
→ certificate_received
→ closed
```

The first implementation should stay operationally useful but bounded:

- create the employee training commitment model and employee tab;
- generate the training undertaking PDF;
- send/sync the undertaking through native Odoo Sign;
- track certificate submission and certificate received date;
- copy generated/signed/certificate artifacts to employee chatter/files;
- create or update `hr.resume.line` only after model availability is verified in the current SaaS database;
- keep `hr.skill` / certification mapping optional and preflighted;
- keep payroll/finance recovery hooks as manual metadata only.

Do not add hard dependencies on payroll, accounting, approvals, LMS, planning, project, or unverified skill/certification models in the first Pass 17 build.

## Pass 17 refined architecture — F-0008 training commitment

Pass 17 is based on F-0008, not F-0012.

The training architecture is split into three layers:

```text
x_hr.training
→ x_hr.training_course
→ x_hr.employee_training_commitment
```

The employee training commitment is both:

- the employee-specific F-0008 undertaking record; and
- the employee participation instance for a specific course.

Pass 17 uses three independent state layers:

```text
x_state
```

Immediate form lifecycle:

```text
draft → generated → signature_requested → signed
```

```text
x_commitment_state
```

Higher obligation lifecycle:

```text
applied → committed → breached / fulfilled / cancelled
```

```text
x_participation_state
```

Training participation lifecycle:

```text
allocated → in_training → training_complete / training_incomplete
```

Pass 17 intentionally defers:

- certificate model deepening;
- native resume integration;
- native skills integration;
- payroll/accounting recovery;
- termination-triggered breach automation.

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

## Pass 18 implementation boundary addendum — Administrative Permissions F-0014/F-0015

Pass 18 implements the employee administrative permission forms:

```text
MCEP-HR-F-0014 — Exit Permission
MCEP-HR-F-0015 — Lateness Permission
```

The two uploaded forms share the same structural fields: personal employee data, permission date, from/to time period, reason, employee signature, direct manager approval, and HR approval.

Pass 18 therefore uses one typed operational process rather than two separate process models:

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

Seed only two permission types in the first pass:

```text
exit_permission     → MCEP-HR-F-0014
lateness_permission → MCEP-HR-F-0015
```

The initial lifecycle is the standard document/signature lifecycle:

```text
draft → generated → signature_requested → signed
```

Manager and HR approval blocks are represented as form fields/manual metadata in the first implementation. Do not implement attendance, leave, payroll, work-entry, approval-request, disciplinary, deduction, or GRC decision-instance effects in Pass 18.

<!-- PASS18G_LIFECYCLE_CLOSURE_START -->
## Pass 18 closure note — Administrative permissions F-0014/F-0015

Pass 18 is closed and accepted.

Implemented process family:

```text
x_hr.employee_permission_type
x_hr.employee_permission
```

Implemented forms:

```text
MCEP-HR-F-0014 — Exit Permission
MCEP-HR-F-0015 — Lateness Permission
```

The two forms share one operational model and one dynamic QWeb template. The permission type controls form code, title, and report routing.

Implemented source-record lifecycle:

```text
draft → generated → signature_requested → signed
```

Implemented Sign lifecycle:

```text
1. Employee
2. Direct Manager
3. HR Responsible
```

The permission process record remains the source of truth for generated PDF, Sign request metadata, signed PDF, Sign certificate, lifecycle dates, manual decision metadata, and notes.

Pass 18 deliberately did not implement:

```text
attendance effects
leave effects
payroll/work-entry effects
disciplinary/deduction effects
approval.request integration
GRC decision-instance integration
```

These remain later integration hooks only.
<!-- PASS18G_LIFECYCLE_CLOSURE_END -->

<!-- PASS19_LEAVE_LIFECYCLE_START -->
## Pass 19 accepted leave lifecycle

Pass 19 implements Marsellia official leave requests as a custom documentary process before native Odoo Time Off integration.

Primary process records:

    x_hr.employee_leave_type_policy
    x_hr.employee_leave_request

The leave request record owns:

- official request details;
- manual HR balance verification;
- address/contact/acting employee data;
- approval metadata;
- generated PDF artifact;
- Odoo Sign request metadata;
- signed PDF and certificate artifacts;
- future native `hr.leave` bridge fields.

Document lifecycle:

    draft -> generated -> signature_requested -> signed

Native bridge lifecycle is intentionally separate:

    not_created -> ready -> created -> blocked -> error

The document lifecycle must not be polluted with native Time Off bridge state. The signed Marsellia document is the approved documentary evidence. Native `hr.leave` creation is deferred to a later bridge pass.

Manual HR balance values are accepted in Pass 19. Automated balance, accrual, weekend, public-holiday, payroll, and native allocation computation are deferred.
<!-- PASS19_LEAVE_LIFECYCLE_END -->

<!-- PASS20_WORK_ASSIGNMENT_LIFECYCLE_START -->
## Pass 20 planned work assignment lifecycle

Pass 20 implements F-0017 Employee Work Assignment as a custom Marsellia documentary process.

Primary process record:

    x_hr.employee_work_assignment

The record owns:

- employee assignment location;
- assignment from/to dates;
- description / purpose;
- approval metadata;
- generated PDF artifact;
- Odoo Sign request metadata;
- signed PDF and certificate artifacts;
- manual decision metadata.

Document lifecycle:

    draft -> generated -> signature_requested -> signed

The visible statusbar remains:

    Draft -> Generated -> Signature Requested -> Signed

Pass 20 does not create or update Planning, Project, Timesheet, Attendance, Work Entry, Payroll, Fleet, approval.request, or GRC decision records.

F-0017 is handled as the approved documentary evidence workflow only. Downstream operational integrations are deferred to later pass cycles.
<!-- PASS20_WORK_ASSIGNMENT_LIFECYCLE_END -->

<!-- PASS20_ACCEPTED_WORK_ASSIGNMENT_START -->
## Pass 20 accepted implementation — F-0017 Work Assignment Authorization

Pass 20 implements Marsellia work assignments as a governed custom process record:

    x_hr.employee_work_assignment

The accepted scope is intentionally narrow:

- manual assignment location;
- manual assignment from/to dates;
- manual description and purpose;
- standard document reference and lifecycle metadata;
- derived direct manager / HR responsible users where available;
- manually selected general manager user;
- generated PDF;
- four-role native Odoo Sign lifecycle;
- employee chatter/files artifact posting;
- Arabic UI and state translations.

Pass 20 does not create or update Planning, Project, Timesheet, Attendance, Work Entry, Payroll, Fleet, Approval, or GRC records.

The visible lifecycle is:

    draft
    generated
    signature_requested
    signed

Document identity:

    MCEP-HR-F-0017
    تكليف بعمل إضافي
    Work Assignment Authorization

The accepted signer order is:

1. Employee
2. Direct Manager
3. HR Responsible
4. General Manager

This pattern is the reference for future simple governed employment documents that require manual process data but no immediate native operational integration.
<!-- PASS20_ACCEPTED_WORK_ASSIGNMENT_END -->

<!-- PASS21_PERFORMANCE_EVALUATION_START -->
## Pass 21 — F-0018 Employee Performance Evaluation

Pass 21 adds the governed employee performance evaluation workflow for Marsellia form F-0018.

Accepted architecture posture:

    x_hr.employee_performance_evaluation
    x_hr.employee_performance_evaluation_line

This pass uses a parent evaluation record and 12 score lines. The line model is required because F-0018 is a structured score matrix, not a flat request form.

The evaluation captures:

- employee;
- evaluation period from/to;
- 12 fixed evaluation item scores;
- direct manager recommendation;
- HR manager recommendation;
- standard artifact/sign/manual governance metadata.

The evaluation computes:

- total score out of 60;
- percentage;
- grade;
- star rating / score visual;
- document reference;
- evaluation label.

The visible lifecycle remains:

    Draft → Generated → Signature Requested → Signed

Pass 21 explicitly does not create Odoo Appraisals, payroll effects, salary adjustments, promotion/demotion records, disciplinary records, GRC decision instances, or any other native integration record.

Validation doctrine:

- Each item score must be between 1 and 5.
- Values below 1 must be blocked.
- Values above 5 must be blocked.
- PDF generation must not proceed unless all 12 items are present and scored.

Direct manager derivation doctrine:

- Direct manager user must be derived from `hr.employee.parent_id.user_id`.
- It must not silently default to the current user.
- If no valid direct manager user/email exists, Sign must block with a clear message.

Deferred technical debt:

- Audit earlier Pass 18–20 forms for any direct-manager fallback behavior that may have silently used the current user instead of `hr.employee.parent_id.user_id`.
<!-- PASS21_PERFORMANCE_EVALUATION_END -->
